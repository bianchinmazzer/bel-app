import {
  TruckIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function Servicios() {
  const servicios = [
    {
      icon: BuildingStorefrontIcon,
      title: "Distribución mayorista",
      description:
        "Vendemos a peluquerías, comercios, distribuidores y centros de estética con precios mayoristas y condiciones especiales por volumen.",
    },
    {
      icon: TruckIcon,
      title: "Envíos a todo el país",
      description:
        "Despachos por Andreani con seguimiento. Entregas en 3-7 días hábiles desde nuestro depósito en Bahía Blanca.",
    },
    {
      icon: UserGroupIcon,
      title: "Atención personalizada",
      description:
        "Un asesor dedicado para cada cliente. Respuesta por WhatsApp en horario comercial y asesoramiento sobre productos.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Productos originales",
      description:
        "Trabajamos únicamente con marcas reconocidas y proveedores oficiales. Garantía de origen en cada producto.",
    },
    {
      icon: SparklesIcon,
      title: "Amplio catálogo",
      description:
        "Peluquería, estética, hogar y cuidado personal. Un solo proveedor para múltiples categorías de tu negocio.",
    },
    {
      icon: CreditCardIcon,
      title: "Formas de pago flexibles",
      description:
        "Aceptamos Mercado Pago, transferencia bancaria y cuentas corrientes para clientes mayoristas con historial.",
    },
  ];

  return (
    <section
      id="servicios"
      className="py-24 md:py-32 px-4 relative overflow-hidden bg-gradient-to-b from-neutral-50 to-primary-50"
    >
      <div className="absolute inset-0 texture-paper opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Qué hacemos
            </span>
            <span className="h-px w-8 bg-primary-500" />
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 leading-tight mb-4">
            Un servicio integral para{" "}
            <span className="italic text-gradient-gold">tu comercio</span>
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Desde el pedido hasta la entrega, nos ocupamos de cada detalle para
            que vos te dediques solo a vender.
          </p>
        </div>

        {/* Grid de servicios — layout editorial con bordes sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-primary-200 rounded-2xl overflow-hidden shadow-gold-sm">
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className="bg-neutral-50 p-8 md:p-10 hover:bg-white transition-colors duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                <servicio.icon className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-xl text-neutral-800 mb-3">
                {servicio.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {servicio.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
