import { useMemo } from 'react'
import {
  Wallet, Calendar, Users, TrendingUp,
  CircleDollarSign, Target, Waves,
  AlertCircle, AlertTriangle, Info,
  ClipboardCheck, RefreshCw, Shield, MessageSquare,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'

const TODAY = '2026-06-08'

const venueIconMap: Record<string, React.ElementType> = {
  basketball: CircleDollarSign,
  badminton: Target,
  swimming: Waves,
}

const courtGlow: Record<string, string> = {
  available: 'shadow-[0_0_8px_rgba(0,196,140,0.3)] border-accent-500/40',
  occupied: 'shadow-[0_0_8px_rgba(255,167,38,0.3)] border-warning-500/40',
  locked: 'shadow-[0_0_8px_rgba(239,68,68,0.3)] border-red-500/40',
  maintenance: 'shadow-[0_0_8px_rgba(100,116,139,0.3)] border-surface-500/40',
}

const alertIconMap: Record<string, { Icon: React.ElementType; color: string }> = {
  error: { Icon: AlertCircle, color: 'text-red-400' },
  warning: { Icon: AlertTriangle, color: 'text-warning-400' },
  info: { Icon: Info, color: 'text-primary-400' },
}

export default function Dashboard() {
  const venues = useAppStore((s) => s.venues)
  const reservations = useAppStore((s) => s.reservations)
  const dailyStats = useAppStore((s) => s.dailyStats)
  const gateRecords = useAppStore((s) => s.gateRecords)
  const alerts = useAppStore((s) => s.alerts)
  const inspectionTasks = useAppStore((s) => s.inspectionTasks)
  const complaints = useAppStore((s) => s.complaints)
  const refundRequests = useAppStore((s) => s.refundRequests)
  const markAlertRead = useAppStore((s) => s.markAlertRead)

  const todayRevenue = useMemo(
    () => dailyStats.filter((s) => s.date === TODAY).reduce((sum, s) => sum + s.revenue, 0),
    [dailyStats]
  )

  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === TODAY && r.status !== 'cancelled').length,
    [reservations]
  )

  const currentVisitors = useMemo(
    () => gateRecords.filter((g) => g.direction === 'in' && g.timestamp.startsWith(TODAY)).length,
    [gateRecords]
  )

  const utilizationRate = useMemo(() => {
    const allCourts = venues.flatMap((v) => v.courts)
    const occupied = allCourts.filter((c) => c.status === 'occupied').length
    return allCourts.length > 0 ? Math.round((occupied / allCourts.length) * 100) : 0
  }, [venues])

  const unreadAlerts = useMemo(() => alerts.filter((a) => !a.isRead), [alerts])

  const pendingReservations = useMemo(
    () => reservations.filter((r) => r.date === TODAY && r.status === 'pending').length,
    [reservations]
  )

  const pendingRefunds = useMemo(
    () => refundRequests.filter((r) => r.status === 'pending').length,
    [refundRequests]
  )

  const pendingInspections = useMemo(
    () => inspectionTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length,
    [inspectionTasks]
  )

  const openComplaints = useMemo(
    () => complaints.filter((c) => c.status === 'open').length,
    [complaints]
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="今日收入" value={`¥${todayRevenue.toLocaleString()}`} change={12.5} icon={Wallet} iconColor="text-accent-400" />
        <StatCard title="今日预约" value={todayReservations} change={8.3} icon={Calendar} iconColor="text-primary-400" />
        <StatCard title="当前客流" value={currentVisitors} change={-3.2} icon={Users} iconColor="text-warning-400" />
        <StatCard title="场地利用率" value={`${utilizationRate}%`} change={5.1} icon={TrendingUp} iconColor="text-accent-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {venues.map((venue) => {
          const VenueIcon = venueIconMap[venue.type] ?? CircleDollarSign
          const available = venue.courts.filter((c) => c.status === 'available').length
          return (
            <div key={venue.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
                  <VenueIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-100">{venue.name}</h3>
                  <p className="text-xs text-surface-400">{available}/{venue.courts.length} 场地可用</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {venue.courts.map((court) => (
                  <div
                    key={court.id}
                    className={`rounded-lg border bg-surface-900/40 p-2.5 transition-all ${courtGlow[court.status]}`}
                  >
                    <p className="text-xs font-medium text-surface-200 truncate">{court.name}</p>
                    <div className="mt-1">
                      <StatusBadge status={court.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-surface-100 mb-4">异常提醒</h3>
          {unreadAlerts.length === 0 ? (
            <p className="text-sm text-surface-500 py-8 text-center">暂无未读提醒</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {unreadAlerts.map((alert) => {
                const { Icon, color } = alertIconMap[alert.type] ?? { Icon: Info, color: 'text-surface-400' }
                return (
                  <div key={alert.id} className="flex items-start gap-3 rounded-lg bg-surface-900/40 p-3 group">
                    <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-200">{alert.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{alert.message}</p>
                    </div>
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="shrink-0 text-xs text-surface-500 hover:text-accent-400 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    >
                      标记已读
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-surface-100 mb-4">今日待办</h3>
          <div className="space-y-3">
            {[
              { icon: Calendar, label: '待确认预约', count: pendingReservations, color: 'text-warning-400', bg: 'bg-warning-500/15' },
              { icon: RefreshCw, label: '待处理退款', count: pendingRefunds, color: 'text-red-400', bg: 'bg-red-500/15' },
              { icon: ClipboardCheck, label: '待巡检任务', count: pendingInspections, color: 'text-primary-400', bg: 'bg-primary-500/15' },
              { icon: MessageSquare, label: '待处理投诉', count: openComplaints, color: 'text-accent-400', bg: 'bg-accent-500/15' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-surface-900/40 p-3.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm text-surface-300">{item.label}</span>
                <span className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold ${item.bg} ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
