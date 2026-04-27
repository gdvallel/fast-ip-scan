import { useEffect, useRef } from "react";

const AD_KEY = "ac2472df786237d034b104c553762b92";

const SidebarAd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!ref.current || loaded.current) return;
    loaded.current = true;

    const optionsScript = document.createElement("script");
    optionsScript.text = `atOptions = { 'key': '${AD_KEY}', 'format': 'iframe', 'height': 60, 'width': 468, 'params': {} };`;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highperformanceformat.com/${AD_KEY}/invoke.js`;

    ref.current.appendChild(optionsScript);
    ref.current.appendChild(invokeScript);
  }, []);

  return <div ref={ref} style={{ width: 468, height: 60 }} />;
};

export default SidebarAd;
