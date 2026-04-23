import { Building2, Globe2, Laptop, MapPin, Monitor, Network, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { IpInfo } from "@/hooks/useIpInfo";
import { PrivacyBadges } from "./PrivacyBadges";

type Props = {
  info?: IpInfo;
  loading: boolean;
  flag: string;
  detailsUnavailable?: boolean;
  detailsMessage?: string | null;
};

function Row({
  icon: Icon,
  label,
  children,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground/70">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-sm font-medium text-foreground">
          {loading ? <Skeleton className="h-4 w-32" /> : children}
        </div>
      </div>
    </div>
  );
}

export function DetailsGrid({
  info,
  loading,
  flag,
  detailsUnavailable = false,
  detailsMessage = null,
}: Props) {
  const location =
    [info?.city, info?.region, info?.country].filter(Boolean).join(", ") || "—";

  return (
    <section aria-labelledby="details-heading" className="animate-fade-up">
      <h2 id="details-heading" className="sr-only">
        Connection details
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Row icon={MapPin} label="Location" loading={loading}>
          <span className="flex items-center gap-2">
            {flag && <span className="text-base leading-none">{flag}</span>}
            <span className="truncate">{location}</span>
          </span>
        </Row>
        <Row icon={Building2} label="ISP / Organization" loading={loading}>
          <span className="truncate block">{info?.org ?? "—"}</span>
        </Row>
        <Row icon={Network} label="Connection" loading={loading}>
          {detailsUnavailable ? (
            <span className="text-muted-foreground">Unavailable</span>
          ) : (
            <PrivacyBadges
              vpn={!!info?.vpn}
              proxy={!!info?.proxy}
              tor={!!info?.tor}
              loading={loading}
            />
          )}
        </Row>
        <Row icon={Clock} label="Timezone" loading={loading}>
          {info?.timezone ?? "—"}
        </Row>
        <Row icon={Laptop} label="Device" loading={loading}>
          {info?.device ?? "—"}
        </Row>
        <Row icon={Monitor} label="Browser" loading={loading}>
          {info?.browser ?? "—"}
        </Row>
        <Row icon={Monitor} label="Operating system" loading={loading}>
          {info?.os ?? "—"}
        </Row>
        <Row icon={Globe2} label="IPv6" loading={loading}>
          <span className="font-mono text-xs break-all">
            {info?.ipv6 ?? "Not available"}
          </span>
        </Row>
      </div>
      {detailsUnavailable && detailsMessage ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground"
        >
          {detailsMessage}
        </p>
      ) : null}
    </section>
  );
}
