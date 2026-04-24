# Bel Distribuciones

Sitio web y e-commerce de **Bel Distribuciones** — distribución mayorista y minorista de productos de peluquería, estética y hogar en Argentina.

Construido como evolución del proyecto DALT: mismo stack, nueva identidad visual (paleta dorada) y con un **panel admin completo** para que los productos y categorías se administren desde la web sin tocar la base de datos.

---

## Stack

- **Next.js 16** (App Router + Turbopack) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Auth, PostgreSQL, Storage
- **Mercado Pago** — checkout y pagos
- **Resend** — emails transaccionales (confirmación de compra, notificación al dueño)
- **Twilio** (opcional) — notificaciones por WhatsApp
- **Andreani** — cotización de envíos (con fallback a tarifa estimada si no hay credenciales)
- **Zustand** — carrito persistente
- **Vercel Analytics**

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx                 # Layout raíz (fuentes, metadata)
│   ├── page.tsx                   # Home (landing)
│   ├── components/                # Componentes del sitio público
│   │   ├── SiteChrome.tsx         # Wrapper que oculta navbar/footer en /admin
│   │   ├── Navbar.tsx, Footer.tsx
│   │   ├── HeroSection.tsx, QuienesSomos.tsx, Servicios.tsx
│   │   ├── CategoriasDestacadas.tsx, ProductosDestacados.tsx
│   │   ├── ContactForm.tsx, WhatsappIcon.tsx, TrustStrip.tsx
│   │   ├── CartDrawer.tsx, CartIcon.tsx, ShopProductCard.tsx
│   │   ├── CategoryFilter.tsx, PriceDisplay.tsx
│   ├── tienda/                    # Tienda pública
│   ├── carrito/, checkout/        # Flujo de compra
│   ├── pago/exito, pendiente, error/
│   ├── terminos-condiciones/, politica-privacidad/
│   ├── admin/
│   │   ├── login/                 # Login público (fuera del grupo protected)
│   │   └── (protected)/           # Route group con layout de admin
│   │       ├── layout.tsx         # Sidebar + chequeo auth
│   │       ├── page.tsx           # Dashboard
│   │       ├── productos/         # Listado + nuevo + editar
│   │       ├── categorias/        # ABM inline
│   │       └── components/        # AdminSidebar, ProductForm, CategoriasManager
│   └── api/
│       ├── checkout/, webhook/    # Mercado Pago
│       ├── shipping/quote/        # Cotización Andreani
│       └── admin/                 # ABM + upload (protegidos con requireAdmin)
├── lib/
│   ├── supabase/                  # clients (browser, server, auth, service)
│   ├── mercadopago.ts, resend.ts, whatsapp.ts, formatters.ts
├── store/                         # Zustand (cart, cartDrawer)
├── types/                         # TypeScript interfaces
└── middleware.ts                  # Protege /admin/* (refresca sesión)
```

---

## Setup local

### 1. Clonar e instalar

```bash
npm install
cp .env.example .env.local
# editar .env.local con tus credenciales
```

### 2. Configurar Supabase

1. Crear un nuevo proyecto en [supabase.com](https://supabase.com) (recomendación: usar email separado al de DALT — ver nota al final).
2. Dashboard → **SQL Editor** → pegar y ejecutar **`supabase/migration.sql`**.
3. Ejecutar también **`supabase/migration_002_variants.sql`** (simplifica la tabla de variantes para uso de "tonos").
4. Dashboard → **Storage** → crear dos buckets **públicos**:
   - `product-images` (límite 5 MB por archivo)
   - `category-images` (límite 2 MB por archivo)
   
   Para cada bucket, agregar políticas de storage:
   ```sql
   -- Lectura pública
   CREATE POLICY "public read" ON storage.objects FOR SELECT 
     USING (bucket_id IN ('product-images', 'category-images'));
   -- Admins pueden subir/eliminar
   CREATE POLICY "admins upload" ON storage.objects FOR INSERT 
     WITH CHECK (bucket_id IN ('product-images', 'category-images'));
   CREATE POLICY "admins delete" ON storage.objects FOR DELETE 
     USING (bucket_id IN ('product-images', 'category-images'));
   ```
5. Dashboard → **Project Settings → API** → copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (¡secreto!)

### 3. Crear el primer admin

1. Dashboard → **Authentication → Users → Add user → Create new user**.
   - Email y contraseña (ej. `admin@beldistribuciones.com.ar`).
   - ✅ **Auto Confirm User** (sino no puede loguear).
2. Dashboard → **SQL Editor** → ejecutar:
   ```sql
   INSERT INTO admins (user_id, email, name, role)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@beldistribuciones.com.ar'),
     'admin@beldistribuciones.com.ar',
     'Admin Bel',
     'superadmin'
   );
   ```

### 4. Configurar Mercado Pago

- Developers → Credenciales → `Access Token`.
- Si Bel factura aparte de DALT: crear una **aplicación nueva** en la misma cuenta MP (o cuenta MP separada si también son razones sociales distintas).

### 5. Resend (emails)

- Crear cuenta en [resend.com](https://resend.com).
- Verificar el dominio `beldistribuciones.com.ar` (si lo tienen) o usar dominio de prueba.
- API Keys → copiar la key.

### 6. Levantar en dev

```bash
npm run dev
```

- Sitio público: http://localhost:3000
- Admin: http://localhost:3000/admin/login

---

## Deploy en Vercel

1. Push a GitHub.
2. En Vercel → **New Project** → importar el repo.
3. Configurar las **mismas variables** de `.env.local` en Vercel → Settings → Environment Variables.
4. Actualizar `NEXT_PUBLIC_BASE_URL` al dominio de producción (ej. `https://bel-distribuciones.vercel.app`).
5. Deploy.

### Webhook de Mercado Pago

Después del deploy, configurar en MP → Developers → **Notificaciones** → agregar URL:

```
https://tu-dominio.com/api/webhook
```

Eventos: `payment` y `merchant_order`.

---

## Flujo de trabajo para el admin (tu hermano)

1. Entra a `/admin/login` con su email y contraseña.
2. **Dashboard** muestra stats: productos, categorías, órdenes, facturación.
3. **Categorías**: crea las categorías que quiera (Peluquería, Hogar, Cuidado Personal, etc.). El slug se genera solo.
4. **Productos → Nuevo producto**:
   - Nombre, SKU (código único), descripción, categoría.
   - Sube fotos (drag click, múltiples) — la primera es la principal, pero se puede cambiar.
   - Precio en pesos (sin centavos), stock, peso en gramos (para cotizar envío).
   - Activo/Inactivo (oculta del sitio), Destacado (aparece en la home).
5. Editar/eliminar desde el listado.

### Variantes (tonos)

Si un producto viene en distintos tonos (ej. tintura Alfaparf en 1, 2, 3, 6.66...) usá el toggle **"Este producto tiene variantes"** en la sección Variantes del formulario.

- **Precio y stock son compartidos** con el producto base. Si cargás stock 50, es el total entre todos los tonos.
- Podés agregar variantes de a una (Enter después de cada una) o pegar varias separadas por coma: `1, 2, 3, 6.66, 7.1`.
- En la tienda, el cliente ve un dropdown "Elegí el tono" que es obligatorio antes de agregar al carrito.
- En el carrito, el email de confirmación y la notificación al dueño, el tono elegido aparece junto al nombre: "Tintura Alfaparf (Tono 6.66)".

---

## Notas importantes

### Sobre compartir infra con DALT

- **Supabase**: conviene usar cuenta/organización separada porque los límites del plan Free (500 MB DB, 1 GB Storage, 2 proyectos activos) se comparten entre proyectos de una misma org.
- **Vercel**: misma cuenta sirve, cada proyecto tiene sus propios límites.
- **Mercado Pago**: si Bel factura con CUIT distinto al de DALT, crear una **aplicación nueva** (mismo método desde la cuenta MP), sino las ventas aparecen mezcladas en el panel.

### Paleta de colores

Extraída del logo de Bel. Definida en `tailwind.config.ts`:

- **primary-500 `#B8A078`** — dorado principal del logo
- **primary-700 `#8B7654`** — dorado oscuro (hovers, acentos)
- **neutral-800 `#26251F`** — negro del logo (texto)

### Fuentes

- **Playfair Display** (serif) para títulos y acentos editoriales.
- **Inter** (sans-serif) para cuerpo.
- **JetBrains Mono** para eyebrows y detalles técnicos.

### Placeholders a reemplazar

- `+54 9 291 000 0000` — en Navbar, ContactForm, Footer, WhatsappIcon.
- `ventas@beldistribuciones.com.ar` — email del dueño.
- Marcas en `TrustStrip.tsx` (L'Oréal, Wella, etc.) — reemplazar por las reales.
- Timeline en `QuienesSomos.tsx` — hitos históricos reales.
- Fecha de fundación (1998) en varios lugares.

---

## Migración desde DALT

Este proyecto toma como base DALT Importaciones pero no comparte ni código ni infra:

- Nuevo schema con tabla `categories` dinámica (antes era `brands` hardcodeada).
- Panel admin completo (DALT no tenía — los productos se cargaban directo en Supabase).
- Estética "editorial/boutique" con paleta dorada (DALT era "startup/tech" azul).
- Clave localStorage del carrito cambió a `bel-cart` (para no colisionar con `dalt-cart` si alguien tiene abiertas ambas tabs).
- `statement_descriptor` de MP: `BEL DISTRIB` para que aparezca así en el resumen de tarjeta del cliente.
