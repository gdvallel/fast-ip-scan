export type DeviceInfo = {
  device: "Mobile" | "Tablet" | "Desktop";
  browser: string;
  os: string;
};

export function parseUserAgent(): DeviceInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  // Device type
  let device: DeviceInfo["device"] = "Desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/(Android)/i.test(ua) && !/Mobile/i.test(ua))) {
    device = "Tablet";
  } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = "Mobile";
  }

  // Browser
  let browser = "Unknown";
  const browserMatchers: Array<[RegExp, string]> = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ];
  for (const [re, name] of browserMatchers) {
    const m = ua.match(re);
    if (m) {
      browser = `${name} ${m[1].split(".")[0]}`;
      break;
    }
  }

  // OS
  let os = "Unknown";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X ([\d_]+)/.test(ua)) {
    const m = ua.match(/Mac OS X ([\d_]+)/);
    os = `macOS ${m?.[1].replace(/_/g, ".") ?? ""}`.trim();
  } else if (/Android ([\d.]+)/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    os = `Android ${m?.[1] ?? ""}`.trim();
  } else if (/iPhone OS ([\d_]+)/.test(ua) || /iPad; CPU OS ([\d_]+)/.test(ua)) {
    const m = ua.match(/OS ([\d_]+)/);
    os = `iOS ${m?.[1].replace(/_/g, ".") ?? ""}`.trim();
  } else if (/Linux/.test(ua)) os = "Linux";

  return { device, browser, os };
}
