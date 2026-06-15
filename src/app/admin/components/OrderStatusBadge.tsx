const STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-neutral-100 text-neutral-700',
}

const LABELS: Record<string, string> = {
  approved: 'Aprobada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
}

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
        STYLES[status] ?? STYLES.cancelled
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  )
}
