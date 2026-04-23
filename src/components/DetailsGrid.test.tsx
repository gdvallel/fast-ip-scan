import { render, screen } from "@testing-library/react";
import { DetailsGrid } from "./DetailsGrid";
import { MapPreview } from "./MapPreview";

const info = {
  ip: "8.8.8.8",
  ipv6: null,
  city: "Miami",
  region: "Florida",
  country: "United States",
  countryCode: "US",
  org: "Example ISP",
  timezone: "America/New_York",
  latitude: 25.7617,
  longitude: -80.1918,
  vpn: false,
  proxy: false,
  tor: false,
  hosting: false,
  device: "Desktop",
  browser: "Chrome 124",
  os: "macOS 14.4",
};

describe("DetailsGrid", () => {
  it("renders location, ISP, and timezone when enrichment exists", () => {
    render(<DetailsGrid info={info} loading={false} flag="🇺🇸" />);

    expect(screen.getByText("Miami, Florida, United States")).toBeInTheDocument();
    expect(screen.getByText("Example ISP")).toBeInTheDocument();
    expect(screen.getByText("America/New_York")).toBeInTheDocument();
  });

  it("shows an inline notice only when details are unavailable", () => {
    const message =
      "Location and network details are temporarily unavailable. Your IP is still shown above.";

    const { rerender } = render(
      <DetailsGrid
        info={info}
        loading={false}
        flag="🇺🇸"
        detailsUnavailable={true}
        detailsMessage={message}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(message);

    rerender(
      <DetailsGrid
        info={info}
        loading={false}
        flag="🇺🇸"
        detailsUnavailable={false}
        detailsMessage={null}
      />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("MapPreview", () => {
  it("renders the map iframe when coordinates are available", () => {
    render(<MapPreview lat={25.7617} lon={-80.1918} />);

    expect(screen.getByTitle("Approximate location map")).toBeInTheDocument();
  });
});
