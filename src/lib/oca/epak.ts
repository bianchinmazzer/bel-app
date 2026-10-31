/**
 * Cliente del web service OCA e-Pak (SOAP 1.1 / XML).
 *
 * OCA no tiene API REST: todo pasa por un único endpoint .asmx con SOAP.
 * Namespace (literal, así lo publica OCA): `#Oca_e_Pak`.
 * Endpoint: http(s)://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx
 *
 * Este módulo cubre las operaciones que usa la tienda:
 *   - tarifarEnvio()      → `Tarifar_Envio_Corporativo` (cotización, hot path del checkout).
 *   - sucursalesPorCP()   → `GetCentrosImposicionConServiciosByCP` (retiro en sucursal).
 *   - crearEnvio()        → `IngresoORMultiplesRetiros_v2` (alta de la orden de retiro).
 *
 * Auth: no hay token. La cotización se firma con `Cuit` + `Operativa` (número de
 * operativa e-Pak, distinto para domicilio y sucursal). El alta de envío suma
 * usuario/clave de e-Pak + Nro de cuenta corriente. Todo se gestiona con el alta
 * de cuenta e-Pak (comercial de OCA) y vive en variables de entorno.
 *
 * Estilo: sin dependencias de XML/SOAP; se arma el sobre a mano y se parsea la
 * respuesta con regex sobre el diffgram (mismo criterio dependency-free que el
 * resto de las integraciones del proyecto).
 */

const ENDPOINT =
  process.env.OCA_EPAK_URL ??
  'https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx'

/** CUIT de la cuenta e-Pak de Bel (sin guiones). */
const OCA_CUIT = process.env.OCA_CUIT
/** Nº de operativa e-Pak para envíos a domicilio (puerta a puerta). */
const OCA_OPERATIVA_DOMICILIO = process.env.OCA_OPERATIVA_DOMICILIO
/** Nº de operativa e-Pak para envíos a sucursal (puerta a sucursal). */
const OCA_OPERATIVA_SUCURSAL = process.env.OCA_OPERATIVA_SUCURSAL
/** Usuario/clave de e-Pak (solo para el alta de envíos, no para cotizar). */
const OCA_USER = process.env.OCA_USER
const OCA_PASSWORD = process.env.OCA_PASSWORD
/** Nº de cuenta corriente e-Pak (para el alta de envíos). */
const OCA_NRO_CUENTA = process.env.OCA_NRO_CUENTA

const NS = '#Oca_e_Pak'

export type OcaDeliveryType = 'D' | 'S'

/** ¿Están las credenciales mínimas para COTIZAR contra OCA? */
export function isOcaQuoteConfigured(deliveryType: OcaDeliveryType = 'D'): boolean {
  const operativa =
    deliveryType === 'S' ? OCA_OPERATIVA_SUCURSAL : OCA_OPERATIVA_DOMICILIO
  return Boolean(OCA_CUIT && operativa)
}

/** ¿Están las credenciales para DAR DE ALTA envíos (alta + etiqueta)? */
export function isOcaShipConfigured(): boolean {
  return Boolean(OCA_CUIT && OCA_USER && OCA_PASSWORD && OCA_NRO_CUENTA)
}

// ---------------------------------------------------------------------------
// Cotización — Tarifar_Envio_Corporativo
// ---------------------------------------------------------------------------

export interface TarifarParams {
  /** Peso total del envío en kg. */
  pesoKg: number
  /** Volumen total en m³ (L×A×H de la caja, en metros). */
  volumenM3: number
  cpOrigen: string
  cpDestino: string
  cantidadPaquetes: number
  /** Valor declarado en pesos (entero). */
  valorDeclarado: number
  deliveryType: OcaDeliveryType
}

export interface TarifarResult {
  /** Precio del envío en ARS (con decimales). */
  precioArs: number
  /** Plazo de entrega en días hábiles (texto libre que informa OCA). */
  plazoDias: string
  /** Ámbito informado por OCA (Local / Nacional / etc.), si viene. */
  ambito?: string
}

/**
 * Cotiza un envío con `Tarifar_Envio_Corporativo`. Devuelve null si OCA no
 * responde una tarifa válida (el que llama decide el fallback).
 */
export async function tarifarEnvio(
  params: TarifarParams
): Promise<TarifarResult | null> {
  const operativa =
    params.deliveryType === 'S' ? OCA_OPERATIVA_SUCURSAL : OCA_OPERATIVA_DOMICILIO
  if (!OCA_CUIT || !operativa) return null

  // OCA usa coma decimal y espera enteros en los CP.
  const peso = params.pesoKg.toFixed(2).replace('.', ',')
  const volumen = params.volumenM3.toFixed(4).replace('.', ',')
  const cpOrigen = onlyDigits(params.cpOrigen)
  const cpDestino = onlyDigits(params.cpDestino)

  const bodyInner = `<Tarifar_Envio_Corporativo xmlns="${NS}">
      <PesoTotal>${peso}</PesoTotal>
      <VolumenTotal>${volumen}</VolumenTotal>
      <CodigoPostalOrigen>${cpOrigen}</CodigoPostalOrigen>
      <CodigoPostalDestino>${cpDestino}</CodigoPostalDestino>
      <CantidadPaquetes>${Math.max(1, Math.round(params.cantidadPaquetes))}</CantidadPaquetes>
      <ValorDeclarado>${Math.round(params.valorDeclarado)}</ValorDeclarado>
      <Cuit>${OCA_CUIT}</Cuit>
      <Operativa>${operativa}</Operativa>
    </Tarifar_Envio_Corporativo>`

  const xml = await soapCall('Tarifar_Envio_Corporativo', bodyInner)
  if (!xml) return null

  // La respuesta es un DataSet (diffgram). Tomamos el primer registro de la
  // tabla `Tarifar`, con los campos Precio / Ambito / PlazoEntrega.
  const precioRaw = firstTag(xml, 'Precio')
  if (precioRaw == null) return null
  const precioArs = parseOcaNumber(precioRaw)
  if (!Number.isFinite(precioArs) || precioArs <= 0) return null

  const plazo = firstTag(xml, 'PlazoEntrega')
  const ambito = firstTag(xml, 'Ambito') ?? undefined

  return {
    precioArs,
    plazoDias: plazo ? `${plazo} días hábiles` : 'a coordinar',
    ambito,
  }
}

// ---------------------------------------------------------------------------
// Sucursales por CP — GetCentrosImposicionConServiciosByCP
// ---------------------------------------------------------------------------

export interface OcaSucursal {
  idCentroImposicion: string
  sucursal: string
  calle: string
  numero: string
  localidad: string
  provincia: string
  cp: string
}

/** Lista los centros de imposición (sucursales) que operan para un CP. */
export async function sucursalesPorCP(cp: string): Promise<OcaSucursal[]> {
  const bodyInner = `<GetCentrosImposicionConServiciosByCP xmlns="${NS}">
      <CodigoPostal>${onlyDigits(cp)}</CodigoPostal>
    </GetCentrosImposicionConServiciosByCP>`

  const xml = await soapCall('GetCentrosImposicionConServiciosByCP', bodyInner)
  if (!xml) return []

  const rows = allBlocks(xml, 'Table')
  return rows.map((r) => ({
    idCentroImposicion: firstTag(r, 'idCentroImposicion') ?? '',
    sucursal: firstTag(r, 'Sucursal') ?? '',
    calle: firstTag(r, 'Calle') ?? '',
    numero: firstTag(r, 'Numero') ?? '',
    localidad: firstTag(r, 'Localidad') ?? '',
    provincia: firstTag(r, 'Provincia') ?? '',
    cp: firstTag(r, 'CodigoPostal') ?? '',
  }))
}

// ---------------------------------------------------------------------------
// Alta de envío — IngresoORMultiplesRetiros_v2
// ---------------------------------------------------------------------------
// NOTA: scaffold análogo al de PAQ.AR. Requiere la estructura XML de la Orden de
// Retiro (OR) que detalla la guía de OCA (OCA Integración API's.pdf). Se deja el
// esqueleto de auth y llamada; el armado del XML de la OR se completa cuando esté
// el número de cuenta / operativa reales para probar contra el ambiente de OCA.

export interface CrearEnvioResult {
  /** Nº de envío / OR generado por OCA (para tracking y etiqueta). */
  numeroEnvio: string
}

export async function crearEnvio(orXml: string): Promise<CrearEnvioResult> {
  if (!isOcaShipConfigured()) {
    throw new Error(
      'OCA e-Pak no está configurado para alta de envíos (faltan OCA_USER / OCA_PASSWORD / OCA_NRO_CUENTA).'
    )
  }

  // `IngresoORMultiplesRetiros_v2` recibe usr, psw, el XML de la OR (como string
  // escapado) y flags de confirmación/impresión de etiqueta.
  const bodyInner = `<IngresoORMultiplesRetiros_v2 xmlns="${NS}">
      <usr>${OCA_USER}</usr>
      <psw>${OCA_PASSWORD}</psw>
      <XML_Datos>${escapeXml(orXml)}</XML_Datos>
      <ConfirmarRetiro>true</ConfirmarRetiro>
      <DiasHastaRetiro>1</DiasHastaRetiro>
    </IngresoORMultiplesRetiros_v2>`

  const xml = await soapCall('IngresoORMultiplesRetiros_v2', bodyInner)
  if (!xml) throw new Error('OCA e-Pak no respondió al alta de envío.')

  const numeroEnvio = firstTag(xml, 'NumeroEnvio') ?? firstTag(xml, 'OrdenRetiro')
  if (!numeroEnvio) {
    throw new Error(`OCA e-Pak no devolvió NumeroEnvio. Respuesta: ${xml.slice(0, 500)}`)
  }
  return { numeroEnvio }
}

// ---------------------------------------------------------------------------
// SOAP transport + helpers
// ---------------------------------------------------------------------------

/** Ejecuta una operación SOAP 1.1 y devuelve el XML de respuesta (o null). */
async function soapCall(operation: string, bodyInner: string): Promise<string | null> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${bodyInner}
  </soap:Body>
</soap:Envelope>`

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `${NS}/${operation}`,
      },
      body: envelope,
    })

    const text = await res.text()
    if (!res.ok) {
      console.error(`[OCA] ${operation} falló (${res.status}): ${text.slice(0, 300)}`)
      return null
    }
    return text
  } catch (err) {
    console.error(`[OCA] ${operation} error de red:`, err)
    return null
  }
}

/** Solo dígitos (los CP de OCA son enteros; descarta CPA con letras). */
function onlyDigits(s: string): string {
  const m = String(s).match(/\d{4}/)
  return m ? m[0] : String(s).replace(/\D/g, '')
}

/** Parsea un número de OCA (viene con coma decimal y a veces separador de miles). */
function parseOcaNumber(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, '').replace(',', '.')
  return Number(cleaned)
}

/** Devuelve el contenido del primer `<tag>…</tag>` (ignora namespaces). */
function firstTag(xml: string, tag: string): string | null {
  const re = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, 'i')
  const m = xml.match(re)
  return m ? decodeXml(m[1].trim()) : null
}

/** Devuelve todos los bloques `<tag>…</tag>` (para filas de tablas). */
function allBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`, 'gi')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) out.push(m[1])
  return out
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}
