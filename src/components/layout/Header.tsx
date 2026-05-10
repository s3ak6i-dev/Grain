import { Plus, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

interface HeaderProps {
  onLogSignal?: () => void
}

export default function Header({ onLogSignal }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-end gap-2 px-8"
      style={{ borderBottom: '1px solid #E8E6E1', background: '#F7F6F3' }}
    >
      <button
        onClick={() => navigate('/signals/import')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-grain-muted hover:text-grain-primary border border-grain-border rounded-lg bg-white hover:bg-grain-surface transition-colors"
      >
        <Upload size={12} />
        Import
      </button>
      <Button size="sm" onClick={onLogSignal} className="flex items-center gap-1.5">
        <Plus size={14} />
        Log feedback
      </Button>
    </header>
  )
}
