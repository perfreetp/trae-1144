import { useState, useMemo } from 'react'
import { ClipboardList, RotateCcw, MessageSquareWarning, Plus, Calculator } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import type { Reservation, RefundRequest, Complaint, ReservationStatus } from '@/types'

const timeSlots = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22']

function timeSlotsFromRange(startTime: string, endTime: string): string[] {
  const startHour = parseInt(startTime.split(':')[0] || '0')
  const endHour = parseInt(endTime.split(':')[0] || '0')
  const result: string[] = []
  for (const ts of timeSlots) {
    const [slotStart, slotEnd] = ts.split('-').map(Number)
    if (slotStart < endHour && slotEnd > startHour) {
      result.push(ts)
    }
  }
  return result
}

const tabs = [
  { key: 'reservations', label: '预约订单', icon: ClipboardList },
  { key: 'refunds', label: '退款审核', icon: RotateCcw },
  { key: 'complaints', label: '投诉处理', icon: MessageSquareWarning },
] as const

type TabKey = (typeof tabs)[number]['key']

const reservationFilters: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

export default function Orders() {
  const [activeTab, setActiveTab] = useState<TabKey>('reservations')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [assigneeModal, setAssigneeModal] = useState<string | null>(null)
  const [assigneeName, setAssigneeName] = useState('')
  const [newResModalOpen, setNewResModalOpen] = useState(false)

  const reservations = useAppStore((s) => s.reservations)
  const refundRequests = useAppStore((s) => s.refundRequests)
  const complaints = useAppStore((s) => s.complaints)
  const members = useAppStore((s) => s.members)
  const venues = useAppStore((s) => s.venues)
  const confirmReservation = useAppStore((s) => s.confirmReservation)
  const cancelReservation = useAppStore((s) => s.cancelReservation)
  const approveRefund = useAppStore((s) => s.approveRefund)
  const rejectRefund = useAppStore((s) => s.rejectRefund)
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus)
  const addReservation = useAppStore((s) => s.addReservation)

  const [resForm, setResForm] = useState({
    memberId: '',
    venueId: '',
    courtId: '',
    date: '',
    startTime: '',
    endTime: '',
    paymentMethod: 'member_card' as const,
  })

  const resFormCourts = resForm.venueId
    ? venues.find(v => v.id === resForm.venueId)?.courts ?? []
    : []

  const selectedCourt = resForm.courtId
    ? resFormCourts.find(c => c.id === resForm.courtId)
    : null

  const coveredSlots = useMemo(
    () => resForm.startTime && resForm.endTime ? timeSlotsFromRange(resForm.startTime, resForm.endTime) : [],
    [resForm.startTime, resForm.endTime]
  )

  const calculatedPrice = useMemo(() => {
    if (!selectedCourt || !resForm.date || coveredSlots.length === 0) return 0
    const date = new Date(resForm.date)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const dayType = isWeekend ? 'weekend' : 'weekday'
    let total = 0
    for (const slot of coveredSlots) {
      const [slotStart] = slot.split('-').map(Number)
      const matchingSlot = selectedCourt.pricingSlots.find(
        p => p.dayType === dayType && parseInt(p.startTime.split(':')[0]) <= slotStart && parseInt(p.endTime.split(':')[0]) > slotStart
      )
      if (matchingSlot) total += matchingSlot.price
    }
    return total
  }, [selectedCourt, resForm.date, coveredSlots])

  const handleNewReservation = () => {
    const member = members.find(m => m.id === resForm.memberId)
    const venue = venues.find(v => v.id === resForm.venueId)
    const court = resFormCourts.find(c => c.id === resForm.courtId)
    if (!member || !venue || !court) return

    addReservation({
      courtId: court.id,
      userId: member.id,
      date: resForm.date,
      startTime: resForm.startTime,
      endTime: resForm.endTime,
      status: 'pending',
      totalPrice: calculatedPrice,
      paymentMethod: resForm.paymentMethod,
      createdAt: new Date().toLocaleString('zh-CN'),
      memberName: member.name,
      courtName: court.name,
      venueName: venue.name,
    })
    setNewResModalOpen(false)
    setResForm({ memberId: '', venueId: '', courtId: '', date: '', startTime: '', endTime: '', paymentMethod: 'member_card' })
  }

  const filteredReservations = statusFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.status === statusFilter)

  const reservationColumns = [
    { key: 'id', header: '订单号', render: (r: any) => r.id },
    { key: 'memberName', header: '会员', render: (r: any) => r.memberName },
    { key: 'venueName', header: '场馆', render: (r: any) => r.venueName },
    { key: 'courtName', header: '场地', render: (r: any) => r.courtName },
    { key: 'date', header: '日期', render: (r: any) => r.date },
    { key: 'time', header: '时段', render: (r: any) => `${r.startTime}-${r.endTime}` },
    { key: 'totalPrice', header: '金额', render: (r: any) => <span className="font-mono">¥{r.totalPrice}</span> },
    { key: 'status', header: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '操作', render: (r: any) => {
        if (r.status === 'pending') {
          return (
            <div className="flex gap-2">
              <button className="btn-primary px-3 py-1 text-xs" onClick={() => confirmReservation(r.id)}>确认</button>
              <button className="btn-danger px-3 py-1 text-xs" onClick={() => cancelReservation(r.id)}>取消</button>
            </div>
          )
        }
        if (r.status === 'confirmed') {
          return <button className="btn-danger px-3 py-1 text-xs" onClick={() => cancelReservation(r.id)}>取消</button>
        }
        return <span className="text-surface-500">—</span>
      },
    },
  ]

  const refundColumns = [
    { key: 'id', header: '申请单号', render: (r: any) => r.id },
    { key: 'memberName', header: '会员', render: (r: any) => r.memberName },
    { key: 'orderInfo', header: '订单信息', render: (r: any) => r.orderInfo },
    { key: 'amount', header: '退款金额', render: (r: any) => <span className="text-red-400 font-mono">¥{r.amount}</span> },
    { key: 'reason', header: '退款原因', render: (r: any) => r.reason },
    { key: 'status', header: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: '申请时间', render: (r: any) => r.createdAt },
    {
      key: 'actions', header: '操作', render: (r: any) => {
        if (r.status === 'pending') {
          return (
            <div className="flex gap-2">
              <button className="btn-primary px-3 py-1 text-xs" onClick={() => approveRefund(r.id)}>通过</button>
              <button className="btn-danger px-3 py-1 text-xs" onClick={() => rejectRefund(r.id)}>拒绝</button>
            </div>
          )
        }
        return <StatusBadge status={r.status} />
      },
    },
  ]

  const complaintColumns = [
    { key: 'id', header: '工单号', render: (c: any) => c.id },
    { key: 'userName', header: '会员', render: (c: any) => c.userName },
    { key: 'category', header: '类别', render: (c: any) => <span className="badge-blue">{c.category}</span> },
    { key: 'description', header: '问题描述', render: (c: any) => c.description.length > 30 ? c.description.slice(0, 30) + '...' : c.description },
    { key: 'status', header: '状态', render: (c: any) => <StatusBadge status={c.status} /> },
    { key: 'assignee', header: '处理人', render: (c: any) => c.assignee || <span className="text-surface-500">未指派</span> },
    { key: 'createdAt', header: '创建时间', render: (c: any) => c.createdAt },
    {
      key: 'actions', header: '操作', render: (c: any) => {
        if (c.status === 'open') {
          return <button className="btn-primary px-3 py-1 text-xs" onClick={() => setAssigneeModal(c.id)}>指派</button>
        }
        if (c.status === 'processing') {
          return <button className="btn-primary px-3 py-1 text-xs" onClick={() => updateComplaintStatus(c.id, 'resolved')}>完成</button>
        }
        if (c.status === 'resolved') {
          return <button className="btn-secondary px-3 py-1 text-xs" onClick={() => updateComplaintStatus(c.id, 'closed')}>关闭</button>
        }
        return <span className="text-surface-500">—</span>
      },
    },
  ]

  const handleAssign = () => {
    if (assigneeModal && assigneeName.trim()) {
      updateComplaintStatus(assigneeModal, 'processing', assigneeName.trim())
      setAssigneeModal(null)
      setAssigneeName('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/20' : 'bg-surface-800/60 text-surface-400 hover:bg-surface-700/60 hover:text-surface-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'reservations' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {reservationFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    statusFilter === f.value ? 'bg-accent-600/20 text-accent-400' : 'bg-surface-700/40 text-surface-400 hover:bg-surface-700/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setNewResModalOpen(true)}>
              <Plus className="h-4 w-4" />
              新建预约
            </button>
          </div>
          <DataTable columns={reservationColumns} data={filteredReservations as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {activeTab === 'refunds' && (
        <DataTable columns={refundColumns} data={refundRequests as unknown as Record<string, unknown>[]} />
      )}

      {activeTab === 'complaints' && (
        <DataTable columns={complaintColumns} data={complaints as unknown as Record<string, unknown>[]} />
      )}

      <Modal isOpen={!!assigneeModal} onClose={() => { setAssigneeModal(null); setAssigneeName('') }} title="指派处理人" size="sm">
        <div className="space-y-4">
          <input
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
            placeholder="请输入处理人姓名"
            className="input-field w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleAssign()}
          />
          <div className="flex justify-end gap-3">
            <button className="btn-secondary px-4 py-2 text-sm" onClick={() => { setAssigneeModal(null); setAssigneeName('') }}>取消</button>
            <button className="btn-primary px-4 py-2 text-sm" onClick={handleAssign} disabled={!assigneeName.trim()}>确认指派</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={newResModalOpen} onClose={() => setNewResModalOpen(false)} title="新建预约" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-surface-400 mb-1">会员</label>
            <select className="input-field w-full" value={resForm.memberId} onChange={e => setResForm(f => ({ ...f, memberId: e.target.value }))}>
              <option value="">请选择会员</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}（{m.phone}）</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">支付方式</label>
            <select className="input-field w-full" value={resForm.paymentMethod} onChange={e => setResForm(f => ({ ...f, paymentMethod: e.target.value as any }))}>
              <option value="member_card">会员卡</option>
              <option value="wechat">微信支付</option>
              <option value="alipay">支付宝</option>
              <option value="cash">现金</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">场馆</label>
            <select className="input-field w-full" value={resForm.venueId} onChange={e => setResForm(f => ({ ...f, venueId: e.target.value, courtId: '' }))}>
              <option value="">请选择场馆</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">场地</label>
            <select className="input-field w-full" value={resForm.courtId} onChange={e => setResForm(f => ({ ...f, courtId: e.target.value }))}>
              <option value="">请选择场地</option>
              {resFormCourts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1">日期</label>
            <input type="date" className="input-field w-full" value={resForm.date} onChange={e => setResForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-surface-400 mb-1">开始时间</label>
              <input type="time" className="input-field w-full" value={resForm.startTime} onChange={e => setResForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">结束时间</label>
              <input type="time" className="input-field w-full" value={resForm.endTime} onChange={e => setResForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>
          {coveredSlots.length > 0 && (
            <div className="col-span-2 text-xs text-surface-400">
              覆盖时段：<span className="text-accent-400">{coveredSlots.join('、')}</span>
            </div>
          )}
          {calculatedPrice > 0 && (
            <div className="col-span-2 flex items-center gap-2 bg-surface-800/40 rounded-lg p-3">
              <Calculator className="h-4 w-4 text-accent-400" />
              <span className="text-sm text-surface-300">预估金额：</span>
              <span className="text-lg font-bold text-accent-400">¥{calculatedPrice}</span>
              <span className="text-xs text-surface-500">（基于分时段定价计算）</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn-secondary" onClick={() => setNewResModalOpen(false)}>取消</button>
          <button className="btn-primary" onClick={handleNewReservation} disabled={!resForm.memberId || !resForm.venueId || !resForm.courtId || !resForm.date || !resForm.startTime || !resForm.endTime}>提交预约</button>
        </div>
      </Modal>
    </div>
  )
}
