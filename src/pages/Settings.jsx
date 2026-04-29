import { useState } from 'react'
import { useAppConfig } from '../context/AppProvider'
import { MdSave, MdDns } from 'react-icons/md'

export default function Settings() {
  const { baseUrl, updateBaseUrl } = useAppConfig()
  const [ip, setIp] = useState(baseUrl)

  const handleSave = () => {
    let formatted = ip.trim()
    if (formatted && !formatted.startsWith('http')) {
      formatted = `http://${formatted}`
    }
    updateBaseUrl(formatted)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Ajustes de Conexión</h2>
        <p className="text-sm text-slate-500 mt-1">Configura la IP de tu computadora POS para conectar la app.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
          Dirección del Servidor POS
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MdDns size={20} />
          </div>
          <input
            type="url"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="ej. http://192.168.1.100:3000"
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors active:scale-[0.98]"
        >
          <MdSave size={20} />
          GUARDAR CONEXIÓN
        </button>
      </div>
    </div>
  )
}
