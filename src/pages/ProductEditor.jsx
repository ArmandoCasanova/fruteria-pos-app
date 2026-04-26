import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdPhotoCamera, MdCheck } from 'react-icons/md'
import { useAppConfig } from '../context/AppProvider'
import { pushProduct } from '../api/client'
import { v4 as uuidv4 } from 'uuid'

export default function ProductEditor() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { baseUrl, checkSyncStatus, settings } = useAppConfig()
  const defaultMargin = useMemo(() => {
    return parseFloat(settings?.global_margin) || 0
  }, [settings])
  
  const existing = state?.product
  const [form, setForm] = useState({
    id: existing?.id || '',
    name: existing?.name || '',
    barcode: existing?.barcode || '',
    cost_price: existing?.cost_price || '',
    sale_price: existing?.sale_price || '',
    margin_percentage: existing?.margin_percentage || '',
    image: existing?.image || '',
    is_weighed: existing?.is_weighed ?? true
  })
  
  const [loading, setLoading] = useState(false)

  const placeholderPrice = useMemo(() => {
    const c = parseFloat(form.cost_price) || 0
    if (c <= 0) return '0.00'
    const m = parseFloat(form.margin_percentage || defaultMargin) || 0
    return (c * (1 + m / 100)).toFixed(2)
  }, [form.cost_price, form.margin_percentage, defaultMargin])

  const placeholderMargin = useMemo(() => {
    const c = parseFloat(form.cost_price) || 0
    const s = parseFloat(form.sale_price) || 0
    if (c > 0 && s > 0) return (((s - c) / c) * 100).toFixed(1)
    return defaultMargin.toString()
  }, [form.cost_price, form.sale_price, defaultMargin])

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm({ ...form, image: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name) return alert('El nombre es requerido')
    setLoading(true)
    
    const payload = {
      ...form,
      id: form.id || uuidv4(),
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price || placeholderPrice) || 0,
      margin_percentage: form.margin_percentage ? parseFloat(form.margin_percentage) : null,
    }

    await pushProduct(baseUrl, payload)
    await checkSyncStatus()
    setLoading(false)
    navigate(-1)
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300 bg-white fixed inset-0 z-50 overflow-y-auto pb-8">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
          <MdArrowBack size={28} />
        </button>
        <h1 className="font-bold text-lg text-slate-800">
          {existing ? 'Editar' : 'Nuevo'} Producto
        </h1>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl active:bg-emerald-100"
        >
          {loading ? '...' : <><MdCheck size={20}/> GUARDAR</>}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6 pb-20">
        
        <div className="flex justify-center">
          <label className="relative w-32 h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center overflow-hidden active:scale-95 transition-transform cursor-pointer">
            {form.image ? (
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <MdPhotoCamera size={32} className="text-slate-400 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">FOTO</span>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
          </label>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nombre *</label>
            <input 
              type="text" required
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full text-lg font-bold bg-white border border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Código de Barras</label>
            <input 
              type="text"
              value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
              className="w-full text-base font-mono bg-white border border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 block">Costo ($)</label>
              <input 
                type="number" step="0.01"
                value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})}
                placeholder="0.00"
                className="w-full text-lg font-mono bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 block">Margen (%)</label>
              <input 
                type="number" step="0.1"
                value={form.margin_percentage} onChange={e => setForm({...form, margin_percentage: e.target.value})}
                placeholder={placeholderMargin + '%'}
                className="w-full text-lg font-mono bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          
          <div className="pt-2 border-t border-emerald-200/50">
            <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 block">Precio Final ($)</label>
            <input 
              type="number" step="0.01" required
              value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})}
              placeholder={placeholderPrice}
              className="w-full text-2xl font-bold font-mono text-emerald-700 bg-white border-2 border-emerald-400 rounded-xl px-4 py-4 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <label className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <span className="font-bold text-slate-700">Se vende a granel (pesado)</span>
          <input 
            type="checkbox"
            checked={form.is_weighed}
            onChange={e => setForm({...form, is_weighed: e.target.checked})}
            className="w-6 h-6 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500"
          />
        </label>
      </div>
    </div>
  )
}
