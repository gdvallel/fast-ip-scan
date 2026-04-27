import { ClipboardList, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IpCard } from "@/components/IpCard";
import { DetailsGrid } from "@/components/DetailsGrid";
import { MapPreview } from "@/components/MapPreview";
import { useIpInfo } from "@/hooks/useIpInfo";
import { formatAllDetails } from "@/lib/format";
import { toast } from "sonner";

const AdSlot = () => (
  <iframe
    src="/ad-frame.html"
    width={300}
    height={250}
    style={{ border: "none", display: "block", overflow: "hidden" }}
    title="ad"
  />
);

const Sidebar = () => (
  <aside className="hidden w-[300px] shrink-0 xl:flex">
    <div className="sticky top-4 flex flex-col gap-4">
      <AdSlot />
      <AdSlot />
      <AdSlot />
    </div>
  </aside>
);

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

      <div className="flex items-start justify-center gap-6 px-4">
        <Sidebar />

        <main className="w-full max-w-2xl space-y-6 px-0 pb-16 sm:px-6">
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

        <Sidebar />
      </div>

      <footer className="mx-auto max-w-2xl px-4 pb-10 text-center text-xs text-muted-foreground sm:px-6">
        Data from ipify, ipapi.co, and GeoJS. Privacy detection is best-effort.
      </footer>
    </div>
  );
};

export default Index;
