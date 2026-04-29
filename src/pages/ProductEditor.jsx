import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MdArrowBack, MdPhotoCamera, MdImage, MdLink, MdClose,
  MdExpandMore, MdExpandLess, MdCheckCircle, MdWarning,
  MdAdd, MdQrCodeScanner
} from 'react-icons/md'
import { useAppConfig } from '../context/AppProvider'
import { pushProduct, uploadToCloudinary, fetchCategories } from '../api/client'
import { v4 as uuidv4 } from 'uuid'

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ isEdit, form, oldProduct, onConfirm, onCancel, loading }) {
  const oldPrice = parseFloat(oldProduct?.sale_price || 0)
  const newPrice = parseFloat(form.sale_price || 0)
  const priceChanged = isEdit && oldPrice !== newPrice

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 animate-slide-up">
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center gap-3 mt-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <MdCheckCircle size={24} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-xl leading-tight">
              {isEdit ? 'Confirmar cambios' : 'Confirmar nuevo producto'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Revisa los datos antes de guardar</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100 mb-5">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-lg text-slate-500">Nombre</span>
            <span className="font-semibold text-slate-800 text-lg text-right max-w-[60%] truncate">{form.name}</span>
          </div>

          {priceChanged ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg text-slate-500">Precio</span>
              <div className="flex items-center gap-2">
                <span className="text-base text-slate-400 line-through">${oldPrice.toFixed(2)}</span>
                <span className="text-xl font-bold text-emerald-700">${newPrice.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg text-slate-500">Precio final</span>
              <span className="text-xl font-bold text-emerald-700">${newPrice.toFixed(2)}</span>
            </div>
          )}

          {form.cost_price ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg text-slate-500">Costo</span>
              <span className="font-semibold text-slate-700 text-lg">${parseFloat(form.cost_price).toFixed(2)}</span>
            </div>
          ) : null}

          {form.categories?.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg text-slate-500">Categoría</span>
              <span className="text-lg font-medium text-slate-700">{form.categories.join(', ')}</span>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-lg text-slate-500">A granel</span>
            <span className="text-lg font-medium text-slate-700">{form.is_weighed ? 'Sí' : 'No'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-lg active:bg-slate-50 transition-colors"
          >
            Revisar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Image Picker ─────────────────────────────────────────────────────────────
function ImagePicker({ image, onFileChange, onUrlChange }) {
  const [tab, setTab] = useState('camera')
  const [urlInput, setUrlInput] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const cameraRef = useRef()
  const galleryRef = useRef()

  const tabs = [
    { id: 'camera', icon: MdPhotoCamera, label: 'Cámara' },
    { id: 'gallery', icon: MdImage, label: 'Galería' },
    { id: 'url', icon: MdLink, label: 'URL' },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Preview */}
      <div
        onClick={() => setShowOptions(true)}
        className="w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center border-2 flex-shrink-0 cursor-pointer"
        style={{ borderColor: image ? '#059669' : '#e2e8f0', background: '#f8fafc' }}
      >
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <MdPhotoCamera size={36} className="text-slate-300" />
        )}
      </div>

      {showOptions && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowOptions(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 animate-slide-up relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowOptions(false)} className="absolute top-4 right-4 p-2 text-slate-400 active:bg-slate-100 rounded-full">
              <MdClose size={24} />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <h3 className="text-center font-bold text-slate-800 text-xl mb-6">Cambiar imagen</h3>

            <div className="flex justify-center bg-slate-100 rounded-2xl p-1 gap-1 mb-6">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id)
                    if (id === 'camera') cameraRef.current?.click()
                    if (id === 'gallery') galleryRef.current?.click()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-lg font-bold transition-all"
                  style={tab === id ? { background: '#fff', color: '#059669', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#64748b' }}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>

            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { onFileChange(e); setShowOptions(false); }} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFileChange(e); setShowOptions(false); }} />

            {tab === 'url' && (
              <div className="w-full flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 text-xl bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => { if (urlInput.trim()) { onUrlChange(urlInput.trim()); setUrlInput(''); setShowOptions(false); } }}
                  className="px-6 py-3 rounded-xl font-bold text-white text-xl"
                  style={{ background: '#059669' }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Category Selector ────────────────────────────────────────────────────────
function CategorySelector({ selected, categories, onToggle, onCreateNew }) {
  const [newCat, setNewCat] = useState('')

  const handleCreate = () => {
    const name = newCat.trim().toUpperCase()
    if (!name) return
    onCreateNew(name)
    setNewCat('')
  }

  return (
    <div>
      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Categoría</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map(cat => {
          const active = selected.includes(cat.name)
          return (
            <button
              key={cat.id || cat.name}
              onClick={() => onToggle(cat.name)}
              className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all"
              style={active
                ? { background: '#ecfdf5', borderColor: '#059669', color: '#065f46' }
                : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }
              }
            >
              {cat.name}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Nueva categoría..."
          className="flex-1 text-lg bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleCreate}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{ background: '#059669' }}
        >
          <MdAdd size={20} />
        </button>
      </div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductEditor() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { baseUrl, checkSyncStatus, settings, posOnline } = useAppConfig()
  const existing = state?.product
  const isEdit = !!existing

  const defaultMargin = useMemo(() => parseFloat(settings?.global_margin) || 0, [settings])

  const [form, setForm] = useState({
    id: existing?.id || '',
    name: existing?.name || '',
    barcode: existing?.barcode || '',
    cost_price: existing?.cost_price ?? '',
    sale_price: existing?.sale_price ?? '',
    margin_percentage: existing?.margin_percentage ?? '',
    image: existing?.image || '',
    is_weighed: existing?.is_weighed ?? true,
    ticket_name: existing?.ticket_name || '',
    categories: existing?.categories
      ? (typeof existing.categories === 'string'
        ? existing.categories.split(',').map(c => c.trim()).filter(Boolean)
        : existing.categories)
      : [],
  })

  const [fileToUpload, setFileToUpload] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})

  // Load categories
  useEffect(() => {
    if (!baseUrl) return
    fetchCategories(baseUrl)
      .then(data => setCategories(data || []))
      .catch(() => { })
  }, [baseUrl])

  // Computed placeholders
  const placeholderPrice = useMemo(() => {
    const c = parseFloat(form.cost_price) || 0
    if (c <= 0) return ''
    const m = parseFloat(form.margin_percentage || defaultMargin) || 0
    return (Math.round(c * (1 + m / 100) * 2) / 2).toFixed(2)
  }, [form.cost_price, form.margin_percentage, defaultMargin])

  const placeholderMargin = useMemo(() => {
    const c = parseFloat(form.cost_price) || 0
    const s = parseFloat(form.sale_price) || 0
    if (c > 0 && s > 0) return (((s - c) / c) * 100).toFixed(1)
    return defaultMargin.toString()
  }, [form.cost_price, form.sale_price, defaultMargin])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileToUpload(file)
    const reader = new FileReader()
    reader.onload = ev => set('image', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleUrlChange = url => {
    setFileToUpload(null)
    set('image', url)
  }

  const toggleCategory = name => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(name)
        ? f.categories.filter(c => c !== name)
        : [...f.categories, name]
    }))
  }

  const handleNewCategory = name => {
    if (!categories.find(c => c.name === name)) {
      setCategories(prev => [...prev, { name }])
    }
    setForm(f => ({
      ...f,
      categories: f.categories.includes(name) ? f.categories : [...f.categories, name]
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    const hasPrice = parseFloat(form.sale_price) > 0 || parseFloat(placeholderPrice) > 0
    const hasCost = parseFloat(form.cost_price) > 0
    if (!isEdit && !hasPrice && !hasCost) e.price = 'Ingresa al menos el precio final o el costo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePressSave = () => {
    if (!validate()) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      let imageUrl = form.image
      if (fileToUpload) {
        try { imageUrl = await uploadToCloudinary(fileToUpload) }
        catch { imageUrl = form.image }
      }

      const ticketName = form.ticket_name.trim() || form.name.trim()
      const finalPrice = parseFloat(form.sale_price) || parseFloat(placeholderPrice) || 0

      const payload = {
        ...form,
        image: imageUrl,
        image_url: imageUrl,
        id: form.id || uuidv4(),
        cost_price: parseFloat(form.cost_price) || 0,
        sale_price: finalPrice,
        margin_percentage: form.margin_percentage ? parseFloat(form.margin_percentage) : null,
        ticket_name: ticketName,
        categories: form.categories,
      }

      const targetUrl = posOnline ? baseUrl : null
      await pushProduct(targetUrl, payload)
      await checkSyncStatus()
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const inputBase = "w-full bg-white border rounded-xl px-4 py-3 outline-none transition-colors"
  const inputNormal = `${inputBase} border-slate-200 text-slate-800 focus:border-emerald-500 text-lg font-medium`
  const inputError = `${inputBase} border-rose-400 text-slate-800 focus:border-rose-500 text-lg font-medium`
  const toggleSwitch = (checked) => (
    <div
      className="relative w-12 h-6 rounded-full transition-all flex-shrink-0 cursor-pointer"
      style={{ background: checked ? '#059669' : '#cbd5e1' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{ left: checked ? '26px' : '2px' }}
      />
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#f8fafc] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-slate-100 flex-shrink-0 sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 active:bg-slate-100 transition-colors"
          >
            <MdArrowBack size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 text-xl text-center ml-[-40px]"> 
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>

          </div>
        </div>

        {/* Scrollable body */}
        <div className="px-4 py-4 pb-40 flex flex-col gap-4">

          {/* Image */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <ImagePicker
              image={form.image}
              onFileChange={handleFileChange}
              onUrlChange={handleUrlChange}
            />
          </div>

          {/* Name */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
            <Field label="Nombre del producto" required>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ej. Manzana Gala"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && <p className="text-sm text-rose-500 mt-1 flex items-center gap-1"><MdWarning size={12} />{errors.name}</p>}
            </Field>

            {/* Barcode: read-only in edit, hidden in create */}
            {isEdit && existing.barcode && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <MdQrCodeScanner size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-sm font-mono text-slate-500 select-all">{existing.barcode}</span>
                <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-wider">Solo lectura</span>
              </div>
            )}
          </div>

          {/* Pricing — MAIN FOCUS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
            {/* Sale price — most prominent */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#059669' }}>
                Precio de Venta<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: '#059669' }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={form.sale_price}
                  onChange={e => set('sale_price', e.target.value)}
                  placeholder={placeholderPrice || '0.00'}
                  className="w-full bg-white border-2 rounded-2xl pl-8 pr-4 py-4 text-4xl font-bold outline-none transition-colors"
                  style={{
                    borderColor: errors.price ? '#f43f5e' : '#059669',
                    color: '#065f46',
                    caretColor: '#059669',
                  }}
                />
              </div>
              {errors.price && <p className="text-sm text-rose-500 mt-1 flex items-center gap-1"><MdWarning size={12} />{errors.price}</p>}
            </div>

            {/* Cost + Margin */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Costo ($)">
                <input
                  type="number" inputMode="decimal" step="0.01"
                  value={form.cost_price}
                  onChange={e => set('cost_price', e.target.value)}
                  placeholder="0.00"
                  className={inputNormal}
                />
              </Field>
              <Field label="Margen (%)">
                <input
                  type="number" inputMode="decimal" step="0.1"
                  value={form.margin_percentage}
                  onChange={e => set('margin_percentage', e.target.value)}
                  placeholder={placeholderMargin}
                  className={inputNormal}
                />
              </Field>
            </div>
          </div>

          {/* ── CREATE MODE: extra fields visible directly ── */}
          {!isEdit && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
              {/* Categories */}
              <CategorySelector
                selected={form.categories}
                categories={categories}
                onToggle={toggleCategory}
                onCreateNew={handleNewCategory}
              />

              {/* Weighed */}
              <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Opciones</label>
                <button
                  onClick={() => set('is_weighed', !form.is_weighed)}
                  className="flex items-center justify-between w-full"
                >
                  <div>
                    <p className="font-semibold text-slate-700 text-lg text-left">Se vende a granel</p>
                    <p className="text-sm text-slate-400 text-left">Se pesará en báscula</p>
                  </div>
                  {toggleSwitch(form.is_weighed)}
                </button>
              </div>

              {/* Ticket name */}
              <Field label="Nombre en ticket">
                <input
                  type="text"
                  value={form.ticket_name}
                  onChange={e => set('ticket_name', e.target.value)}
                  placeholder={form.name || 'Si se deja vacío, usa el nombre del producto'}
                  className={inputNormal}
                />
              </Field>
            </div>
          )}

          {/* ── EDIT MODE: collapsible advanced options ── */}
          {isEdit && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setAdvancedOpen(o => !o)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-700 text-lg">Más opciones</span>
                {advancedOpen
                  ? <MdExpandLess size={22} className="text-slate-400" />
                  : <MdExpandMore size={22} className="text-slate-400" />
                }
              </button>

              {advancedOpen && (
                <div className="px-4 pb-4 flex flex-col gap-4 border-t border-slate-50 pt-3">
                  <CategorySelector
                    selected={form.categories}
                    categories={categories}
                    onToggle={toggleCategory}
                    onCreateNew={handleNewCategory}
                  />

                  <button
                    onClick={() => set('is_weighed', !form.is_weighed)}
                    className="flex items-center justify-between w-full"
                  >
                    <div>
                      <p className="font-semibold text-slate-700 text-lg text-left">Se vende a granel</p>
                      <p className="text-sm text-slate-400 text-left">Se pesará en báscula</p>
                    </div>
                    {toggleSwitch(form.is_weighed)}
                  </button>

                  <Field label="Nombre en ticket">
                    <input
                      type="text"
                      value={form.ticket_name}
                      onChange={e => set('ticket_name', e.target.value)}
                      placeholder={form.name || 'Mismo que el nombre del producto'}
                      className={inputNormal}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 pt-4 pb-6 flex gap-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-lg active:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePressSave}
            disabled={loading}
            className="flex-1 py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
          >
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmModal
          isEdit={isEdit}
          form={{ ...form, sale_price: parseFloat(form.sale_price) || parseFloat(placeholderPrice) || 0 }}
          oldProduct={existing}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s cubic-bezier(0.34,1.2,0.64,1) both; }
      `}</style>
    </>
  )
}
