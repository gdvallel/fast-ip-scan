import {
  hasEnrichmentData,
  normalizeGeoJsDetails,
  normalizeIpapiDetails,
  parseCoordinate,
} from "./useIpInfo";

describe("useIpInfo normalization helpers", () => {
  it("normalizes the primary ipapi payload", () => {
    const details = normalizeIpapiDetails({
      ip: "8.8.8.8",
      city: "Mountain View",
      region: "California",
      country_name: "United States",
      country_code: "US",
      org: "Google LLC",
      timezone: "America/Los_Angeles",
      latitude: 37.386,
      longitude: -122.0838,
      security: {
        vpn: true,
        proxy: false,
        tor: false,
        hosting: true,
      },
    });

    expect(details).toMatchObject({
      ip: "8.8.8.8",
      city: "Mountain View",
      region: "California",
      country: "United States",
      countryCode: "US",
      org: "Google LLC",
      timezone: "America/Los_Angeles",
      latitude: 37.386,
      longitude: -122.0838,
      vpn: true,
      proxy: false,
      tor: false,
      hosting: true,
    });
  });

  it("normalizes the GeoJS fallback payload", () => {
    const details = normalizeGeoJsDetails({
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

    expect(details).toMatchObject({
      city: "Atlanta",
      region: "Georgia",
      country: "United States",
      countryCode: "US",
      org: "Microsoft Corporation",
      timezone: "America/New_York",
      latitude: 33.7485,
      longitude: -84.3871,
      vpn: false,
      proxy: false,
      tor: false,
      hosting: false,
    });
  });

  it("parses numeric coordinates from strings", () => {
    expect(parseCoordinate("37.751")).toBe(37.751);
    expect(parseCoordinate("-97.822")).toBe(-97.822);
    expect(parseCoordinate("not-a-number")).toBeNull();
  });

  it("maps partial responses to nulls while keeping usable enrichment detection accurate", () => {
    const details = normalizeIpapiDetails({
      ip: "8.8.8.8",
      country_name: "United States",
      country_code: "US",
    });

    expect(details.city).toBeNull();
    expect(details.region).toBeNull();
    expect(details.org).toBeNull();
    expect(details.latitude).toBeNull();
    expect(details.longitude).toBeNull();
    expect(hasEnrichmentData(details)).toBe(true);
  });
});
