import type { IpInfo } from "@/hooks/useIpInfo";

export function formatAllDetails(info: IpInfo): string {
  const lines = [
    `IP Address: ${info.ip ?? "—"}`,
    info.ipv6 ? `IPv6: ${info.ipv6}` : null,
    `Location: ${[info.city, info.region, info.country].filter(Boolean).join(", ") || "—"}`,
    `ISP / Org: ${info.org ?? "—"}`,
    `Timezone: ${info.timezone ?? "—"}`,
    `Device: ${info.device}`,
    `Browser: ${info.browser}`,
    `OS: ${info.os}`,
    `VPN: ${info.vpn ? "Detected" : "Not detected"}`,
    `Proxy: ${info.proxy ? "Detected" : "Not detected"}`,
    `Tor: ${info.tor ? "Detected" : "Not detected"}`,
  ].filter(Boolean);
  return lines.join("\n");
}
