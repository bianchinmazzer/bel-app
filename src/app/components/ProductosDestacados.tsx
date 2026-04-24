import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { createServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import ShopProductCard from "./ShopProductCard";

async function getDestacados(): Promise<Product[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("[ProductosDestacados] Error:", error);
    return [];
  }
  return data as Product[];
}

export default async function ProductosDestacados() {
  const productos = await getDestacados();

  if (productos.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-4 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary-500" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
                Productos destacados
              </span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-800 leading-tight">
              Lo que más{" "}
              <span className="italic text-gradient-gold">
                recomiendan nuestros clientes
              </span>
            </h2>
          </div>
          <Link
            href="/tienda"
            className="group inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 transition-colors font-medium text-sm self-start md:self-auto"
          >
            <span>Ver toda la tienda</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productos.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
