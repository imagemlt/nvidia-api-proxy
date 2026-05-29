// app/v1/chat/completions/route.ts

export async function POST(request: Request) {
  // 目标 NVIDIA NIM API 地址
  const targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  // 从请求中获取 Authorization 头
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 获取客户端请求体
    const body = await request.text();

    // 构造转发请求
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Accept': request.headers.get('accept') || 'application/json',
      },
      body: body,
      signal: AbortSignal.timeout(110000), // 110s timeout
    };

    const response = await fetch(targetUrl, fetchOptions);

    // 处理流式响应
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      // 返回流式响应
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应，读取完整内容
      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'application/json',
        },
      });
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 可选：处理其他 HTTP 方法（如果 NIM API 支持 GET 等）
export async function GET(request: Request) {
  // 若有 GET 需求，类似处理
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}