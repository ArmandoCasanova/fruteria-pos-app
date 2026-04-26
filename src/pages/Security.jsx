import { useState } from 'react'
import { useAppConfig } from '../context/AppProvider'
import { generateRemotePin } from '../api/client'
import { MdVpnKey, MdContentCopy } from 'react-icons/md'

export default function Security() {
  const { baseUrl } = useAppConfig()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

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
    </div>
  )
}
