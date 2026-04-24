import Image from "next/image";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function QuienesSomos() {
  return (
    <section
      id="nosotros"
      className="py-24 md:py-32 px-4 bg-neutral-50 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header con eyebrow */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Quiénes somos
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-neutral-800 leading-[1.05] max-w-3xl">
            Una historia de{" "}
            <span className="italic text-gradient-gold">familia, esfuerzo</span>{" "}
            y compromiso.
          </h2>
        </div>

        {/* Grid asimétrico — columna de texto + imagen/caja decorativa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Columna texto — más ancha */}
          <div className="lg:col-span-7 space-y-6 text-neutral-700 leading-relaxed">
            <p className="text-lg font-medium text-neutral-800 border-l-4 border-primary-500 pl-5 italic font-display">
              &ldquo;Empezamos en 1998 con una sola categoría: productos de
              peluquería. Hoy, 27 años después, distribuimos a más de 600
              comercios en toda Argentina.&rdquo;
            </p>

            <p>
              <strong className="text-neutral-800">Bel Distribuciones</strong>{" "}
              nació en Bahía Blanca como un proyecto familiar dedicado a la
              distribución de productos profesionales para peluquería y
              estética. Durante casi tres décadas construimos relaciones de
              confianza con peluquerías, comercios y centros de estética de todo
              el país.
            </p>

            <p>
              Hoy damos un paso más: <strong className="text-neutral-800">
              incorporamos nuevas categorías</strong> — productos para el hogar,
              cuidado personal y más — y sumamos canales digitales para llegar
              mejor a nuestros clientes mayoristas y al consumidor final.
            </p>

            <p>
              La gestión actual está en manos de la segunda generación, que
              combina la experiencia construida durante 27 años con nuevas
              herramientas digitales, e-commerce y logística moderna. Seguimos
              siendo la misma empresa familiar, con la misma atención
              personalizada de siempre.
            </p>

            {/* Bullets de valores */}
            <div className="pt-4 space-y-3">
              <ValueItem text="Atención personalizada, cliente por cliente" />
              <ValueItem text="Precios mayoristas competitivos" />
              <ValueItem text="Envíos a todo el país por Andreani" />
              <ValueItem text="Stock garantizado de marcas líderes" />
            </div>
          </div>

          {/* Columna derecha — caja decorativa con "timeline" de años */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative">
              {/* Caja principal */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-8 md:p-10 shadow-gold relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-400 rounded-full opacity-30 blur-3xl" />

                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary-100 mb-6 relative">
                  Nuestra trayectoria
                </p>

                <div className="relative space-y-6">
                  <TimelineYear
                    year="1998"
                    text="Fundación en Bahía Blanca. Distribución exclusiva de peluquería."
                  />
                  <TimelineYear
                    year="2010"
                    text="Expansión regional. Llegamos a más de 300 comercios."
                  />
                  <TimelineYear
                    year="2020"
                    text="Incorporación de la segunda generación al negocio."
                  />
                  <TimelineYear
                    year="2024"
                    text="Ampliación de rubros: hogar y cuidado personal."
                  />
                  <TimelineYear
                    year="Hoy"
                    text="Más de 600 clientes activos en todo el país."
                    highlight
                  />
                </div>
              </div>

              {/* Caja decorativa detrás */}
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-primary-200 rounded-2xl -z-10 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckBadgeIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
      <span className="text-neutral-700">{text}</span>
    </div>
  );
}

function TimelineYear({
  year,
  text,
  highlight = false,
}: {
  year: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex-shrink-0 font-display font-bold text-lg w-16 ${
          highlight ? "text-white" : "text-primary-100"
        }`}
      >
        {year}
      </div>
      <div
        className={`text-sm leading-relaxed ${
          highlight ? "text-white font-medium" : "text-primary-50/90"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
