import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'

interface HeaderProps {
  onLogSignal?: () => void
}

export default function Header({ onLogSignal }: HeaderProps) {
  return (
    <header
      className="h-14 shrink-0 flex items-center justify-end px-8"
      style={{ borderBottom: '1px solid #E8E6E1', background: '#F7F6F3' }}
    >
      <Button size="sm" onClick={onLogSignal} className="flex items-center gap-1.5">
        <Plus size={14} />
        Log signal
      </Button>
    </header>
  )
}
