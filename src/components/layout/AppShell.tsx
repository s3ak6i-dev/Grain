import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import SignalModal from '@/components/signals/SignalModal'

export default function AppShell() {
  const [signalModalOpen, setSignalModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-grain-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onLogSignal={() => setSignalModalOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <SignalModal open={signalModalOpen} onClose={() => setSignalModalOpen(false)} />
    </div>
  )
}
