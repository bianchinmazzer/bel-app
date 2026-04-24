export default function TrustStrip() {
  return (
    <section className="bg-neutral-800 py-10 px-4 overflow-hidden border-y-4 border-primary-500">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-300 text-center mb-6">
          Trabajamos con marcas reconocidas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-neutral-400">
          <span className="font-display italic text-lg md:text-xl opacity-60 hover:opacity-100 transition-opacity">
            L&apos;Oréal
          </span>
          <span className="font-display text-lg md:text-xl font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            WELLA
          </span>
          <span className="font-display italic text-lg md:text-xl opacity-60 hover:opacity-100 transition-opacity">
            Schwarzkopf
          </span>
          <span className="font-display text-lg md:text-xl font-bold opacity-60 hover:opacity-100 transition-opacity">
            ISSUE
          </span>
          <span className="font-display italic text-lg md:text-xl opacity-60 hover:opacity-100 transition-opacity">
            Alfaparf
          </span>
          <span className="font-display text-lg md:text-xl font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            KÉRASTASE
          </span>
        </div>
      </div>
    </section>
  );
}
