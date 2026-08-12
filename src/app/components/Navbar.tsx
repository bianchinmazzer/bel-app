"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import CartIcon from "./CartIcon";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Maneja los links de ancla (/#seccion). En el App Router, un <Link> a la
  // misma página no scrollea solo, así que lo hacemos a mano cuando ya estamos
  // en el home. Desde otra ruta dejamos que navegue normal a /#seccion.
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setIsMenuOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", href);
    }
  };

  const links = [
    { href: "/#inicio", label: "Inicio" },
    { href: "/#nosotros", label: "Nosotros" },
    { href: "/tienda", label: "Tienda" },
    { href: "/mayoristas", label: "Mayoristas" },
    { href: "/blog", label: "Blog" },
    { href: "/#contacto", label: "Contacto" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-neutral-50/95 backdrop-blur-navbar shadow-gold-sm border-b border-primary-200"
          : "bg-neutral-50 border-b border-primary-100"
      }`}
    >
      {/* Línea dorada fina superior — detalle editorial */}
      <div className="h-0.5 bg-gold-gradient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          {/* Logo + nombre */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-300"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary-300 ring-offset-2 ring-offset-neutral-50 group-hover:ring-primary-500 transition-all">
              <Image
                src="/bel-logo.png"
                alt="Bel Distribuciones"
                fill
                className="object-cover"
                sizes="44px"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-neutral-800 tracking-tight">
                BEL
              </span>
              <span className="text-[10px] text-primary-700 uppercase tracking-[0.2em] font-medium">
                Distribuciones
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-neutral-700 hover:text-primary-700 transition-colors relative group text-sm font-medium tracking-wide"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <div className="h-6 w-px bg-primary-200" />
            <CartIcon />
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-neutral-700 hover:text-primary-700 transition-colors p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 animate-slide-up border-t border-primary-100 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all text-sm font-medium"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-3">
              <CartIcon />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
