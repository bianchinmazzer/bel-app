"use client";

import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { whatsappLink, WHATSAPP_DISPLAY } from "@/lib/contact";

const OWNER_EMAIL = "ventas@beldistribuciones.com.ar";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoCliente: "",
    mensaje: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tipoText =
      form.tipoCliente === "mayorista"
        ? "Cliente mayorista"
        : form.tipoCliente === "minorista"
          ? "Consumidor final"
          : "No especificado";

    const subject = encodeURIComponent(
      `Consulta desde web — ${tipoText}: ${form.nombre}`
    );
    const body = encodeURIComponent(
      `Nombre: ${form.nombre}\n` +
        `Email: ${form.email}\n` +
        `Teléfono: ${form.telefono}\n` +
        `Tipo de cliente: ${tipoText}\n\n` +
        `Mensaje:\n${form.mensaje}`
    );
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contacto"
      className="py-24 md:py-32 px-4 bg-gradient-to-b from-primary-50 to-neutral-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 texture-paper opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Contacto
            </span>
            <span className="h-px w-8 bg-primary-500" />
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 leading-tight mb-4">
            Hablemos de <span className="italic text-gradient-gold">tu negocio</span>
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Somos una empresa familiar. Te respondemos personalmente en menos de
            24 horas hábiles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Info de contacto — columna lateral */}
          <div className="lg:col-span-2 space-y-6">
            <ContactCard
              icon={EnvelopeIcon}
              title="Email"
              content={OWNER_EMAIL}
              href={`mailto:${OWNER_EMAIL}`}
            />
            <ContactCard
              icon={PhoneIcon}
              title="WhatsApp"
              content={WHATSAPP_DISPLAY}
              href={whatsappLink("¡Hola! Quiero hacer una consulta")}
            />
            <ContactCard
              icon={MapPinIcon}
              title="Ubicación"
              content="Bahía Blanca, Buenos Aires — Argentina"
            />
            <ContactCard
              icon={BuildingStorefrontIcon}
              title="Horario de atención"
              content="Lunes a Viernes · 9 a 18 hs"
            />
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-gold-sm border border-primary-100 p-8 md:p-10 space-y-5"
            >
              <FormField
                icon={UserIcon}
                name="nombre"
                label="Nombre completo"
                value={form.nombre}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  icon={EnvelopeIcon}
                  name="email"
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <FormField
                  icon={PhoneIcon}
                  name="telefono"
                  type="tel"
                  label="Teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                  Tipo de cliente
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <select
                    name="tipoCliente"
                    value={form.tipoCliente}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                  >
                    <option value="">Seleccioná una opción</option>
                    <option value="mayorista">
                      Mayorista (comercio / peluquería / distribuidor)
                    </option>
                    <option value="minorista">Consumidor final</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
                  Mensaje
                </label>
                <div className="relative">
                  <ChatBubbleLeftRightIcon className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Contanos qué necesitás..."
                    className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group w-full bg-neutral-800 hover:bg-primary-700 text-white font-medium py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Enviar mensaje</span>
                <PaperAirplaneIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  content,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
          {title}
        </p>
        <p className="text-neutral-800 font-medium text-sm">{content}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-primary-100 hover:border-primary-300 hover:bg-white transition-all"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-primary-100">
      {inner}
    </div>
  );
}

function FormField({
  icon: Icon,
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-600 font-medium mb-2">
        {label} {required && <span className="text-primary-600">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-sm"
        />
      </div>
    </div>
  );
}
