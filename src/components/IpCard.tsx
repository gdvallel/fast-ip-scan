import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  ip: string | null | undefined;
  ipv6: string | null | undefined;
  loading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
};

export function IpCard({ ip, ipv6, loading, isFetching, onRefresh }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success("IP copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <section
      aria-labelledby="ip-heading"
      className="animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Your public IP address
      </p>
      <h1 id="ip-heading" className="mt-3">
        {loading ? (
          <Skeleton className="h-12 w-64 sm:h-14 sm:w-80" />
        ) : ip ? (
          <span className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-5xl break-all">
            {ip}
          </span>
        ) : (
          <span className="font-mono text-2xl text-destructive">Unable to load</span>
        )}
      </h1>

      {ipv6 && !loading && (
        <p className="mt-2 font-mono text-xs text-muted-foreground break-all sm:text-sm">
          IPv6: {ipv6}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={handleCopy}
          disabled={!ip || loading}
          className="transition-transform hover:-translate-y-0.5"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy IP
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isFetching}
          className="transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </section>
  );
}
