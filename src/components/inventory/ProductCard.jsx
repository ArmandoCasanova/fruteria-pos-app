import { MdImageNotSupported } from 'react-icons/md'

export const ProductCard = ({ product, onClick }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl p-3 flex gap-4 items-center shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <MdImageNotSupported size={24} className="text-slate-300" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 truncate text-base">{product.name}</h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
          Costo: <span className="text-slate-600">${Number(product.cost_price || 0).toFixed(2)}</span>
        </p>
      </div>
      
      <div className="text-right flex-shrink-0 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Precio</div>
        <div className="font-bold text-emerald-700 text-lg leading-none">
          ${Number(product.sale_price || 0).toFixed(2)}
        </div>
      </div>
    </div>
  )
}
