import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  GraduationCap,
  Wrench,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '总览' },
  { to: '/schedule', icon: Calendar, label: '场地排期' },
  { to: '/orders', icon: ClipboardList, label: '预约订单' },
  { to: '/members', icon: Users, label: '会员档案' },
  { to: '/courses', icon: GraduationCap, label: '课程活动' },
  { to: '/inspection', icon: Wrench, label: '设备巡检' },
  { to: '/finance', icon: BarChart3, label: '收入报表' },
]

const routeTitleMap: Record<string, string> = {
  '/': '总览',
  '/schedule': '场地排期',
  '/orders': '预约订单',
  '/members': '会员档案',
  '/courses': '课程活动',
  '/inspection': '设备巡检',
  '/finance': '收入报表',
}

export default function Layout() {
  const { sidebarCollapsed, toggleSidebar, alertCount } = useAppStore()
  const location = useLocation()
  const pageTitle = routeTitleMap[location.pathname] ?? '智慧体育场馆'

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64'

  return (
    <div className="flex h-screen overflow-hidden bg-primary-950">
      <aside
        className={cn(
          'flex flex-col border-r border-surface-700/50 bg-surface-900/80 transition-all duration-300',
          sidebarWidth
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-surface-700/50 px-4">
          <Trophy className="h-8 w-8 shrink-0 text-accent-400" />
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-surface-100 whitespace-nowrap">
              智慧体育场馆
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent-500/20 text-accent-400 border-l-[3px] border-accent-400'
                    : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200 border-l-[3px] border-transparent'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {sidebarCollapsed && (
                <div className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-surface-800 px-2 py-1 text-xs text-surface-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-surface-700/50 p-3">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800/60 hover:text-surface-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-surface-700/50 bg-surface-900/40 px-6 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-surface-100">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-surface-400 transition-colors hover:text-surface-200">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                管
              </div>
              <span className="text-sm font-medium text-surface-300">管理员</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
