import { Check, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  loading?: boolean;
};

function Badge({ label, detected }: { label: string; detected: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        detected
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {detected ? <ShieldAlert className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      {label}: {detected ? "Detected" : "No"}
    </span>
  );
}

export function PrivacyBadges({ vpn, proxy, tor, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge label="VPN" detected={vpn} />
      <Badge label="Proxy" detected={proxy} />
      <Badge label="Tor" detected={tor} />
    </div>
  );
}
