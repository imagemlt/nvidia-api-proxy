export async function GET(_request: Request) {
  const targetUrl = 'https://ifconfig.me';

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'curl' },
    });
    const contentType = response.headers.get('content-type') || 'text/plain; charset=utf-8';
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error?.message ?? 'unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
