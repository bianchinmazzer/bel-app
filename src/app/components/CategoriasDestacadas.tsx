import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { createServerClient } from "@/lib/supabase/server";
import type { Category } from "@/types/product";

async function getCategorias(): Promise<Category[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(6);

  if (error) {
    console.error("[CategoriasDestacadas] Error:", error);
    return [];
  }
  return data as Category[];
}

export default async function CategoriasDestacadas() {
  const categorias = await getCategorias();

  if (categorias.length === 0) return null;

  return (
    <section
      id="categorias"
      className="py-16 md:py-24 px-4 bg-neutral-800 text-neutral-50 relative overflow-hidden"
    >
      {/* Detalle dorado decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary-400" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-300">
                Nuestras categorías
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight">
              Todo lo que necesitás,{" "}
              <span className="italic text-primary-300">en un solo lugar</span>
            </h2>
          </div>
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2 text-primary-300 hover:text-primary-200 transition-colors font-medium text-sm self-start md:self-auto"
          >
            <span>Ver tienda completa</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/tienda?categoria=${cat.slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-neutral-700 aspect-[4/3] hover:ring-2 hover:ring-primary-400 transition-all duration-300"
            >
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg,
                      ${idx % 2 === 0 ? "#8B7654" : "#6E5D42"} 0%,
                      ${idx % 2 === 0 ? "#B8A078" : "#A08A63"} 100%)`,
                  }}
                />
              )}

              {/* Overlay gradient oscuro para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />

              {/* Contenido */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-300 mb-1.5">
                  0{idx + 1}
                </p>
                <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-1.5 leading-tight">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-neutral-200 opacity-80 line-clamp-2 mb-4">
                    {cat.description}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 text-primary-300 text-sm font-medium group-hover:gap-3 transition-all">
                  <span>Explorar</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
