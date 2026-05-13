import { Readable } from 'stream';

export default async function handler(req, res) {
  // 1. Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
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
