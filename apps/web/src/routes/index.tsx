import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Activity, CircleAlert, CircleCheck, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fetchHealth } from '@/lib/health';

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => fetchHealth(),
});

function formatUptime(seconds: number) {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) return `${String(hours)}h ${String(minutes)}m`;
  if (minutes > 0) return `${String(minutes)}m ${String(total % 60)}s`;

  return `${String(total)}s`;
}

function Home() {
  const result = Route.useLoaderData();
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <Badge className="w-fit" variant="secondary">
          <Activity data-icon="inline-start" />
          stoikio
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Hello world
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          The web app is running. Below is the live status of the NestJS API it talks to.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>API health</CardTitle>
          <CardDescription>
            <code className="text-xs">GET /health</code>
          </CardDescription>
          <CardAction>
            {result.ok ? (
              <Badge data-testid="health-status" variant="outline">
                <CircleCheck className="text-emerald-600" data-icon="inline-start" />
                {result.health.status}
              </Badge>
            ) : (
              <Badge data-testid="health-status" variant="destructive">
                <CircleAlert data-icon="inline-start" />
                unreachable
              </Badge>
            )}
          </CardAction>
        </CardHeader>

        <CardContent>
          {result.ok ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Uptime</dt>
                <dd className="font-medium tabular-nums">
                  {formatUptime(result.health.uptime)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Checked at</dt>
                <dd className="font-medium tabular-nums">
                  {new Date(result.health.timestamp).toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm" role="alert">
              {result.error}
            </p>
          )}

          <Separator className="my-5" />

          <Button onClick={() => void router.invalidate()} size="sm" variant="outline">
            <RefreshCw />
            Refresh
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
