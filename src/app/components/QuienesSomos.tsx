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
              &ldquo;Todo empezó en 1993, en Trenque Lauquen, con mi madre
              vendiendo esponjas y artículos de peluquería. Más de 30 años
              después, somos distribuidores oficiales de las mejores marcas
              profesionales.&rdquo;
            </p>

            <p>
              <strong className="text-neutral-800">Bel Distribuciones</strong>{" "}
              nació en 1993 en Trenque Lauquen como un emprendimiento familiar.
              Arrancó mi madre, vendiendo esponjas y artículos de peluquería.
              Con el tiempo, mi padre continuó el negocio y lo transformó en una
              distribuidora, convirtiéndose en{" "}
              <strong className="text-neutral-800">
                distribuidor oficial de Alfaparf
              </strong>
              .
            </p>

            <p>
              En el año 2000 la distribuidora se mudó a{" "}
              <strong className="text-neutral-800">Bahía Blanca</strong>, donde
              tiene su base hasta hoy, abasteciendo a peluquerías, comercios y
              centros de estética de la región y de todo el país.
            </p>

            <p>
              Hoy la gestión está en manos de la segunda generación, que combina
              la experiencia de más de tres décadas con nuevas herramientas
              digitales, e-commerce y logística moderna. Seguimos siendo la
              misma empresa familiar, con la atención personalizada de siempre.
            </p>

            {/* Bullets de valores */}
            <div className="pt-4 space-y-3">
              <ValueItem text="Atención personalizada, cliente por cliente" />
              <ValueItem text="Precios mayoristas competitivos" />
              <ValueItem text="Envíos a todo el país por Andreani" />
              <ValueItem text="Distribuidores oficiales de primeras marcas" />
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
                    year="1993"
                    text="Nace en Trenque Lauquen. Mi madre arranca vendiendo esponjas y artículos de peluquería."
                  />
                  <TimelineYear
                    year="2000"
                    text="La distribuidora se muda a Bahía Blanca, ya como distribuidor oficial de Alfaparf."
                  />
                  <TimelineYear
                    year="Hoy"
                    text="La segunda generación suma e-commerce y envíos a todo el país."
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
