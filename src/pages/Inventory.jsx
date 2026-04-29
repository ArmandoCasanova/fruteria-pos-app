import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdAdd, MdRefresh } from 'react-icons/md'
import { useAppConfig } from '../context/AppProvider'
import { fetchRemoteProducts, getLocalProducts } from '../api/client'
import { ProductCard } from '../components/inventory/ProductCard'

export default function Inventory() {
  const navigate = useNavigate()
  const { baseUrl, isOnline, checkSyncStatus, search, refreshing } = useAppConfig()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    
    // 1. Mostrar productos locales al instante
    const local = await getLocalProducts()
    setProducts(local)
    setLoading(false)

    // 2. Intentar actualizar desde el servidor en segundo plano
    if (navigator.onLine && baseUrl) {
      try {
        const data = await fetchRemoteProducts(baseUrl)
        setProducts(data)
        await checkSyncStatus()
      } catch {
        // Falla silenciosa si no hay conexión al POS
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [isOnline, baseUrl, refreshing])

  const filtered = useMemo(() => {
    if (!search) return products
    const s = search.toLowerCase()
    return products.filter(p => p.name?.toLowerCase().includes(s) || p.barcode?.includes(s))
  }, [products, search])

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">

      <div className="flex flex-col gap-3 pb-24">
        {filtered.length === 0 && !loading && (
          <div className="text-center py-10 text-lg text-slate-400 font-medium">
            No hay productos. Verifica la conexión.
          </div>
        )}
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => navigate('/edit', { state: { product: p } })} />
        ))}
      </div>

      <button
        onClick={() => navigate('/edit')}
        className="fixed bottom-20 right-4 w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform z-50"
      >
        <MdAdd size={32} />
      </button>
    </div>
  )
}
