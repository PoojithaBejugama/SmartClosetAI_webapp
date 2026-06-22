import { supabase } from "@/lib/supabaseClient";

// Every frontend-to-FastAPI request passes through this file.
// In local development, Vite proxies /api to http://127.0.0.1:8000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class ApiClient {
  constructor(private readonly baseUrl: string) {}

  // Supabase owns session storage and token refresh. Reading its session here
  // avoids keeping a second, potentially stale access token in localStorage.
  private async getToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session?.access_token ?? null;
  }

  // Shared implementation for JSON GET, POST, PUT, PATCH, and DELETE requests.
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers: customHeaders, ...rest } = options;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // backend/app/auth.py verifies this token and finds the matching local user.
    const token = await this.getToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    await this.handleUnauthorized(response);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    // Successful DELETE requests may intentionally return no response body.
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async handleUnauthorized(response: Response): Promise<void> {
    if (response.status !== 401) return;

    // Clear the rejected Supabase session and return to the login screen.
    await supabase.auth.signOut();
    window.location.href = "/auth";
    throw new Error("Unauthorized");
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File uploads use FormData instead of JSON.
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {};
    const token = await this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Do not set Content-Type. The browser must add the multipart boundary.
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    await this.handleUnauthorized(response);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Services share one client so URL, authentication, and errors stay consistent.
export const apiClient = new ApiClient(API_BASE_URL);
