import { useState } from 'react'
import { Lock, Wrench, Users, Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Info, Eye } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import DataTable from '@/components/DataTable'
import type { Court, CourtStatus, GroupBooking } from '@/types'

const timeSlots = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22']
const venueTabs = [
  { key: 'all', label: '全部' },
  { key: 'basketball', label: '篮球馆' },
  { key: 'badminton', label: '羽毛球馆' },
  { key: 'swimming', label: '游泳馆' },
]

const ALL_TIME_SLOTS = timeSlots

function timeSlotsFromRange(startTime: string, endTime: string): string[] {
  const startHour = parseInt(startTime.split(':')[0] || '0')
  const endHour = parseInt(endTime.split(':')[0] || '0')
  const result: string[] = []
  for (const ts of ALL_TIME_SLOTS) {
    const [slotStart, slotEnd] = ts.split('-').map(Number)
    if (slotStart < endHour && slotEnd > startHour) {
      result.push(ts)
    }
  }
  return result
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${parseInt(m)}月${parseInt(d)}日 周${weekdays[date.getDay()]}`
}

const cellStyles: Record<CourtStatus, string> = {
  available: 'bg-accent-500/20 border border-accent-500/30 hover:bg-accent-500/30 cursor-pointer',
  occupied: 'bg-warning-500/20 border border-warning-500/30',
  locked: 'bg-red-500/20 border border-red-500/30 cursor-pointer',
  maintenance: 'bg-surface-500/20 border border-surface-500/30',
}

const bookingCellStyles = 'bg-purple-500/20 border border-purple-500/30 cursor-pointer'
const reservationCellStyles = 'bg-blue-500/20 border border-blue-500/30 cursor-pointer'

const statusLabels: Record<CourtStatus, string> = {
  available: '可用',
  occupied: '占用',
  locked: '锁定',
  maintenance: '维护',
}

interface ConflictInfo {
  hasConflict: boolean
  details: { timeSlot: string; source: string; sourceType: 'lock' | 'booking' | 'reservation' }[]
}

function getEffectiveBaseStatus(court: Court): CourtStatus {
  if (court.status === 'locked' || court.status === 'maintenance') return court.status
  return 'available'
}

export default function Schedule() {
  const { venues, slotOverrides, groupBookings, reservations, lockSlot, unlockSlot, addGroupBooking, confirmGroupBooking, cancelGroupBooking } = useAppStore()
  const [selectedVenue, setSelectedVenue] = useState('all')
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [lockModalOpen, setLockModalOpen] = useState(false)
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [groupBookingOpen, setGroupBookingOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [sourceInfoOpen, setSourceInfoOpen] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [lockReason, setLockReason] = useState('')
  const [unlockReason, setUnlockReason] = useState('')
  const [unlockOverrideType, setUnlockOverrideType] = useState<'lock' | 'booking' | 'reservation' | 'court'>('lock')
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null)
  const [sourceOverrideKey, setSourceOverrideKey] = useState('')

  const [bookingForm, setBookingForm] = useState({
    venueId: '', courtId: '', date: '', startTime: '', endTime: '',
    contactName: '', contactPhone: '', price: '', notes: '',
  })

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(formatDate(d))
  }

  const filteredCourts = selectedVenue === 'all'
    ? venues.flatMap(v => v.courts.map(c => ({ ...c, venueName: v.name })))
    : venues.filter(v => v.type === selectedVenue).flatMap(v => v.courts.map(c => ({ ...c, venueName: v.name })))

  const getSlotStatus = (court: Court, ts: string): { status: CourtStatus; reason?: string; overrideType?: 'lock' | 'booking' | 'reservation' } => {
    const key = `${court.id}|${selectedDate}|${ts}`
    const override = slotOverrides[key]
    if (override) {
      if (override.bookingId) return { status: override.status, reason: override.reason, overrideType: 'booking' }
      if (override.reservationId) return { status: override.status, reason: override.reason, overrideType: 'reservation' }
      return { status: override.status, reason: override.reason, overrideType: 'lock' }
    }
    return { status: getEffectiveBaseStatus(court) }
  }

  const checkConflicts = (courtId: string, date: string, timeSlotList: string[]): ConflictInfo => {
    const details: ConflictInfo['details'] = []
    for (const ts of timeSlotList) {
      const key = `${courtId}|${date}|${ts}`
      const override = slotOverrides[key]
      if (override && override.status !== 'available') {
        let sourceType: ConflictInfo['details'][0]['sourceType'] = 'lock'
        let source = ''
        if (override.bookingId) {
          sourceType = 'booking'
          const booking = groupBookings.find(b => b.id === override.bookingId)
          source = booking ? `团体包场 ${booking.id}（${booking.contactName} ${booking.startTime}-${booking.endTime}）` : `包场 ${override.bookingId}`
        } else if (override.reservationId) {
          sourceType = 'reservation'
          const res = reservations.find(r => r.id === override.reservationId)
          source = res ? `预约 ${res.id}（${res.memberName} ${res.startTime}-${res.endTime}）` : `预约 ${override.reservationId}`
        } else {
          source = override.reason ? `锁场（${override.reason}）` : '锁场'
        }
        details.push({ timeSlot: ts, source, sourceType })
      }
      const court = venues.flatMap(v => v.courts).find(c => c.id === courtId)
      if (court && (court.status === 'locked' || court.status === 'maintenance') && !override) {
        details.push({ timeSlot: ts, source: `场地整体${court.status === 'locked' ? '锁定' : '维护中'}`, sourceType: 'lock' })
      }
    }
    return { hasConflict: details.length > 0, details }
  }

  const handleCellClick = (court: Court, ts: string) => {
    const { status, reason, overrideType } = getSlotStatus(court, ts)
    if (status === 'available') {
      setSelectedCourt(court)
      setSelectedSlot(ts)
      setLockReason('')
      setLockModalOpen(true)
    } else {
      setSelectedCourt(court)
      setSelectedSlot(ts)
      setUnlockReason(reason ?? '')
      setUnlockOverrideType(overrideType ?? (court.status === 'locked' ? 'court' : 'lock'))
      const key = `${court.id}|${selectedDate}|${ts}`
      const override = slotOverrides[key]
      if (override && (override.bookingId || override.reservationId)) {
        setSourceOverrideKey(key)
        setSourceInfoOpen(true)
      } else {
        setUnlockModalOpen(true)
      }
    }
  }

  const handleLock = () => {
    if (selectedCourt && selectedSlot && lockReason.trim()) {
      const conflict = checkConflicts(selectedCourt.id, selectedDate, [selectedSlot])
      if (conflict.hasConflict) return
      lockSlot(selectedCourt.id, selectedDate, selectedSlot, lockReason.trim())
      setLockModalOpen(false)
      setSelectedCourt(null)
      setSelectedSlot('')
      setLockReason('')
    }
  }

  const handleUnlock = () => {
    if (selectedCourt && selectedSlot) {
      unlockSlot(selectedCourt.id, selectedDate, selectedSlot)
      setUnlockModalOpen(false)
      setSelectedCourt(null)
      setSelectedSlot('')
    }
  }

  const getBookedTimeSlots = (): string[] => {
    return timeSlotsFromRange(bookingForm.startTime, bookingForm.endTime)
  }

  const handleBookingSubmit = () => {
    const venue = venues.find(v => v.id === bookingForm.venueId)
    const court = venue?.courts.find(c => c.id === bookingForm.courtId)
    if (!venue || !court) return

    const bookedSlots = getBookedTimeSlots()
    addGroupBooking({
      venueId: bookingForm.venueId,
      venueName: venue.name,
      courtId: bookingForm.courtId,
      courtName: court.name,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      timeSlots: bookedSlots,
      contactName: bookingForm.contactName,
      contactPhone: bookingForm.contactPhone,
      price: Number(bookingForm.price) || 0,
      notes: bookingForm.notes,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
    })
    setGroupBookingOpen(false)
    setBookingForm({ venueId: '', courtId: '', date: '', startTime: '', endTime: '', contactName: '', contactPhone: '', price: '', notes: '' })
  }

  const pricingData = filteredCourts.flatMap(c =>
    c.pricingSlots.map(p => ({
      courtName: c.name,
      timeRange: `${p.startTime}-${p.endTime}`,
      dayType: p.dayType === 'weekday' ? '工作日' : '周末',
      weekdayPrice: p.dayType === 'weekday' ? p.price : '-',
      weekendPrice: p.dayType === 'weekend' ? p.price : '-',
    }))
  )

  const pricingColumns = [
    { key: 'courtName', header: '场地' },
    { key: 'timeRange', header: '时段' },
    { key: 'weekdayPrice', header: '工作日价格', render: (row: Record<string, unknown>) => row.weekdayPrice === '-' ? '-' : `¥${row.weekdayPrice}` },
    { key: 'weekendPrice', header: '周末价格', render: (row: Record<string, unknown>) => row.weekendPrice === '-' ? '-' : `¥${row.weekendPrice}` },
  ]

  const bookingColumns = [
    { key: 'venueName', header: '场馆' },
    { key: 'courtName', header: '场地' },
    { key: 'date', header: '日期', render: (row: any) => formatDisplayDate(row.date) },
    { key: 'timeSlots', header: '时段', render: (row: any) => (row.timeSlots as string[]).join('、') },
    { key: 'contactName', header: '联系人' },
    { key: 'price', header: '价格', render: (row: any) => `¥${row.price}` },
    { key: 'status', header: '状态', render: (row: any) => <StatusBadge status={row.status} label={row.status === 'pending' ? '待处理' : row.status === 'confirmed' ? '已确认' : '已取消'} /> },
    { key: 'detail', header: '', render: (row: any) => (
      <button className="text-xs text-surface-400 hover:text-accent-400 flex items-center gap-1" onClick={() => { setSelectedBooking(row); setDetailModalOpen(true) }}>
        <Eye className="h-3 w-3" />详情
      </button>
    )},
    { key: 'actions', header: '操作', render: (row: any) => {
      if (row.status === 'pending') return (
        <div className="flex gap-2">
          <button className="btn-primary text-xs px-3 py-1 flex items-center gap-1" onClick={() => confirmGroupBooking(row.id)}><CheckCircle className="h-3 w-3" />确认</button>
          <button className="btn-danger text-xs px-3 py-1 flex items-center gap-1" onClick={() => cancelGroupBooking(row.id)}><XCircle className="h-3 w-3" />取消</button>
        </div>
      )
      if (row.status === 'confirmed') return (
        <button className="btn-danger text-xs px-3 py-1 flex items-center gap-1" onClick={() => cancelGroupBooking(row.id)}><XCircle className="h-3 w-3" />取消包场</button>
      )
      return <span className="text-surface-500">—</span>
    }},
  ]

  const bookingCourts = bookingForm.venueId
    ? venues.find(v => v.id === bookingForm.venueId)?.courts ?? []
    : []

  const dateBookings = groupBookings.filter(b => b.date === selectedDate)
  const otherBookings = groupBookings.filter(b => b.date !== selectedDate)

  const unlockTitleMap = {
    lock: '解锁场地',
    booking: '解锁包场',
    reservation: '释放预约',
    court: '解锁场地时段',
  }

  const bookingConflict = bookingForm.venueId && bookingForm.courtId && bookingForm.date && bookingForm.startTime && bookingForm.endTime
    ? checkConflicts(bookingForm.courtId, bookingForm.date, getBookedTimeSlots())
    : null

  const lockConflict = selectedCourt && selectedSlot
    ? checkConflicts(selectedCourt.id, selectedDate, [selectedSlot])
    : null

  const getSourceDetail = (key: string) => {
    const override = slotOverrides[key]
    if (!override) return null
    if (override.bookingId) {
      const booking = groupBookings.find(b => b.id === override.bookingId)
      return {
        type: 'booking' as const,
        id: override.bookingId,
        label: '包场申请单号',
        contactName: booking?.contactName,
        contactPhone: booking?.contactPhone,
        timeRange: booking ? `${booking.startTime}-${booking.endTime}` : '',
        reason: override.reason,
        status: booking?.status,
      }
    }
    if (override.reservationId) {
      const res = reservations.find(r => r.id === override.reservationId)
      return {
        type: 'reservation' as const,
        id: override.reservationId,
        label: '预约订单号',
        contactName: res?.memberName,
        contactPhone: '',
        timeRange: res ? `${res.startTime}-${res.endTime}` : '',
        reason: override.reason,
        status: res?.status,
      }
    }
    return {
      type: 'lock' as const,
      id: '',
      label: '锁场',
      contactName: '',
      contactPhone: '',
      timeRange: '',
      reason: override.reason,
      status: '' as const,
    }
  }

  const sourceDetail = sourceOverrideKey ? getSourceDetail(sourceOverrideKey) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {venueTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedVenue(tab.key)}
                className={selectedVenue === tab.key ? 'btn-primary' : 'btn-secondary'}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-surface-800/60 rounded-lg p-1">
            <button className="p-1.5 rounded hover:bg-surface-700/60 text-surface-400 hover:text-surface-200 transition-colors" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              className="input-field !py-1 !px-2 text-sm w-36 text-center"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <button className="p-1.5 rounded hover:bg-surface-700/60 text-surface-400 hover:text-surface-200 transition-colors" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              className="text-xs px-2 py-1 rounded hover:bg-surface-700/60 text-surface-400 hover:text-accent-400 transition-colors"
              onClick={() => setSelectedDate(formatDate(new Date()))}
            >
              今天
            </button>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => {
          setBookingForm(f => ({ ...f, date: selectedDate }))
          setGroupBookingOpen(true)
        }}>
          <Users className="h-4 w-4" />
          团体包场
        </button>
      </div>

      <div className="text-sm text-surface-300">
        排期日期：<span className="text-accent-400 font-medium">{formatDisplayDate(selectedDate)}</span>
        {selectedDate === formatDate(new Date()) && <span className="ml-2 badge-green">今天</span>}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50 bg-surface-800/40">
                <th className="table-header px-4 py-3 w-28">场地</th>
                {timeSlots.map(ts => (
                  <th key={ts} className="table-header px-2 py-3 text-center">{ts}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCourts.map(court => (
                <tr key={court.id} className="border-b border-surface-700/30">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-surface-200">{court.venueName}</div>
                    <div className="text-xs text-surface-400">{court.name}</div>
                  </td>
                  {timeSlots.map(ts => {
                    const { status, reason, overrideType } = getSlotStatus(court, ts)
                    let cellClass = ''
                    if (overrideType === 'booking') cellClass = bookingCellStyles
                    else if (overrideType === 'reservation') cellClass = reservationCellStyles
                    else cellClass = cellStyles[status]

                    return (
                      <td key={ts} className="py-2 px-1">
                        <div
                          className={`${cellClass} rounded-lg h-12 flex items-center justify-center gap-1 text-xs font-medium transition-colors`}
                          onClick={() => handleCellClick(court, ts)}
                          title={reason ?? statusLabels[status]}
                        >
                          {overrideType === 'booking' && <Calendar className="h-3 w-3 text-purple-400" />}
                          {overrideType === 'reservation' && <Calendar className="h-3 w-3 text-blue-400" />}
                          {status === 'locked' && !overrideType && <Lock className="h-3 w-3 text-red-400" />}
                          {status === 'maintenance' && <Wrench className="h-3 w-3 text-surface-400" />}
                          <span className={
                            overrideType === 'booking' ? 'text-purple-400' :
                            overrideType === 'reservation' ? 'text-blue-400' :
                            status === 'available' ? 'text-accent-400' :
                            status === 'occupied' ? 'text-warning-400' :
                            status === 'locked' ? 'text-red-400' : 'text-surface-400'
                          }>
                            {overrideType === 'booking' ? '包场' :
                             overrideType === 'reservation' ? '预约' :
                             statusLabels[status]}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 border-t border-surface-700/30 text-xs text-surface-400 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-500/30 border border-accent-500/40" /> 可用</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" /> 预约</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/40" /> 包场</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning-500/30 border border-warning-500/40" /> 占用</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" /> 锁定</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-surface-500/30 border border-surface-500/40" /> 维护</span>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-surface-200 mb-3">分时段定价</h3>
        <DataTable columns={pricingColumns} data={pricingData as unknown as Record<string, unknown>[]} />
      </div>

      {dateBookings.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-surface-200 mb-3">今日团体包场申请</h3>
          <DataTable columns={bookingColumns} data={dateBookings as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {otherBookings.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-surface-200 mb-3">其他日期包场申请</h3>
          <DataTable columns={bookingColumns} data={otherBookings as unknown as Record<string, unknown>[]} />
        </div>
      )}

      <Modal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} title="锁定场地">
        {selectedCourt && (
          <div className="space-y-4">
            <div className="text-sm text-surface-300">
              场地：<span className="text-surface-100 font-medium">{selectedCourt.name}</span>
            </div>
            <div className="text-sm text-surface-300">
              日期：<span className="text-surface-100 font-medium">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="text-sm text-surface-300">
              时段：<span className="text-surface-100 font-medium">{selectedSlot}</span>
            </div>
            {lockConflict && lockConflict.hasConflict && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
                <div className="text-red-400 font-medium flex items-center gap-1"><Info className="h-3 w-3" />时段冲突，无法锁定</div>
                {lockConflict.details.map((d, i) => (
                  <div key={i} className="text-red-300">{d.timeSlot} 已被 {d.source} 占用</div>
                ))}
              </div>
            )}
            {!lockConflict?.hasConflict && (
              <div>
                <label className="block text-sm text-surface-400 mb-1">锁定原因</label>
                <textarea
                  className="input-field w-full h-24 resize-none"
                  value={lockReason}
                  onChange={e => setLockReason(e.target.value)}
                  placeholder="请输入锁定原因"
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setLockModalOpen(false)}>取消</button>
              {!lockConflict?.hasConflict && (
                <button className="btn-danger" onClick={handleLock} disabled={!lockReason.trim()}>确认锁定</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} title={unlockTitleMap[unlockOverrideType]}>
        {selectedCourt && (
          <div className="space-y-4">
            <div className="text-sm text-surface-300">
              场地：<span className="text-surface-100 font-medium">{selectedCourt.name}</span>
            </div>
            <div className="text-sm text-surface-300">
              日期：<span className="text-surface-100 font-medium">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="text-sm text-surface-300">
              时段：<span className="text-surface-100 font-medium">{selectedSlot}</span>
            </div>
            {unlockReason && (
              <div className="text-sm text-surface-300">
                {unlockOverrideType === 'booking' ? '包场' : unlockOverrideType === 'reservation' ? '预约' : '锁定'}原因：
                <span className={unlockOverrideType === 'booking' ? 'text-purple-400' : unlockOverrideType === 'reservation' ? 'text-blue-400' : 'text-red-400'}>{unlockReason}</span>
              </div>
            )}
            {unlockOverrideType === 'court' && (
              <div className="text-xs text-warning-400 bg-warning-500/10 rounded-lg p-2">
                该场地整体已锁定，解锁此时段后将仅恢复此时段的可用状态
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setUnlockModalOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleUnlock}>确认解锁</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={sourceInfoOpen} onClose={() => { setSourceInfoOpen(false); setSourceOverrideKey('') }} title="占用来源详情" size="md">
        {sourceDetail && selectedCourt && (
          <div className="space-y-4">
            <div className="text-sm text-surface-300">
              场地：<span className="text-surface-100 font-medium">{selectedCourt.name}</span> · 日期：<span className="text-surface-100 font-medium">{formatDisplayDate(selectedDate)}</span> · 时段：<span className="text-surface-100 font-medium">{selectedSlot}</span>
            </div>
            <div className="bg-surface-800/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  sourceDetail.type === 'booking' ? 'bg-purple-500/20 text-purple-400' :
                  sourceDetail.type === 'reservation' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {sourceDetail.type === 'booking' ? '包场占用' : sourceDetail.type === 'reservation' ? '预约占用' : '锁场'}
                </span>
              </div>
              {sourceDetail.id && (
                <div className="text-sm text-surface-300">
                  {sourceDetail.label}：<span className="text-surface-100 font-mono">{sourceDetail.id}</span>
                </div>
              )}
              {sourceDetail.contactName && (
                <div className="text-sm text-surface-300">
                  联系人：<span className="text-surface-100">{sourceDetail.contactName}</span>
                  {sourceDetail.contactPhone && <span className="text-surface-400 ml-2">{sourceDetail.contactPhone}</span>}
                </div>
              )}
              {sourceDetail.timeRange && (
                <div className="text-sm text-surface-300">
                  时间范围：<span className="text-surface-100">{sourceDetail.timeRange}</span>
                </div>
              )}
              {sourceDetail.reason && (
                <div className="text-sm text-surface-300">
                  原因：<span className="text-surface-100">{sourceDetail.reason}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => { setSourceInfoOpen(false); setSourceOverrideKey('') }}>关闭</button>
              <button className="btn-primary" onClick={() => {
                setSourceInfoOpen(false)
                setSourceOverrideKey('')
                setUnlockModalOpen(true)
              }}>解锁此时段</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedBooking(null) }} title="包场申请详情" size="lg">
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-surface-300">场馆：<span className="text-surface-100">{selectedBooking.venueName}</span></div>
              <div className="text-surface-300">场地：<span className="text-surface-100">{selectedBooking.courtName}</span></div>
              <div className="text-surface-300">日期：<span className="text-surface-100">{formatDisplayDate(selectedBooking.date)}</span></div>
              <div className="text-surface-300">时间：<span className="text-surface-100">{selectedBooking.startTime} - {selectedBooking.endTime}</span></div>
              <div className="text-surface-300">联系人：<span className="text-surface-100">{selectedBooking.contactName}</span></div>
              <div className="text-surface-300">联系电话：<span className="text-surface-100">{selectedBooking.contactPhone}</span></div>
              <div className="text-surface-300">价格：<span className="text-accent-400 font-medium">¥{selectedBooking.price}</span></div>
              <div className="text-surface-300">
                状态：<StatusBadge status={selectedBooking.status} label={selectedBooking.status === 'pending' ? '待处理' : selectedBooking.status === 'confirmed' ? '已确认' : '已取消'} />
              </div>
            </div>
            <div className="text-sm text-surface-300">
              覆盖时段：<span className="text-surface-100">{(selectedBooking.timeSlots as string[]).join('、')}</span>
            </div>
            {selectedBooking.notes && (
              <div className="text-sm text-surface-300">
                备注：<span className="text-surface-100">{selectedBooking.notes}</span>
              </div>
            )}
            <div className="bg-surface-800/40 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-surface-200">审批记录</div>
              <div className="text-xs text-surface-400">申请时间：{selectedBooking.createdAt}</div>
              {selectedBooking.confirmedAt && (
                <div className="text-xs text-accent-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" />确认时间：{selectedBooking.confirmedAt}</div>
              )}
              {selectedBooking.cancelledAt && (
                <div className="text-xs text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" />取消时间：{selectedBooking.cancelledAt}</div>
              )}
              {!selectedBooking.confirmedAt && !selectedBooking.cancelledAt && selectedBooking.status === 'pending' && (
                <div className="text-xs text-warning-400">等待审批</div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => { setDetailModalOpen(false); setSelectedBooking(null) }}>关闭</button>
              {selectedBooking.status === 'pending' && (
                <>
                  <button className="btn-danger" onClick={() => { cancelGroupBooking(selectedBooking.id); setDetailModalOpen(false); setSelectedBooking(null) }}>
                    <XCircle className="h-3 w-3 inline mr-1" />取消申请
                  </button>
                  <button className="btn-primary" onClick={() => { confirmGroupBooking(selectedBooking.id); setDetailModalOpen(false); setSelectedBooking(null) }}>
                    <CheckCircle className="h-3 w-3 inline mr-1" />确认包场
                  </button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button className="btn-danger" onClick={() => { cancelGroupBooking(selectedBooking.id); setDetailModalOpen(false); setSelectedBooking(null) }}>
                  <XCircle className="h-3 w-3 inline mr-1" />取消包场
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={groupBookingOpen} onClose={() => setGroupBookingOpen(false)} title="团体包场申请" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-400 mb-1">场馆</label>
            <select className="input-field w-full" value={bookingForm.venueId} onChange={e => setBookingForm(f => ({ ...f, venueId: e.target.value, courtId: '' }))}>
              <option value="">请选择场馆</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">场地</label>
            <select className="input-field w-full" value={bookingForm.courtId} onChange={e => setBookingForm(f => ({ ...f, courtId: e.target.value }))}>
              <option value="">请选择场地</option>
              {bookingCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">日期</label>
            <input type="date" className="input-field w-full" value={bookingForm.date} onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">开始时间</label>
            <input type="time" className="input-field w-full" value={bookingForm.startTime} onChange={e => setBookingForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">结束时间</label>
            <input type="time" className="input-field w-full" value={bookingForm.endTime} onChange={e => setBookingForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">联系人</label>
            <input type="text" className="input-field w-full" placeholder="联系人姓名" value={bookingForm.contactName} onChange={e => setBookingForm(f => ({ ...f, contactName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">联系电话</label>
            <input type="tel" className="input-field w-full" placeholder="联系电话" value={bookingForm.contactPhone} onChange={e => setBookingForm(f => ({ ...f, contactPhone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">价格 (元)</label>
            <input type="number" className="input-field w-full" placeholder="包场价格" value={bookingForm.price} onChange={e => setBookingForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-surface-400 mb-1">备注</label>
            <textarea className="input-field w-full h-20 resize-none" placeholder="备注信息" value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {bookingForm.startTime && bookingForm.endTime && (
            <div className="col-span-2 text-xs text-surface-400">
              将覆盖时段：<span className="text-accent-400">{getBookedTimeSlots().join('、') || '无匹配时段'}</span>
            </div>
          )}
          {bookingConflict && bookingConflict.hasConflict && (
            <div className="col-span-2 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
              <div className="text-red-400 font-medium flex items-center gap-1"><Info className="h-3 w-3" />以下时段存在冲突</div>
              {bookingConflict.details.map((d, i) => (
                <div key={i} className="text-red-300">{d.timeSlot} 已被 {d.source} 占用</div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn-secondary" onClick={() => setGroupBookingOpen(false)}>取消</button>
          <button className="btn-primary" onClick={handleBookingSubmit} disabled={!bookingForm.venueId || !bookingForm.courtId || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.contactName || (bookingConflict?.hasConflict ?? false)}>提交申请</button>
        </div>
      </Modal>
    </div>
  )
}
