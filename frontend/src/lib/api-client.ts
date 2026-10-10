import { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: Record<string, string[]> = {},
    public readonly correlationId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiSuccessResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  // Inject or forward correlation ID
  const correlationId = crypto.randomUUID();
  headers.set('X-Correlation-ID', correlationId);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Sanctum SPA session cookies
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    throw new ApiError(
      errorData?.error?.code || 'request_failed',
      errorData?.error?.message || `HTTP error ${response.status}`,
      response.status,
      errorData?.error?.details || {},
      errorData?.error?.correlation_id || correlationId
    );
  }

  return data as ApiSuccessResponse<T>;
}
