export default function Home() {
  return (
    <section className="py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          WorldCat
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Share cats found around the world. Upload a photo, we’ll detect if it’s
          a cat and help you mint a collectible NFT.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <div className="aspect-video w-full rounded-lg border bg-muted/30" />
      </div>
    </section>
  );
}
