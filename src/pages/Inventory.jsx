import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdAdd, MdRefresh } from 'react-icons/md'
import { useAppConfig } from '../context/AppProvider'
import { fetchRemoteProducts, getLocalProducts } from '../api/client'
import { ProductCard } from '../components/inventory/ProductCard'

export default function Inventory() {
  const navigate = useNavigate()
  const { baseUrl, isOnline, checkSyncStatus } = useAppConfig()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      if (isOnline && baseUrl) {
        const data = await fetchRemoteProducts(baseUrl)
        setProducts(data)
        await checkSyncStatus()
      } else {
        const local = await getLocalProducts()
        setProducts(local)
      }
    } catch {
      const local = await getLocalProducts()
      setProducts(local)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [isOnline, baseUrl])

  const filtered = useMemo(() => {
    if (!search) return products
    const s = search.toLowerCase()
    return products.filter(p => p.name?.toLowerCase().includes(s) || p.barcode?.includes(s))
  }, [products, search])

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="sticky top-0 z-40 bg-slate-50 pt-2 pb-4 flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MdSearch size={24} />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-base font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button 
          onClick={loadData}
          className="bg-white border border-slate-200 text-slate-600 p-3.5 rounded-2xl shadow-sm active:bg-slate-100"
        >
          <MdRefresh size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex flex-col gap-3 pb-24">
        {filtered.length === 0 && !loading && (
          <div className="text-center py-10 text-slate-400 font-medium">
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
