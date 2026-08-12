/**
 * Contenido del blog de Bel Distribuciones.
 *
 * Los artículos viven acá como datos estructurados (sin CMS ni MDX) para
 * mantener el stack simple. Cada artículo se renderiza en /blog/[slug] y
 * alimenta el listado en /blog, el sitemap y el JSON-LD (BlogPosting).
 *
 * Para publicar un artículo nuevo: agregá un objeto a este array. El slug,
 * el sitemap y la metadata se derivan automáticamente.
 */

export interface ArticleSection {
  heading?: string
  paragraphs?: string[]
  list?: string[]
}

export interface Article {
  slug: string
  title: string
  description: string
  /** Fecha de publicación en formato ISO (YYYY-MM-DD). */
  date: string
  category: string
  /** Tiempo de lectura estimado en minutos. */
  readingMinutes: number
  keywords: string[]
  sections: ArticleSection[]
}

export const articles: Article[] = [
  {
    slug: 'como-elegir-coloracion-profesional-peluqueria',
    title: 'Cómo elegir la línea de coloración profesional para tu peluquería',
    description:
      'Guía para peluqueros: qué mirar al elegir una línea de coloración profesional, cómo armar el stock de tonos y por qué conviene comprar al distribuidor oficial.',
    date: '2026-03-10',
    category: 'Peluquería',
    readingMinutes: 6,
    keywords: [
      'coloración profesional peluquería',
      'línea de coloración mayorista',
      'tintura profesional Alfaparf',
      'stock de tonos peluquería',
    ],
    sections: [
      {
        paragraphs: [
          'La coloración es uno de los servicios más rentables de una peluquería, pero también uno de los que más capital inmoviliza en stock. Elegir bien la línea con la que trabajás define tu margen, la fidelidad de tus clientas y la cantidad de retoques que vas a hacer. En esta guía repasamos qué mirar antes de casarte con una marca.',
        ],
      },
      {
        heading: 'Cobertura, permanencia y línea de tonos',
        paragraphs: [
          'Una buena línea profesional tiene que ofrecerte una carta de color completa: naturales, cenizas, dorados, cobres, rojos, súper aclarantes y una línea de matices o correctores. Cuantos más tonos base tengas, menos vas a tener que mezclar para llegar al resultado exacto, y menos producto vas a desperdiciar.',
          'Fijate también en la permanencia real sobre cabello canoso. Una tintura que cubre el 100% de canas en un solo paso te ahorra tiempo de sillón y reclamos posteriores.',
        ],
      },
      {
        heading: 'Rendimiento por pomo',
        paragraphs: [
          'El precio del pomo dice poco si no lo cruzás con el rendimiento. Una coloración cremosa que rinde bien te permite hacer más servicios con la misma cantidad de producto. Calculá el costo por aplicación, no el costo por pomo: esa es la métrica que te dice cuánto ganás en cada servicio.',
        ],
      },
      {
        heading: 'Por qué comprar al distribuidor oficial',
        paragraphs: [
          'Comprar a un distribuidor oficial —como Bel para Alfaparf— te garantiza producto original, con trazabilidad y en condiciones de conservación correctas. El color profesional es química sensible: un producto vencido o mal almacenado te da resultados impredecibles arriba de la cabeza de tu clienta.',
          'Además, el distribuidor oficial te sostiene el abastecimiento de los tonos que más usás, algo clave para no cortar un servicio a la mitad porque se te acabó el 7.1.',
        ],
      },
      {
        heading: 'Cómo armar el stock inicial',
        list: [
          'Empezá por los naturales (serie .0) y los cenizas (.1), que son la base de la mayoría de los servicios.',
          'Sumá 2 o 3 súper aclarantes para las clientas de rubios.',
          'Tené siempre agua oxigenada en los tres volúmenes principales (10, 20 y 30).',
          'Reforzá con correctores de color para neutralizar sin repetir todo el proceso.',
          'Registrá qué tonos reponés más seguido: ese es tu verdadero catálogo.',
        ],
      },
      {
        paragraphs: [
          '¿Querés que te ayudemos a armar el stock inicial de coloración para tu peluquería? Escribinos y te asesoramos según el volumen de tu salón.',
        ],
      },
    ],
  },
  {
    slug: 'guia-alisado-keratina-salon',
    title: 'Guía de alisado y keratina: qué productos ofrecer en tu salón',
    description:
      'Diferencias entre alisado progresivo, keratina y botox capilar. Qué necesitás para sumar el servicio a tu peluquería y cómo elegir productos de calidad profesional.',
    date: '2026-04-18',
    category: 'Estética capilar',
    readingMinutes: 7,
    keywords: [
      'alisado progresivo mayorista',
      'keratina profesional',
      'botox capilar salón',
      'productos de alisado peluquería',
    ],
    sections: [
      {
        paragraphs: [
          'Los servicios de alisado y nutrición capilar tienen ticket alto y clientas que vuelven cada pocos meses. Sumarlos bien a tu carta puede transformar la facturación de tu peluquería. Pero hay que entender qué es cada cosa antes de comprar.',
        ],
      },
      {
        heading: 'Alisado progresivo, keratina y botox: no son lo mismo',
        paragraphs: [
          'El alisado progresivo busca reducir el frizz y disciplinar el cabello a lo largo de varias aplicaciones. La keratina repone la proteína del pelo y aporta brillo y manejabilidad. El botox capilar es un tratamiento de relleno y nutrición que no necesariamente alisa, sino que rellena la fibra dañada.',
          'Explicarle bien la diferencia a tu clienta es parte del servicio: evita expectativas equivocadas y reclamos.',
        ],
      },
      {
        heading: 'Qué mirar en un producto de alisado',
        list: [
          'Composición clara y ficha técnica del proveedor.',
          'Rendimiento por frasco según largo de cabello.',
          'Compatibilidad con cabello teñido o con mechas.',
          'Instrucciones de tiempo de pose y temperatura de planchita.',
          'Respaldo de una marca reconocida y distribuidor oficial.',
        ],
      },
      {
        heading: 'El equipamiento también cuenta',
        paragraphs: [
          'Un buen alisado depende tanto del producto como de las herramientas. Una planchita que mantiene temperatura estable y un secador de potencia adecuada hacen la diferencia en el resultado final y en el tiempo de sillón.',
        ],
      },
      {
        heading: 'Cómo cotizar el servicio',
        paragraphs: [
          'Calculá el costo real por aplicación: producto usado según el largo, más el desgaste de herramientas, más tu hora de trabajo. Sobre eso aplicás tu margen. Los servicios de alisado suelen soportar buen margen porque la clienta valora el resultado y la durabilidad.',
        ],
      },
      {
        paragraphs: [
          'En Bel trabajamos líneas profesionales de alisado y nutrición capilar de primeras marcas. Consultanos y te armamos un combo para arrancar con el servicio.',
        ],
      },
    ],
  },
  {
    slug: 'productos-sir-fausto-barberia',
    title: 'Barbería en crecimiento: los productos Sir Fausto que no pueden faltar',
    description:
      'La barbería no para de crecer en Argentina. Repasamos la línea Sir Fausto y qué productos conviene tener en el mostrador de tu barbershop para vender más.',
    date: '2026-05-22',
    category: 'Barbería',
    readingMinutes: 5,
    keywords: [
      'Sir Fausto mayorista',
      'productos de barbería',
      'línea barbershop Argentina',
      'pomada y cera para barba',
    ],
    sections: [
      {
        paragraphs: [
          'La barbería dejó de ser una moda para convertirse en un rubro estable. Cada vez más locales suman servicios de barba, y el cliente de barbería es de los que compra producto para llevarse a casa. Ahí está la oportunidad: el mostrador.',
        ],
      },
      {
        heading: 'Por qué Sir Fausto',
        paragraphs: [
          'Sir Fausto es una de las líneas de referencia en cuidado masculino y barbería en Argentina. Su catálogo cubre desde el afeitado hasta el peinado y el cuidado de la barba, con una identidad de marca que el cliente reconoce y busca.',
        ],
      },
      {
        heading: 'Los imprescindibles del mostrador',
        list: [
          'Aceites y bálsamos para barba: alta rotación y buen margen de reventa.',
          'Ceras y pomadas de peinado con distintos niveles de fijación.',
          'Shampoo y acondicionador específicos para barba.',
          'Productos de pre y post afeitado para el servicio en sillón.',
          'Colonias y fragancias para el cierre de la experiencia.',
        ],
      },
      {
        heading: 'Vender producto, no solo servicio',
        paragraphs: [
          'El cliente que se va con la barba impecable es el más propenso a comprar el producto que usaste. Tener stock en el mostrador y saber explicar para qué sirve cada cosa convierte cada corte en una segunda venta. Es margen que hoy quizás estás dejando pasar.',
        ],
      },
      {
        paragraphs: [
          'Somos distribuidores de Sir Fausto. Escribinos y armá el surtido inicial para el mostrador de tu barbería.',
        ],
      },
    ],
  },
  {
    slug: 'comprar-mayorista-peluqueria-mejorar-margen',
    title: 'Cómo comprar al por mayor para tu peluquería y mejorar el margen',
    description:
      'Comprar bien es la mitad de la ganancia. Consejos prácticos para peluquerías y comercios sobre cómo organizar las compras mayoristas y aprovechar mejor cada pedido.',
    date: '2026-06-30',
    category: 'Gestión del negocio',
    readingMinutes: 6,
    keywords: [
      'compra mayorista peluquería',
      'proveedor mayorista estética',
      'mejorar margen peluquería',
      'abastecer peluquería Argentina',
    ],
    sections: [
      {
        paragraphs: [
          'En un negocio de peluquería o estética, comprar bien es tan importante como cortar bien. El margen no se define solo en el sillón: se define también en cómo y a quién le comprás. Estas son algunas prácticas que marcan la diferencia.',
        ],
      },
      {
        heading: 'Concentrá proveedores',
        paragraphs: [
          'Comprarle a un solo distribuidor que cubra varias categorías —peluquería, estética, hogar— te simplifica la logística, te da más poder de negociación y reduce los costos de envío. En vez de cinco pedidos chicos, hacés uno grande y ordenás mejor tu caja.',
        ],
      },
      {
        heading: 'Comprá por rotación, no por impulso',
        list: [
          'Identificá tus 20 productos de mayor rotación: son el 80% de tu facturación.',
          'Reponé esos siempre, antes de que se agoten.',
          'Probá novedades en cantidades chicas antes de comprometer stock.',
          'Evitá comprar de más productos de baja rotación: es plata quieta.',
        ],
      },
      {
        heading: 'Aprovechá las condiciones mayoristas',
        paragraphs: [
          'Los precios mayoristas y las condiciones por volumen existen para que las uses. Consultá siempre el precio por cantidad, las bonificaciones y las formas de pago. En Bel, por ejemplo, trabajamos con cuenta corriente para clientes mayoristas con historial, además de Mercado Pago y transferencia.',
        ],
      },
      {
        heading: 'Pensá en la logística',
        paragraphs: [
          'Si estás lejos del proveedor, el envío importa. Trabajar con un distribuidor que despacha a todo el país con seguimiento —nosotros lo hacemos por Andreani— te permite abastecerte sin importar dónde tengas tu local, sin depender de retirar en persona.',
        ],
      },
      {
        paragraphs: [
          '¿Querés ordenar tus compras y mejorar el margen de tu peluquería? Contactanos y te asesoramos como distribuidor mayorista con más de 30 años en el rubro.',
        ],
      },
    ],
  },
]

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

/** Devuelve los artículos ordenados del más nuevo al más viejo. */
export function getArticlesSorted(): Article[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date))
}

/** Texto plano del artículo, para descripciones y el articleBody del JSON-LD. */
export function articlePlainText(article: Article): string {
  return article.sections
    .flatMap((s) => [...(s.paragraphs ?? []), ...(s.list ?? [])])
    .join(' ')
}
