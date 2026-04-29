import { useAppConfig } from '../../context/AppProvider'
import { MdWifi, MdWifiOff, MdSearch, MdRefresh } from 'react-icons/md'
import logo from '../../assets/logo.png'
import { useLocation } from 'react-router-dom'

export const Header = () => {
  const { isOnline, baseUrl, search, setSearch, triggerRefresh, pendingSync, clearSyncQueue, posOnline } = useAppConfig()
  const location = useLocation()
  
  const isConnected = posOnline

  if (location.pathname === '/edit') {
    return null
  }

  const hideSearch = location.pathname === '/security' || location.pathname === '/settings'

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 flex flex-col pt-3 pb-2 px-4 gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-9 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Fruteria Lemus" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-800 text-xl leading-tight tracking-tight">
              Frutería Lemus POS
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {pendingSync > 0 && (
            <button 
              onClick={clearSyncQueue}
              className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold uppercase rounded-lg border border-orange-100 active:scale-95 transition-all"
            >
              Limpiar {pendingSync}
            </button>
          )}
          <button 
            onClick={() => {
              triggerRefresh()
              const btn = document.getElementById('refresh-icon')
              if (btn) {
                btn.classList.add('animate-spin')
                setTimeout(() => btn.classList.remove('animate-spin'), 500)
              }
            }}
            className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-50 border border-slate-200 rounded-xl active:bg-slate-100 active:scale-90 transition-all shadow-sm"
          >
            <MdRefresh id="refresh-icon" size={20} />
          </button>
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider">Conectado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100/50">
              <MdWifiOff size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Desconectado</span>
            </div>
          )}
        </div>
      </div>

      {!hideSearch && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <MdSearch size={22} />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos o códigos..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xl font-medium text-slate-800 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      )}
      {!isConnected && pendingSync > 0 && (
        <div className="mt-1 bg-orange-100 border border-orange-200 text-orange-800 px-3 py-2 rounded-xl flex justify-center items-center shadow-sm">
          <span className="text-lg font-bold text-center">
            {pendingSync} cambio{pendingSync !== 1 ? 's' : ''} pendiente{pendingSync !== 1 ? 's' : ''} en espera de conexión
          </span>
        </div>
      )}
    </header>
  )
}

