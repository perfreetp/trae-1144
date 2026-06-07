import { useState } from 'react'
import { ClipboardList, RotateCcw, MessageSquareWarning } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import type { Reservation, RefundRequest, Complaint, ReservationStatus } from '@/types'

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

  const reservations = useAppStore((s) => s.reservations)
  const refundRequests = useAppStore((s) => s.refundRequests)
  const complaints = useAppStore((s) => s.complaints)
  const confirmReservation = useAppStore((s) => s.confirmReservation)
  const cancelReservation = useAppStore((s) => s.cancelReservation)
  const approveRefund = useAppStore((s) => s.approveRefund)
  const rejectRefund = useAppStore((s) => s.rejectRefund)
  const updateComplaintStatus = useAppStore((s) => s.updateComplaintStatus)

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
    </div>
  )
}
