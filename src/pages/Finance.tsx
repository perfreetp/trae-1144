import { useState, useMemo } from 'react'
import { Wallet, TrendingUp, BarChart3, Users, UserCheck, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/DataTable'

const VENUE_COLORS = { v1: '#3b82f6', v2: '#22c55e', v3: '#06b6d4' }
const VENUE_NAMES = { v1: '篮球馆', v2: '羽毛球馆', v3: '游泳馆' }
const VENUE_IDS = ['v1', 'v2', 'v3'] as const

const TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }
const AXIS_STYLE = { stroke: '#334155' }
const TICK_STYLE = { fill: '#94a3b8', fontSize: 12 }

const TABS = ['收入对账', '客流统计', '异常提醒'] as const

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function toDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

export default function Finance() {
  const [tab, setTab] = useState<number>(0)
  const { dailyStats, venues, alerts, markAlertRead } = useAppStore()

  const today = useMemo(() => new Date(2026, 5, 8), [])
  const todayStr = toDateStr(today)

  const last7 = useMemo(() => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(toDateStr(d))
    }
    return dates
  }, [today])

  const last14 = useMemo(() => {
    const dates: string[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(toDateStr(d))
    }
    return dates
  }, [today])

  const sumByDates = (dates: string[], vid: string, field: 'revenue' | 'visitors') =>
    dailyStats.filter(s => dates.includes(s.date) && s.venueId === vid).reduce((a, s) => a + s[field], 0)

  const todayRevenue = useMemo(() => dailyStats.filter(s => s.date === todayStr).reduce((a, s) => a + s.revenue, 0), [dailyStats, todayStr])
  const weekRevenue = useMemo(() => dailyStats.filter(s => last7.includes(s.date)).reduce((a, s) => a + s.revenue, 0), [dailyStats, last7])
  const monthRevenue = useMemo(() => {
    const d30: string[] = []
    for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); d30.push(toDateStr(d)) }
    return dailyStats.filter(s => d30.includes(s.date)).reduce((a, s) => a + s.revenue, 0)
  }, [dailyStats, today])

  const todayVisitors = useMemo(() => dailyStats.filter(s => s.date === todayStr).reduce((a, s) => a + s.visitors, 0), [dailyStats, todayStr])
  const weekVisitors = useMemo(() => dailyStats.filter(s => last7.includes(s.date)).reduce((a, s) => a + s.visitors, 0), [dailyStats, last7])

  const barData = useMemo(() => last7.map(date => {
    const entry: Record<string, string | number> = { date: formatDate(new Date(date)) }
    for (const vid of VENUE_IDS) {
      const stat = dailyStats.find(s => s.date === date && s.venueId === vid)
      entry[VENUE_NAMES[vid]] = stat?.revenue ?? 0
    }
    return entry
  }), [dailyStats, last7])

  const lineData = useMemo(() => last14.map(date => {
    const entry: Record<string, string | number> = { date: formatDate(new Date(date)) }
    for (const vid of VENUE_IDS) {
      const stat = dailyStats.find(s => s.date === date && s.venueId === vid)
      entry[VENUE_NAMES[vid]] = stat?.visitors ?? 0
    }
    return entry
  }), [dailyStats, last14])

  const tableData = useMemo(() => venues.map(v => {
    const vid = v.id
    return {
      venue: v.name,
      todayRevenue: sumByDates([todayStr], vid, 'revenue'),
      weekRevenue: sumByDates(last7, vid, 'revenue'),
      monthRevenue: (() => {
        const d30: string[] = []
        for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); d30.push(toDateStr(d)) }
        return sumByDates(d30, vid, 'revenue')
      })(),
      reservations: sumByDates([todayStr], vid, 'revenue') > 0
        ? dailyStats.filter(s => s.date === todayStr && s.venueId === vid).reduce((a, s) => a + s.reservations, 0) : 0,
      cancellations: dailyStats.filter(s => s.date === todayStr && s.venueId === vid).reduce((a, s) => a + s.cancellations, 0),
    }
  }), [venues, dailyStats, todayStr, last7, today])

  const tableColumns = [
    { key: 'venue', header: '场馆', render: (row: Record<string, unknown>) => <span className="text-surface-200 font-medium">{row.venue as string}</span> },
    { key: 'todayRevenue', header: '今日收入', render: (row: Record<string, unknown>) => `¥${(row.todayRevenue as number).toLocaleString()}` },
    { key: 'weekRevenue', header: '本周收入', render: (row: Record<string, unknown>) => `¥${(row.weekRevenue as number).toLocaleString()}` },
    { key: 'monthRevenue', header: '本月收入', render: (row: Record<string, unknown>) => `¥${(row.monthRevenue as number).toLocaleString()}` },
    { key: 'reservations', header: '预约数' },
    { key: 'cancellations', header: '取消数' },
  ]

  const unreadAlerts = useMemo(() => alerts.filter(a => !a.isRead), [alerts])
  const errorCount = unreadAlerts.filter(a => a.type === 'error').length
  const warningCount = unreadAlerts.filter(a => a.type === 'warning').length
  const infoCount = unreadAlerts.filter(a => a.type === 'info').length

  const alertIcon = (type: string) => {
    if (type === 'error') return <AlertCircle className="h-5 w-5 text-red-400" />
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-400" />
    return <Info className="h-5 w-5 text-blue-400" />
  }

  const fmt = (n: number) => `¥${n.toLocaleString()}`

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-surface-700/50 pb-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === i
                ? 'text-accent-400 border-b-2 border-accent-400'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="今日总收入" value={fmt(todayRevenue)} icon={Wallet} iconColor="text-accent-400" />
            <StatCard title="本周收入" value={fmt(weekRevenue)} icon={TrendingUp} iconColor="text-primary-400" />
            <StatCard title="本月收入" value={fmt(monthRevenue)} icon={BarChart3} iconColor="text-warning-400" />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-medium text-surface-300 mb-4">近7日收入趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_STYLE} tickLine={AXIS_STYLE} />
                <YAxis tick={TICK_STYLE} axisLine={AXIS_STYLE} tickLine={AXIS_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="篮球馆" fill={VENUE_COLORS.v1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="羽毛球馆" fill={VENUE_COLORS.v2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="游泳馆" fill={VENUE_COLORS.v3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DataTable columns={tableColumns} data={tableData as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="今日客流" value={todayVisitors} icon={Users} iconColor="text-accent-400" />
            <StatCard title="本周客流" value={weekVisitors} icon={UserCheck} iconColor="text-primary-400" />
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-medium text-surface-300 mb-4">近14日客流趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_STYLE} tickLine={AXIS_STYLE} />
                <YAxis tick={TICK_STYLE} axisLine={AXIS_STYLE} tickLine={AXIS_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="篮球馆" stroke={VENUE_COLORS.v1} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="羽毛球馆" stroke={VENUE_COLORS.v2} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="游泳馆" stroke={VENUE_COLORS.v3} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-medium text-surface-300 mb-3">高峰时段分析</h3>
            <div className="flex gap-8">
              <div>
                <span className="text-surface-400 text-xs">高峰时段</span>
                <p className="text-lg font-semibold text-amber-400 mt-1">18:00 - 20:00</p>
              </div>
              <div>
                <span className="text-surface-400 text-xs">低谷时段</span>
                <p className="text-lg font-semibold text-surface-400 mt-1">06:00 - 08:00</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="card px-4 py-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-surface-400">错误</span>
              <span className="text-lg font-bold text-red-400">{errorCount}</span>
              <span className="text-sm text-surface-500">条</span>
            </div>
            <div className="card px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-surface-400">警告</span>
              <span className="text-lg font-bold text-amber-400">{warningCount}</span>
              <span className="text-sm text-surface-500">条</span>
            </div>
            <div className="card px-4 py-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-surface-400">提示</span>
              <span className="text-lg font-bold text-blue-400">{infoCount}</span>
              <span className="text-sm text-surface-500">条</span>
            </div>
          </div>
          <div className="space-y-3">
            {unreadAlerts.map(alert => (
              <div key={alert.id} className="card p-4 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{alertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-surface-200">{alert.title}</h4>
                    <span className="text-xs text-surface-500 shrink-0">{alert.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-surface-400">{alert.message}</p>
                </div>
                <button
                  onClick={() => markAlertRead(alert.id)}
                  className="shrink-0 text-xs text-surface-500 hover:text-accent-400 transition-colors px-2 py-1 rounded hover:bg-surface-700/50"
                >
                  标记已读
                </button>
              </div>
            ))}
            {unreadAlerts.length === 0 && (
              <div className="card flex flex-col items-center justify-center py-16">
                <Info className="h-12 w-12 text-surface-600" />
                <p className="mt-3 text-sm text-surface-500">暂无未读提醒</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
