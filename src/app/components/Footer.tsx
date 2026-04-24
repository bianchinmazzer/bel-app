import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

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
              estética y hogar. Una empresa familiar con 27 años de trayectoria
              en el mercado argentino.
            </p>
            <div className="inline-block border border-primary-500/40 rounded-full px-4 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-300">
                Desde 1998 · Bahía Blanca
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
                { href: "/#servicios", label: "Servicios" },
                { href: "/#categorias", label: "Categorías" },
                { href: "/tienda", label: "Tienda online" },
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
                <PhoneIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/5492910000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-200 hover:text-primary-300 transition-colors"
                  >
                    +54 9 291 000 0000
                  </a>
                </div>
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
