import { useState } from 'react'
import { useAppConfig } from '../context/AppProvider'
import { generateRemotePin } from '../api/client'
import { MdVpnKey, MdContentCopy, MdExpandMore, MdSave, MdDns } from 'react-icons/md'

export default function Security() {
  const { baseUrl, updateBaseUrl } = useAppConfig()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [ip, setIp] = useState(baseUrl)

  const handleSaveIp = () => {
    let formatted = ip.trim()
    if (formatted) {
      if (!formatted.startsWith('http')) {
        formatted = `http://${formatted}`
      }

      if (!/:[0-9]+$/.test(formatted)) {
        formatted = `${formatted}:3000`
      }
    }
    updateBaseUrl(formatted)
    setShowAdvanced(false)
  }

  const handleGenerate = async () => {
    if (!baseUrl) return alert('Configura la conexión primero')
    setLoading(true)
    try {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString()
      await generateRemotePin(baseUrl, newPin)
      setPin(newPin)
    } catch {
      alert('Error al generar PIN. ¿Está el servidor encendido?')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 h-full justify-center pb-20">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdVpnKey size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Autorización Remota</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-[250px] mx-auto">
          Genera un PIN de 4 dígitos para autorizar movimientos de caja en el POS sin estar presente.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-6 mt-4">
        {pin ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-5xl font-mono font-bold tracking-widest text-slate-800 bg-slate-50 py-6 px-8 rounded-2xl w-full text-center border border-slate-200">
              {pin}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(pin)}
              className="flex items-center gap-2 text-blue-600 font-bold py-2 px-4 rounded-full bg-blue-50 active:bg-blue-100 transition-colors"
            >
              <MdContentCopy size={18} />
              COPIAR PIN
            </button>
          </div>
        ) : (
          <div className="text-slate-400 font-medium py-8">Ningún PIN activo</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'GENERANDO...' : 'GENERAR NUEVO PIN'}
        </button>
      </div>

      <div className="mt-4">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 mx-auto hover:text-slate-600 transition-colors py-2"
        >
          {showAdvanced ? 'Ocultar Configuración' : 'Configuración de Red'}
          <MdExpandMore className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} size={14} />
        </button>
        
        {showAdvanced && (
          <div className="mt-4 animate-in fade-in zoom-in-95 duration-300 bg-slate-100 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block px-1">
              Dirección del Servidor POS
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MdDns size={18} />
              </div>
              <input
                type="url"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="ej. http://192.168.1.100:3000"
                className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleSaveIp}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-colors active:scale-[0.98]"
            >
              <MdSave size={16} />
              ACTUALIZAR CONEXIÓN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
