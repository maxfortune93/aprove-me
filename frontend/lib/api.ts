const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Obtém a URL base para requisições API
 * No cliente (browser), usa o proxy do Next.js para evitar CORS
 * No servidor, usa a URL do backend diretamente
 */
function getBaseUrl(): string {
  
  if (typeof window !== "undefined") {
    console.log("[API] Using proxy - window is defined");
    return "/api";
  }
  
  console.log("[API] Using direct backend URL - server-side");
  return API_URL;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;
  
  
  console.log("[API] Making request:", {
    endpoint,
    baseUrl,
    url,
    isBrowser: typeof window !== "undefined",
    method: options.method || "GET"
  });
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log("[API] Fetching:", url, "with config:", { method: config.method, headers: config.headers });
    const response = await fetch(url, config);

    console.log("[API] Response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      let errorMessage = "Erro ao processar requisição";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error("[API] Error response:", errorData);
      } catch {
        errorMessage = response.statusText || errorMessage;
        console.error("[API] Error status:", response.status, response.statusText);
      }

      const error: ApiError = {
        message: errorMessage,
        statusCode: response.status,
      };

      
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        
        window.dispatchEvent(new CustomEvent("auth:logout"));
        
        window.location.href = "/login";
      }

      throw error;
    }

    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.log("[API] Non-JSON response, returning empty object");
      return {} as T;
    }

    const data = await response.json();
    console.log("[API] Success:", data);
    return data;
  } catch (error) {
    console.error("[API] Fetch error:", error);
    if (error instanceof Error) {
      
      if (error.message.includes("CORS") || error.message.includes("Failed to fetch")) {
        throw {
          message: `Erro de CORS. URL chamada: ${url}. Verifique se o proxy está funcionando.`,
          statusCode: 0,
        } as ApiError;
      }
      throw {
        message: error.message,
      } as ApiError;
    }
    throw error;
  }
}

export function getApiUrl(): string {
  return API_URL;
}
