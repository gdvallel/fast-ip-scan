import { useQueries } from "@tanstack/react-query";
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

type NetworkDetails = Omit<IpInfo, "device" | "browser" | "os" | "ipv6">;

const EMPTY_NETWORK_INFO: NetworkDetails = {
  ip: null,
  city: null,
  region: null,
  country: null,
  countryCode: null,
  org: null,
  timezone: null,
  latitude: null,
  longitude: null,
  vpn: false,
  proxy: false,
  tor: false,
  hosting: false,
};

export const DETAILS_UNAVAILABLE_MESSAGE =
  "Location and network details are temporarily unavailable. Your IP is still shown above.";

const DETAILS_REQUEST_TIMEOUT_MS = 2_500;
const PRIMARY_DETAILS_URL = "https://ipapi.co/json/";
const FALLBACK_DETAILS_URL = "https://get.geojs.io/v1/ip/geo.json";

function countryFlag(cc?: string | null): string {
  if (!cc || cc.length !== 2) return "";
  const codePoints = cc
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return null;
  return trimmed;
}

export function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function normalizeIpapiDetails(payload: unknown): NetworkDetails {
  if (!isRecord(payload)) return { ...EMPTY_NETWORK_INFO };

  return {
    ip: readString(payload.ip),
    city: readString(payload.city),
    region: readString(payload.region),
    country: readString(payload.country_name),
    countryCode: readString(payload.country_code),
    org: readString(payload.org) ?? readString(payload.asn),
    timezone: readString(payload.timezone),
    latitude: parseCoordinate(payload.latitude),
    longitude: parseCoordinate(payload.longitude),
    vpn: payload.security?.vpn === true,
    proxy: payload.security?.proxy === true,
    tor: payload.security?.tor === true,
    hosting: payload.security?.hosting === true,
  };
}

export function normalizeGeoJsDetails(payload: unknown): NetworkDetails {
  if (!isRecord(payload)) return { ...EMPTY_NETWORK_INFO };

  return {
    ip: readString(payload.ip),
    city: readString(payload.city),
    region: readString(payload.region),
    country: readString(payload.country),
    countryCode: readString(payload.country_code),
    org: readString(payload.organization_name) ?? readString(payload.organization),
    timezone: readString(payload.timezone),
    latitude: parseCoordinate(payload.latitude),
    longitude: parseCoordinate(payload.longitude),
    vpn: false,
    proxy: false,
    tor: false,
    hosting: false,
  };
}

export function hasEnrichmentData(details: NetworkDetails): boolean {
  return Boolean(
    details.city ||
      details.region ||
      details.country ||
      details.countryCode ||
      details.org ||
      details.timezone ||
      details.latitude !== null ||
      details.longitude !== null,
  );
}

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DETAILS_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchPrimaryIp() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data?.ip ?? null;
}

async function fetchIpDetails(): Promise<NetworkDetails> {
  try {
    const primaryPayload = await fetchJsonWithTimeout(PRIMARY_DETAILS_URL);
    if (isRecord(primaryPayload) && primaryPayload.error) {
      throw new Error(readString(primaryPayload.reason) ?? "Primary details provider failed");
    }

    const normalizedPrimary = normalizeIpapiDetails(primaryPayload);
    if (hasEnrichmentData(normalizedPrimary)) {
      return normalizedPrimary;
    }
  } catch {
    // Try the browser-safe fallback before surfacing an error to the UI.
  }

  try {
    const fallbackPayload = await fetchJsonWithTimeout(FALLBACK_DETAILS_URL);
    const normalizedFallback = normalizeGeoJsDetails(fallbackPayload);
    if (hasEnrichmentData(normalizedFallback)) {
      return normalizedFallback;
    }
  } catch {
    // The final error is handled below so the UI gets one stable message.
  }

  throw new Error(DETAILS_UNAVAILABLE_MESSAGE);
}

async function fetchIpv6() {
  const response = await fetch("https://api64.ipify.org?format=json");
  const data = await response.json();
  return data?.ip ?? null;
}

export function useIpInfo() {
  const ua = parseUserAgent();
  const [ipQuery, detailsQuery, ipv6Query] = useQueries({
    queries: [
      {
        queryKey: ["ip-info", "primary-ip"],
        queryFn: fetchPrimaryIp,
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["ip-info", "details"],
        queryFn: fetchIpDetails,
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["ip-info", "ipv6"],
        queryFn: fetchIpv6,
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const ipv6Raw = ipv6Query.data;
  // api64 may return IPv4 if no IPv6 — only keep if it actually contains ":"
  const ipv6 = ipv6Raw && ipv6Raw.includes(":") ? ipv6Raw : null;
  const detailsLoaded = detailsQuery.isSuccess && hasEnrichmentData(detailsQuery.data);
  const detailsUnavailable = detailsQuery.isFetched && !detailsQuery.isFetching && !detailsLoaded;
  const detailsMessage = detailsUnavailable
    ? detailsQuery.error instanceof Error
      ? detailsQuery.error.message
      : DETAILS_UNAVAILABLE_MESSAGE
    : null;
  const ip = ipQuery.data ?? detailsQuery.data?.ip ?? null;
  const mergedDetails = detailsQuery.data ?? EMPTY_NETWORK_INFO;
  const hasData = Boolean(ip || detailsLoaded || ipv6);
  const data = hasData
    ? {
        ...EMPTY_NETWORK_INFO,
        ...mergedDetails,
        ip,
        ipv6,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
      }
    : undefined;
  const detailsLoading = !detailsLoaded && detailsQuery.isLoading;
  const error = !ip && !detailsQuery.data ? ipQuery.error ?? detailsQuery.error : undefined;

  return {
    data,
    isLoading: !ip && ipQuery.isLoading,
    isRefreshing:
      ipQuery.isRefetching || detailsQuery.isRefetching || ipv6Query.isRefetching,
    isDetailsLoading: detailsLoading,
    detailsLoaded,
    detailsUnavailable,
    detailsMessage,
    error,
    refresh: () => Promise.all([ipQuery.refetch(), detailsQuery.refetch(), ipv6Query.refetch()]),
    countryFlag: (cc?: string | null) => countryFlag(cc),
  };
}
