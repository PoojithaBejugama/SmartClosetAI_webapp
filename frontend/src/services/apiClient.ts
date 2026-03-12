// =============================================================================
// apiClient.ts — the app's "phone" for talking to the backend server
// =============================================================================
// Every time the app needs data (e.g. load a user's wardrobe, save an outfit),
// it makes an HTTP request to the backend API. Instead of writing raw fetch()
// calls everywhere, we centralise all of that here. This means:
//   - Auth headers are added automatically, so we never forget them
//   - Errors are handled consistently in one place
//   - Every other file just calls apiClient.get() / .post() etc. cleanly
// =============================================================================

// The root URL for all API calls.
// VITE_API_BASE_URL comes from the .env file (e.g. "https://myapi.com").
// If it isn't set (like in local dev), we fall back to "/api" which the
// Vite dev server proxies to the real backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
// TODO(BACKEND): Set VITE_API_BASE_URL in .env once your backend is running.
// Example: VITE_API_BASE_URL=http://localhost:8000
// If unset, the app falls back to demo/local behavior in useAuth.ts.

// This is a TypeScript "interface" — it defines the shape of options we can
// pass when making a request. We extend the built-in RequestInit type (which
// contains things like method, headers, etc.) but we loosen the type of
// "body" so we can pass any JS object and convert it to JSON automatically.
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // When a user logs in, we save their auth token in localStorage (the browser's
  // built-in key-value store). This helper reads it back so we can attach it to
  // every request — like showing your ID badge every time you enter a building.
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  // This is the core method that every other method (get, post, etc.) calls.
  // Think of it like a reusable "make a network request" recipe.
  // The <T> is a TypeScript "generic" — it means the caller tells us what
  // type of data to expect back (e.g. ClothingItem, AuthUser).
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Pull the body and any custom headers out of options separately,
    // because we need to handle them slightly differently from the rest.
    const { body, headers: customHeaders, ...rest } = options;

    // Every request we send will be JSON by default.
    // "Content-Type: application/json" tells the server "I'm sending JSON".
    // We also spread any custom headers the caller may have passed in.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // If the user is logged in, grab their token and add it to the request.
    // "Authorization: Bearer <token>" is how APIs know WHO is making the request.
    // It's like attaching your ID to every letter you send.
    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    // Assemble the final configuration object that fetch() needs.
    const config: RequestInit = {
      ...rest,
      headers,
    };

    // If there is a request body (e.g. form data being submitted), convert
    // the JavaScript object into a JSON string — that's what APIs expect.
    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    // Actually make the network request! fetch() is a browser built-in.
    // "await" pauses here until the server responds.
    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    // HTTP 401 means "not logged in" or "session expired".
    // We clear the stale token and user data from the browser and redirect
    // the user to the login page so they can sign in again.
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/auth";
      throw new Error("Unauthorized");
    }

    // response.ok is true for any 2xx status code (200, 201, etc.).
    // If it's false, something went wrong on the server.
    // We try to read the server's error message from the response body.
    // If that also fails (no JSON body), we fall back to a generic message.
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // HTTP 204 means "success, but there's nothing to return" (e.g. after a delete).
    // We return undefined cast to T so TypeScript stays happy.
    if (response.status === 204) {
      return undefined as T;
    }

    // All good! Parse the JSON response body and return it.
    // TypeScript will treat it as the type T the caller specified.
    return response.json();
  }

  // These are the public-facing HTTP method helpers. They all just call request()
  // with the right HTTP verb set. Each verb has a conventional meaning:
  //   GET    — fetch data, don't change anything on the server
  //   POST   — create something new, or trigger an action
  //   PUT    — replace an entire resource with new data
  //   PATCH  — update only specific fields of a resource
  //   DELETE — remove a resource
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Uploading a file (like a clothing photo) works differently from sending JSON,
  // so it gets its own method. Files are sent as "multipart/form-data", which is
  // a special format that can bundle text fields AND binary file data together.
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};

    // Still need to attach the auth token so the server knows who's uploading.
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // IMPORTANT: We deliberately do NOT set "Content-Type" here.
    // When you pass FormData to fetch(), the browser automatically sets
    // Content-Type to "multipart/form-data" AND adds a special "boundary"
    // string that separates the file parts. If we set it manually, we'd
    // break that, and the server wouldn't be able to parse the upload.
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    // Same error handling pattern as request() — try to get a useful message
    // from the server, otherwise surface the HTTP status code.
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Create ONE instance of ApiClient and export it.
// All other files import this single shared object, so the base URL
// and any shared state are consistent across the whole app.
export const apiClient = new ApiClient(API_BASE_URL);
