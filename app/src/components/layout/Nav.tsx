import { useLocation, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { LayoutDashboard, ShoppingBag, CreditCard, LogOut, User } from 'lucide-react'

export default function Nav() {
  const { currentUser, logout, orders } = useStore()
  const { pathname } = useLocation()

  if (!currentUser) return null
  if (currentUser.role === 'merchant') return null

  const isActive = (path: string) => pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Shop', path: '/store', icon: ShoppingBag, badge: orders.length === 0 ? 'New' : undefined },
    { label: 'Cards', path: '/settings/cards', icon: CreditCard },
  ]

  return (
    <>
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-10">
          <Link to="/dashboard" className="text-xl font-black tracking-tighter" style={{ color: '#5D5FEF' }}>
            -Anyway
          </Link>
          <div className="hidden md:flex gap-8">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-sm font-semibold flex items-center gap-2 transition-colors relative ${isActive(item.path) ? '' : 'hover:text-[#5D5FEF]'}`}
                style={{ color: isActive(item.path) ? '#1A1A2E' : '#6B7280' }}
              >
                <item.icon size={18} />
                {item.label}
                {item.badge && (
                  <span className="absolute -top-1 -right-6 px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: '#3EB489' }}>
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <span className="absolute -bottom-[19px] left-0 right-0 h-0.5" style={{ backgroundColor: '#5D5FEF' }} />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold" style={{ color: '#1A1A2E' }}>{currentUser.name}</span>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{currentUser.accountStatus}</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center border text-[#5D5FEF]" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
            <User size={18} />
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 flex-1 relative"
          >
            <div className={`p-1.5 rounded-xl transition-colors ${isActive(item.path) ? 'bg-[#5D5FEF]/10 text-[#5D5FEF]' : 'text-gray-400'}`}>
              <item.icon size={22} />
            </div>
            <span className={`text-[10px] font-bold ${isActive(item.path) ? 'text-[#1A1A2E]' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute top-0 right-1/2 translate-x-4 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: '#3EB489' }} />
            )}
          </Link>
        ))}
      </nav>
    </>
  )
}
