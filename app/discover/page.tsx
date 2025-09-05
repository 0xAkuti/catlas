export default function DiscoverPage() {
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Discover</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Explore recently published cats. Map and list coming soon.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards; will be replaced with live data */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4 h-40 bg-muted/20" />
        ))}
      </div>
    </section>
  );
}


