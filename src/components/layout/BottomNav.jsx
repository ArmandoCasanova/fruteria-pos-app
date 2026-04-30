import { NavLink } from 'react-router-dom'
import { MdInventory, MdVpnKey } from 'react-icons/md'
import { useAppConfig } from '../../context/AppProvider'

export const BottomNav = () => {
  const { pendingSync } = useAppConfig()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-4">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        <NavItem to="/inventory" icon={<MdInventory size={24} />} label="Inventario" badge={pendingSync} />
        <NavItem to="/security" icon={<MdVpnKey size={24} />} label="Seguridad" />
      </div>
    </nav>
  )
}

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className="flex flex-col items-center justify-center w-full h-full relative transition-all duration-300"
  >
    {({ isActive }) => (
      <>
        <div className={`flex flex-col items-center justify-center px-6 py-1.5 rounded-2xl transition-all duration-300 ${
          isActive 
            ? 'bg-gray-100 text-emerald-700' 
            : 'text-slate-400 hover:text-slate-600'
        }`}>
          {icon}
          <span className={`text-[11px] font-bold tracking-wide mt-0.5 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
            {label}
          </span>
        </div>
        {badge > 0 && (
          <span className="absolute top-2 right-[20%] bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-md">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
)
