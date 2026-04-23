import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { DETAILS_UNAVAILABLE_MESSAGE, useIpInfo } from "./useIpInfo";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
      ...init,
    }),
  );
}

describe("useIpInfo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads enrichment from the primary provider", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("api.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        if (url.includes("ipapi.co")) {
          return jsonResponse({
            ip: "8.8.8.8",
            city: "Mountain View",
            region: "California",
            country_name: "United States",
            country_code: "US",
            org: "Google LLC",
            timezone: "America/Los_Angeles",
            latitude: 37.386,
            longitude: -122.0838,
          });
        }

        if (url.includes("api64.ipify.org")) {
          return jsonResponse({ ip: "2001:db8::1" });
        }

        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const { result } = renderHook(() => useIpInfo(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data?.ip).toBe("8.8.8.8"));

    expect(result.current.detailsLoaded).toBe(true);
    expect(result.current.detailsUnavailable).toBe(false);
    expect(result.current.detailsMessage).toBeNull();
    expect(result.current.data).toMatchObject({
      city: "Mountain View",
      region: "California",
      country: "United States",
      countryCode: "US",
      org: "Google LLC",
      timezone: "America/Los_Angeles",
      latitude: 37.386,
      longitude: -122.0838,
      ipv6: "2001:db8::1",
    });
  });

  it("falls back to GeoJS when the primary provider fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("api.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        if (url.includes("ipapi.co")) {
          return jsonResponse(
            { error: true, reason: "Rate limited" },
            { status: 429 },
          );
        }

        if (url.includes("get.geojs.io")) {
          return jsonResponse({
            ip: "8.8.8.8",
            city: "Atlanta",
            region: "Georgia",
            country: "United States",
            country_code: "US",
            organization_name: "Microsoft Corporation",
            timezone: "America/New_York",
            latitude: "33.7485",
            longitude: "-84.3871",
          });
        }

        if (url.includes("api64.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const { result } = renderHook(() => useIpInfo(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.detailsLoaded).toBe(true));

    expect(result.current.data).toMatchObject({
      city: "Atlanta",
      region: "Georgia",
      country: "United States",
      countryCode: "US",
      org: "Microsoft Corporation",
      timezone: "America/New_York",
      latitude: 33.7485,
      longitude: -84.3871,
    });
    expect(result.current.detailsUnavailable).toBe(false);
  });

  it("keeps the IP visible and surfaces a message when enrichment fails completely", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("api.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        if (url.includes("ipapi.co") || url.includes("get.geojs.io")) {
          return Promise.reject(new Error("Network error"));
        }

        if (url.includes("api64.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const { result } = renderHook(() => useIpInfo(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.detailsUnavailable).toBe(true));

    expect(result.current.data?.ip).toBe("8.8.8.8");
    expect(result.current.detailsLoaded).toBe(false);
    expect(result.current.detailsMessage).toBe(DETAILS_UNAVAILABLE_MESSAGE);
  });

  it("retries enrichment on refresh and clears the error message after success", async () => {
    let shouldFailEnrichment = true;

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("api.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        if (url.includes("ipapi.co")) {
          if (shouldFailEnrichment) {
            return Promise.reject(new Error("Primary provider down"));
          }

          return jsonResponse({
            ip: "8.8.8.8",
            city: "Miami",
            region: "Florida",
            country_name: "United States",
            country_code: "US",
            org: "Example ISP",
            timezone: "America/New_York",
            latitude: 25.7617,
            longitude: -80.1918,
          });
        }

        if (url.includes("get.geojs.io")) {
          if (shouldFailEnrichment) {
            return Promise.reject(new Error("Fallback provider down"));
          }

          return jsonResponse({
            ip: "8.8.8.8",
            city: "Miami",
            region: "Florida",
            country: "United States",
            country_code: "US",
            organization_name: "Example ISP",
            timezone: "America/New_York",
            latitude: "25.7617",
            longitude: "-80.1918",
          });
        }

        if (url.includes("api64.ipify.org")) {
          return jsonResponse({ ip: "8.8.8.8" });
        }

        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const { result } = renderHook(() => useIpInfo(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.detailsUnavailable).toBe(true));
    expect(result.current.detailsMessage).toBe(DETAILS_UNAVAILABLE_MESSAGE);

    shouldFailEnrichment = false;

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.detailsUnavailable).toBe(false));

    expect(result.current.detailsLoaded).toBe(true);
    expect(result.current.detailsMessage).toBeNull();
    expect(result.current.data).toMatchObject({
      city: "Miami",
      region: "Florida",
      country: "United States",
      org: "Example ISP",
    });
  });
});
