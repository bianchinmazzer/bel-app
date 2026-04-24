import { formatARS } from '@/lib/formatters'

interface PriceDisplayProps {
  centavos: number
  className?: string
}

export default function PriceDisplay({ centavos, className = '' }: PriceDisplayProps) {
  return (
    <span className={className}>
      {formatARS(centavos)}
    </span>
  )
}
