import Image from "next/image";
import Link from "next/link";
import { EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { whatsappLink } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-200 relative">
      {/* Línea dorada superior */}
      <div className="h-1 bg-gold-gradient" />

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Logo + descripción */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary-500">
                <Image
                  src="/bel-logo.png"
                  alt="Bel Distribuciones"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-xl text-white">
                  BEL
                </span>
                <span className="text-[10px] text-primary-300 uppercase tracking-[0.2em]">
                  Distribuciones
                </span>
              </div>
            </div>
            <p className="text-neutral-300 leading-relaxed text-sm mb-5 max-w-sm">
              Distribución mayorista y minorista de productos de peluquería,
              estética y hogar. Una empresa familiar con más de 30 años de
              trayectoria en el mercado argentino.
            </p>
            <div className="inline-block border border-primary-500/40 rounded-full px-4 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-300">
                Desde 1993 · Bahía Blanca
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div className="lg:col-span-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest text-white mb-5">
              Navegación
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/#inicio", label: "Inicio" },
                { href: "/#nosotros", label: "Nosotros" },
                { href: "/tienda", label: "Tienda online" },
                { href: "/mayoristas", label: "Venta mayorista" },
                { href: "/blog", label: "Blog" },
                { href: "/#contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-primary-300 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-primary-400 transition-all duration-300 group-hover:w-4" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="lg:col-span-5">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest text-white mb-5">
              Contacto
            </h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:ventas@beldistribuciones.com.ar"
                    className="text-neutral-200 hover:text-primary-300 transition-colors"
                  >
                    ventas@beldistribuciones.com.ar
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <a
                  href={whatsappLink("¡Hola! Quiero hacer una consulta")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-200 hover:text-primary-300 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    Ubicación
                  </p>
                  <p className="text-neutral-200">
                    Bahía Blanca, Buenos Aires · Argentina
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Bel Distribuciones. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terminos-condiciones"
              className="text-xs text-neutral-500 hover:text-primary-300 transition-colors"
            >
              Términos y condiciones
            </Link>
            <Link
              href="/politica-privacidad"
              className="text-xs text-neutral-500 hover:text-primary-300 transition-colors"
            >
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
