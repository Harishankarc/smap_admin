import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/ui/ToastContainer'

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
