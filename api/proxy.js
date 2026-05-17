import { Readable } from 'stream';

// In-memory store for rate limiting (persists across warm serverless invocations)
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 requests per minute

// Cleanup expired entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, WINDOW_MS);

// Security: Allowed Domains for Proxy (Prevent SSRF)
const ALLOWED_DOMAINS = [
  'archive.org',
  'github.com',
  'raw.githubusercontent.com',
  'corsproxy.io',
  'allorigins.win'
];

export default async function handler(req, res) {
  // 1. Strict CORS - Only allow the frontend origin
  const origin = req.headers.origin;
  const allowedOrigins = ['https://retro-rift.vercel.app', 'https://retrorift.online', 'http://localhost:5173'];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default to production domain to prevent wildcard abuse
    res.setHeader('Access-Control-Allow-Origin', 'https://retrorift.online');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- Rate Limiting Logic ---
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const data = rateLimitMap.get(ip);
    if (now - data.startTime > WINDOW_MS) {
      // Reset window
      rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
      data.count += 1;
      if (data.count > MAX_REQUESTS) {
        console.warn(`[RateLimit] Blocked request from IP: ${ip} (Count: ${data.count})`);
        return res.status(429).json({ error: 'Too Many Requests - Please wait a minute before requesting another game.' });
      }
    }
  }
  // ---------------------------

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    
    // SSRF Protection: Parse URL and validate protocol and domain
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      console.warn(`[Proxy-SSRF] Blocked invalid protocol: ${parsedUrl.protocol}`);
      return res.status(403).json({ error: 'Forbidden protocol' });
    }

    // SSRF Protection: Check against domain allowlist
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );

    // Block private IP ranges (basic protection)
    const isPrivateIP = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|169\.254\.)/.test(parsedUrl.hostname) || parsedUrl.hostname === 'localhost';

    if (!isAllowedDomain || isPrivateIP) {
      console.warn(`[Proxy-SSRF] Blocked unauthorized domain/IP: ${parsedUrl.hostname}`);
      return res.status(403).json({ error: 'Domain not allowed by proxy' });
    }

    console.log(`[Proxy] Fetching: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).send(`Origin error: ${response.statusText}`);
    }

    // 2. Forward headers
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // 3. Convert Web Stream to Node Stream and pipe
    // Node 18+ global fetch returns a web stream in response.body
    if (response.body) {
      const reader = response.body.getReader();
      const nodeStream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        }
      });
      nodeStream.pipe(res);
    } else {
      res.status(500).send('No response body from origin');
    }

  } catch (error) {
    console.error(`[Proxy] Fatal error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
