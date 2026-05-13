export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const requestUrl = new URL(req.url);
    const url = requestUrl.searchParams.get('url');

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decode the URL in case it was double-encoded
    const targetUrl = decodeURIComponent(url);

    console.log('Proxying request to:', targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new Response(`Origin server responded with ${response.status}: ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Prepare headers for the response
    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    
    // Forward critical headers from the source
    const contentType = response.headers.get('Content-Type');
    if (contentType) responseHeaders.set('Content-Type', contentType);
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    // Stream the body directly
    return new Response(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
