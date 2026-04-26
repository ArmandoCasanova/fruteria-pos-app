import { Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { Header } from './components/layout/Header'
import Inventory from './pages/Inventory'
import ProductEditor from './pages/ProductEditor'
import Security from './pages/Security'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/edit" element={<ProductEditor />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
