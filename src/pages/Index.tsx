import { ClipboardList, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IpCard } from "@/components/IpCard";
import { DetailsGrid } from "@/components/DetailsGrid";
import { MapPreview } from "@/components/MapPreview";
import { useIpInfo } from "@/hooks/useIpInfo";
import { formatAllDetails } from "@/lib/format";
import { toast } from "sonner";

const Index = () => {
  const {
    data,
    isLoading,
    isRefreshing,
    isDetailsLoading,
    detailsUnavailable,
    detailsMessage,
    error,
    refresh,
    countryFlag,
  } = useIpInfo();

  const handleCopyAll = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(formatAllDetails(data));
      toast.success("All details copied");
    } catch {
      toast.error("Failed to copy details");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Globe className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">What Is My IP</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-16 sm:px-6">
        {error && !data ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Couldn't fetch your IP details.
            </p>
            <Button variant="outline" onClick={() => refresh()} className="mt-3">
              Retry
            </Button>
          </div>
        ) : (
          <IpCard
            ip={data?.ip}
            ipv6={data?.ipv6}
            loading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={() => refresh()}
          />
        )}

        <div id="container-b37c9fd242e5177c814217e7a476492e" />

        <DetailsGrid
          info={data}
          loading={isDetailsLoading}
          flag={countryFlag(data?.countryCode)}
          detailsUnavailable={detailsUnavailable}
          detailsMessage={detailsMessage}
        />

        <MapPreview lat={data?.latitude ?? null} lon={data?.longitude ?? null} />

        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            onClick={handleCopyAll}
            disabled={!data}
            className="text-muted-foreground hover:text-foreground"
          >
            <ClipboardList className="h-4 w-4" />
            Copy all details
          </Button>
        </div>
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-10 text-center text-xs text-muted-foreground sm:px-6">
        Data from ipify, ipapi.co, and GeoJS. Privacy detection is best-effort.
      </footer>
    </div>
  );
};

export default Index;
