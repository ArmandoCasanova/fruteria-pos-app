import { useAppConfig } from '../../context/AppProvider'
import { MdWifi, MdWifiOff } from 'react-icons/md'

export const Header = () => {
  const { isOnline, baseUrl } = useAppConfig()
  
  const isConnected = isOnline && baseUrl !== ''

  return (
    <header className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
          <span className="text-emerald-700 font-bold text-lg">FL</span>
        </div>
        <h1 className="font-bold text-slate-800 text-lg tracking-tight">Admin</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <MdWifi size={14} />
            <span className="text-xs font-semibold">En línea</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
            <MdWifiOff size={14} />
            <span className="text-xs font-semibold">Desconectado</span>
          </div>
        )}
      </div>
    </header>
  )
}
