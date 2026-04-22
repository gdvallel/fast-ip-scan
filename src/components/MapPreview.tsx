type Props = {
  lat: number | null;
  lon: number | null;
};

export function MapPreview({ lat, lon }: Props) {
  if (lat == null || lon == null) return null;

  // OpenStreetMap embed (no API key required)
  const delta = 0.05;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <section aria-labelledby="map-heading" className="animate-fade-up">
      <h2 id="map-heading" className="sr-only">
        Approximate location
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <iframe
          title="Approximate location map"
          src={src}
          loading="lazy"
          className="h-64 w-full border-0"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Approximate location based on your IP — not a precise GPS location.
      </p>
    </section>
  );
}
