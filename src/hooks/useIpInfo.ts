import { useQuery } from "@tanstack/react-query";
import { parseUserAgent } from "@/lib/ua";

export type IpInfo = {
  ip: string | null;
  ipv6: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  org: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  hosting: boolean;
  device: string;
  browser: string;
  os: string;
};

function countryFlag(cc?: string | null): string {
  if (!cc || cc.length !== 2) return "";
  const codePoints = cc
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

async function fetchIpInfo(): Promise<IpInfo> {
  const ua = parseUserAgent();

  // Fire requests in parallel
  const [ipv4Res, detailsRes, ipv6Res] = await Promise.allSettled([
    fetch("https://api.ipify.org?format=json").then((r) => r.json()),
    fetch("https://ipapi.co/json/").then((r) => r.json()),
    fetch("https://api64.ipify.org?format=json").then((r) => r.json()),
  ]);

  const ipv4 =
    ipv4Res.status === "fulfilled" ? (ipv4Res.value?.ip ?? null) : null;
  const details = detailsRes.status === "fulfilled" ? detailsRes.value : {};
  const ipv6Raw = ipv6Res.status === "fulfilled" ? ipv6Res.value?.ip ?? null : null;
  // api64 may return IPv4 if no IPv6 — only keep if it actually contains ":"
  const ipv6 = ipv6Raw && ipv6Raw.includes(":") ? ipv6Raw : null;

  const ip = ipv4 ?? details.ip ?? null;

  return {
    ip,
    ipv6,
    city: details.city ?? null,
    region: details.region ?? null,
    country: details.country_name ?? null,
    countryCode: details.country_code ?? null,
    org: details.org ?? details.asn ?? null,
    timezone: details.timezone ?? null,
    latitude: typeof details.latitude === "number" ? details.latitude : null,
    longitude: typeof details.longitude === "number" ? details.longitude : null,
    vpn: Boolean(details.security?.vpn),
    proxy: Boolean(details.security?.proxy),
    tor: Boolean(details.security?.tor),
    hosting: Boolean(details.security?.hosting),
    device: ua.device,
    browser: ua.browser,
    os: ua.os,
  };
}

export function useIpInfo() {
  const query = useQuery({
    queryKey: ["ip-info"],
    queryFn: fetchIpInfo,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refresh: () => query.refetch(),
    countryFlag: (cc?: string | null) => countryFlag(cc),
  };
}
