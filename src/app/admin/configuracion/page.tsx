import { getStoreSettings } from '@/lib/settings'
import SettingsManager from '../components/SettingsManager'
import AdminShell from '../components/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracionPage() {
  const settings = await getStoreSettings()

  return (
    <AdminShell>
      <div className="mt-16 lg:mt-0">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-primary-500" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary-700">
              Configuración
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-neutral-800">
            Ajustes de <span className="italic text-gradient-gold">la tienda</span>
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            Configurá promociones y parámetros del checkout.
          </p>
        </header>

        <SettingsManager initialSettings={settings} />
      </div>
    </AdminShell>
  )
}
