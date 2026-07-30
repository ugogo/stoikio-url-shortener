export type HealthResult =
  { error: string; ok: false } | { health: HealthStatus; ok: true };

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

/** Never throws — a down API is a state the page renders. */
export async function fetchHealth(): Promise<HealthResult> {
  try {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
      return { error: `API responded with ${response.status}`, ok: false };
    }

    return { health: (await response.json()) as HealthStatus, ok: true };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown error';

    return { error: `Could not reach the API at ${API_URL}: ${message}`, ok: false };
  }
}
