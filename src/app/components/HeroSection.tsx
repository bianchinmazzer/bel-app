import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden bg-gradient-to-b from-primary-50 via-neutral-50 to-neutral-50"
    >
      {/* Textura sutil de papel */}
      <div className="absolute inset-0 texture-paper opacity-60 pointer-events-none" />

      {/* Blob dorado decorativo */}
      <div
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #D4C4A0 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #B8A078 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Eyebrow — año de fundación */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="h-px w-12 bg-primary-400" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
            Desde 1998 · Bahía Blanca
          </span>
          <div className="h-px w-12 bg-primary-400" />
        </div>

        {/* Título principal — tipografía editorial */}
        <h1 className="text-center font-display font-bold leading-[0.95] tracking-tight text-neutral-800 mb-6 animate-slide-up">
          <span className="block text-5xl md:text-7xl lg:text-8xl">
            Distribuimos
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl italic font-medium text-gradient-gold mt-2">
            calidad
          </span>
          <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-neutral-600 mt-4">
            a toda la Argentina
          </span>
        </h1>

        {/* Bajada */}
        <p
          className="text-center text-base md:text-lg text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
        >
          Más de dos décadas distribuyendo productos de peluquería, estética y
          hogar a comercios de todo el país. Una trayectoria construida sobre
          confianza, servicio personalizado y compromiso con cada cliente.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          <Link
            href="/tienda"
            className="group bg-neutral-800 hover:bg-neutral-900 text-neutral-50 font-medium py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Ver tienda online</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/#contacto"
            className="group border-2 border-primary-600 hover:bg-primary-600 text-primary-700 hover:text-white font-medium py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            <span>Quiero ser cliente mayorista</span>
          </Link>
        </div>

        {/* Stats destacados — los números son el protagonista */}
        <div
          className="mt-24 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
        >
          <Stat number="27+" label="años de trayectoria" />
          <Stat number="600+" label="clientes activos" />
          <Stat number="100%" label="cobertura nacional" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center group">
      <div className="font-display font-bold text-4xl md:text-6xl text-gradient-gold mb-2 group-hover:scale-105 transition-transform duration-300">
        {number}
      </div>
      <div className="text-xs md:text-sm text-neutral-500 uppercase tracking-widest font-medium">
        {label}
      </div>
    </div>
  );
}
