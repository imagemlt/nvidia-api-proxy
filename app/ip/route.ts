// app/v1/chat/completions/route.ts

export async function POST(request: Request) {
  // 目标 NVIDIA NIM API 地址
  const targetUrl = 'https://ifconfig.me';//integrate.api.nvidia.com/v1/chat/completions';


  try {
    // 获取客户端请求体

    // 构造转发请求
    const fetchOptions: RequestInit = {
      method: 'GET'
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

