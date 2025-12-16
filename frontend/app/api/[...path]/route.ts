import { NextRequest, NextResponse } from 'next/server';




const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


async function getParams(context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }): Promise<{ path: string[] }> {
  if (context.params instanceof Promise) {
    return await context.params;
  }
  return context.params;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  const params = await getParams(context);
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  const params = await getParams(context);
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  const params = await getParams(context);
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  const params = await getParams(context);
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  const params = await getParams(context);
  return handleRequest(request, params, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    
    const path = `/${params.path.join('/')}`;
    
    
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_URL}${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[Proxy] ${method} ${path} -> ${url}`);

    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
        console.log(`[Proxy] Body:`, body);
      } catch {
        
      }
    }

    
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.log(`[Proxy] Response status: ${response.status}`);

    
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Erro ao processar requisição',
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

