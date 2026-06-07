import { useState } from 'react'
import { Lock, Wrench, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import DataTable from '@/components/DataTable'
import type { Court, CourtStatus } from '@/types'

const timeSlots = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22']
const venueTabs = [
  { key: 'all', label: '全部' },
  { key: 'basketball', label: '篮球馆' },
  { key: 'badminton', label: '羽毛球馆' },
  { key: 'swimming', label: '游泳馆' },
]

const cellStyles: Record<CourtStatus, string> = {
  available: 'bg-accent-500/20 border border-accent-500/30 hover:bg-accent-500/30 cursor-pointer',
  occupied: 'bg-warning-500/20 border border-warning-500/30',
  locked: 'bg-red-500/20 border border-red-500/30 cursor-pointer',
  maintenance: 'bg-surface-500/20 border border-surface-500/30',
}

const statusLabels: Record<CourtStatus, string> = {
  available: '可用',
  occupied: '占用',
  locked: '锁定',
  maintenance: '维护',
}

function getSlotStatus(court: Court): CourtStatus {
  return court.status
}

export default function Schedule() {
  const { venues, lockCourt, unlockCourt } = useAppStore()
  const [selectedVenue, setSelectedVenue] = useState('all')
  const [lockModalOpen, setLockModalOpen] = useState(false)
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [groupBookingOpen, setGroupBookingOpen] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [lockReason, setLockReason] = useState('')

  const [bookingForm, setBookingForm] = useState({
    venueId: '', courtId: '', date: '', startTime: '', endTime: '',
    contactName: '', contactPhone: '', price: '', notes: '',
  })

  const filteredCourts = selectedVenue === 'all'
    ? venues.flatMap(v => v.courts.map(c => ({ ...c, venueName: v.name })))
    : venues.filter(v => v.type === selectedVenue).flatMap(v => v.courts.map(c => ({ ...c, venueName: v.name })))

  const handleCellClick = (court: Court) => {
    if (court.status === 'available') {
      setSelectedCourt(court)
      setLockReason('')
      setLockModalOpen(true)
    } else if (court.status === 'locked') {
      setSelectedCourt(court)
      setUnlockModalOpen(true)
    }
  }

  const handleLock = () => {
    if (selectedCourt && lockReason.trim()) {
      lockCourt(selectedCourt.id, lockReason.trim())
      setLockModalOpen(false)
      setSelectedCourt(null)
      setLockReason('')
    }
  }

  const handleUnlock = () => {
    if (selectedCourt) {
      unlockCourt(selectedCourt.id)
      setUnlockModalOpen(false)
      setSelectedCourt(null)
    }
  }

  const handleBookingSubmit = () => {
    alert('包场申请已提交')
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

  const bookingCourts = bookingForm.venueId
    ? venues.find(v => v.id === bookingForm.venueId)?.courts ?? []
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <button className="btn-primary flex items-center gap-2" onClick={() => setGroupBookingOpen(true)}>
          <Users className="h-4 w-4" />
          团体包场
        </button>
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
              {filteredCourts.map(court => {
                const status = getSlotStatus(court)
                const cellClass = cellStyles[status]
                return (
                  <tr key={court.id} className="border-b border-surface-700/30">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-surface-200">{court.venueName}</div>
                      <div className="text-xs text-surface-400">{court.name}</div>
                    </td>
                    {timeSlots.map(ts => (
                      <td key={ts} className="py-2 px-1">
                        <div
                          className={`${cellClass} rounded-lg h-12 flex items-center justify-center gap-1 text-xs font-medium transition-colors`}
                          onClick={() => handleCellClick(court)}
                          title={status === 'locked' ? court.lockReason ?? '' : statusLabels[status]}
                        >
                          {status === 'locked' && <Lock className="h-3 w-3 text-red-400" />}
                          {status === 'maintenance' && <Wrench className="h-3 w-3 text-surface-400" />}
                          <span className={
                            status === 'available' ? 'text-accent-400' :
                            status === 'occupied' ? 'text-warning-400' :
                            status === 'locked' ? 'text-red-400' : 'text-surface-400'
                          }>{statusLabels[status]}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 border-t border-surface-700/30 text-xs text-surface-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-500/30 border border-accent-500/40" /> 可用</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning-500/30 border border-warning-500/40" /> 占用</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" /> 锁定</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-surface-500/30 border border-surface-500/40" /> 维护</span>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-surface-200 mb-3">分时段定价</h3>
        <DataTable columns={pricingColumns} data={pricingData as unknown as Record<string, unknown>[]} />
      </div>

      <Modal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} title="锁定场地">
        {selectedCourt && (
          <div className="space-y-4">
            <div className="text-sm text-surface-300">
              场地：<span className="text-surface-100 font-medium">{selectedCourt.name}</span>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">锁定原因</label>
              <textarea
                className="input-field w-full h-24 resize-none"
                value={lockReason}
                onChange={e => setLockReason(e.target.value)}
                placeholder="请输入锁定原因"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setLockModalOpen(false)}>取消</button>
              <button className="btn-danger" onClick={handleLock} disabled={!lockReason.trim()}>确认锁定</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} title="解锁场地">
        {selectedCourt && (
          <div className="space-y-4">
            <div className="text-sm text-surface-300">
              场地：<span className="text-surface-100 font-medium">{selectedCourt.name}</span>
            </div>
            <div className="text-sm text-surface-300">
              锁定原因：<span className="text-red-400">{selectedCourt.lockReason}</span>
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setUnlockModalOpen(false)}>取消</button>
              <button className="btn-primary" onClick={handleUnlock}>确认解锁</button>
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
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn-secondary" onClick={() => setGroupBookingOpen(false)}>取消</button>
          <button className="btn-primary" onClick={handleBookingSubmit}>提交申请</button>
        </div>
      </Modal>
    </div>
  )
}
