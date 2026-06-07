import { useState } from 'react'
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import type { EquipmentRecord, InspectionTask, GateRecord, Complaint } from '@/types'

const tabs = ['器材借还', '保洁巡检', '闸机记录', '投诉处理']
const inspectionTypeMap: Record<string, string> = { cleaning: '保洁', equipment: '设备', gate: '闸机' }
const complaintCategoryOptions = ['设施问题', '服务态度', '卫生问题', '场地问题', '噪音问题', '退款问题']

export default function Inspection() {
  const [tab, setTab] = useState(0)
  const { equipment, equipmentRecords, inspectionTasks, gateRecords, complaints, members, venues,
    addEquipmentRecord, updateEquipmentStock, completeInspection, addInspectionTask, addComplaint, updateComplaintStatus } = useAppStore()

  const [borrowOpen, setBorrowOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [selEq, setSelEq] = useState('')
  const [selMember, setSelMember] = useState('')
  const [condition, setCondition] = useState<'good' | 'damaged'>('good')

  const [inspectOpen, setInspectOpen] = useState(false)
  const [insType, setInsType] = useState<'cleaning' | 'equipment' | 'gate'>('cleaning')
  const [insAssignee, setInsAssignee] = useState('')
  const [insVenue, setInsVenue] = useState('')
  const [insDesc, setInsDesc] = useState('')
  const [insTime, setInsTime] = useState('')

  const [venueFilter, setVenueFilter] = useState('')

  const [compOpen, setCompOpen] = useState(false)
  const [compName, setCompName] = useState('')
  const [compCat, setCompCat] = useState('设施问题')
  const [compDesc, setCompDesc] = useState('')

  const [assignId, setAssignId] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignee, setAssignee] = useState('')

  const resetBorrow = () => { setSelEq(''); setSelMember(''); setCondition('good') }
  const resetReturn = () => { setSelEq(''); setSelMember(''); setCondition('good') }
  const resetInspect = () => { setInsType('cleaning'); setInsAssignee(''); setInsVenue(''); setInsDesc(''); setInsTime('') }
  const resetComp = () => { setCompName(''); setCompCat('设施问题'); setCompDesc('') }

  const handleBorrow = () => {
    const eq = equipment.find(e => e.id === selEq)
    const m = members.find(m => m.id === selMember)
    if (!eq || !m) return
    addEquipmentRecord({ equipmentName: eq.name, type: 'borrow', memberId: m.id, memberName: m.name, timestamp: new Date().toLocaleString('zh-CN'), condition: 'good', equipmentId: eq.id })
    updateEquipmentStock(eq.id, -1)
    setBorrowOpen(false); resetBorrow()
  }

  const handleReturn = () => {
    const eq = equipment.find(e => e.id === selEq)
    const m = members.find(m => m.id === selMember)
    if (!eq || !m) return
    addEquipmentRecord({ equipmentName: eq.name, type: 'return', memberId: m.id, memberName: m.name, timestamp: new Date().toLocaleString('zh-CN'), condition, equipmentId: eq.id })
    updateEquipmentStock(eq.id, 1)
    setReturnOpen(false); resetReturn()
  }

  const handleAddInspection = () => {
    const venue = venues.find(v => v.id === insVenue)
    if (!venue) return
    addInspectionTask({ type: insType, assignee: insAssignee, venueId: insVenue, venueName: venue.name, scheduledAt: insTime, status: 'pending', issues: [], description: insDesc })
    setInspectOpen(false); resetInspect()
  }

  const handleAddComplaint = () => {
    addComplaint({ orderId: '', userId: '', userName: compName, category: compCat, description: compDesc, status: 'open', assignee: '', createdAt: new Date().toLocaleString('zh-CN'), resolvedAt: '' })
    setCompOpen(false); resetComp()
  }

  const eqColumns = [
    { key: 'equipmentName', header: '器材名称' },
    { key: 'type', header: '操作类型', render: (r: any) => <span className={r.type === 'borrow' ? 'badge-green' : 'badge-blue'}>{r.type === 'borrow' ? '借出' : '归还'}</span> },
    { key: 'memberName', header: '会员' },
    { key: 'timestamp', header: '时间' },
    { key: 'condition', header: '状态', render: (r: any) => <span className={r.condition === 'good' ? 'badge-green' : 'badge-red'}>{r.condition === 'good' ? '完好' : '损坏'}</span> },
  ]

  const insColumns = [
    { key: 'type', header: '类型', render: (r: any) => <span className="badge-gray">{inspectionTypeMap[r.type]}</span> },
    { key: 'assignee', header: '执行人' },
    { key: 'venueName', header: '场馆' },
    { key: 'scheduledAt', header: '计划时间' },
    { key: 'status', header: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'description', header: '问题描述' },
    { key: 'action', header: '操作', render: (r: any) => {
      if (r.status === 'pending') return <button className="btn-primary text-xs px-3 py-1" onClick={() => completeInspection(r.id)}>开始</button>
      if (r.status === 'in_progress') return <button className="btn-primary text-xs px-3 py-1" onClick={() => completeInspection(r.id)}>完成</button>
      return <span className="text-surface-500">—</span>
    }},
  ]

  const filteredGates = venueFilter ? gateRecords.filter((g: GateRecord) => g.gateName.includes(venues.find(v => v.id === venueFilter)?.name ?? '')) : gateRecords
  const gateColumns = [
    { key: 'memberName', header: '会员' },
    { key: 'gateName', header: '闸机' },
    { key: 'direction', header: '方向', render: (r: any) => <span className={r.direction === 'in' ? 'badge-green' : 'badge-blue'}>{r.direction === 'in' ? '进入' : '离开'}</span> },
    { key: 'timestamp', header: '时间' },
    { key: 'isAbnormal', header: '异常', render: (r: any) => r.isAbnormal ? <span className="badge-red">异常</span> : <span className="badge-green">正常</span> },
  ]

  const compColumns = [
    { key: 'id', header: '工单号' },
    { key: 'userName', header: '会员' },
    { key: 'category', header: '类别' },
    { key: 'description', header: '描述', render: (r: any) => <span className="truncate max-w-[200px] block">{r.description}</span> },
    { key: 'status', header: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'assignee', header: '处理人', render: (r: any) => r.assignee || '—' },
    { key: 'createdAt', header: '时间' },
    { key: 'action', header: '操作', render: (r: any) => {
      if (r.status === 'open') return <button className="btn-primary text-xs px-3 py-1" onClick={() => { setAssignId(r.id); setAssignOpen(true); setAssignee('') }}>指派</button>
      if (r.status === 'processing') return <button className="btn-primary text-xs px-3 py-1" onClick={() => updateComplaintStatus(r.id, 'resolved')}>完成</button>
      if (r.status === 'resolved') return <button className="btn-secondary text-xs px-3 py-1" onClick={() => updateComplaintStatus(r.id, 'closed')}>关闭</button>
      return <span className="text-surface-500">—</span>
    }},
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={tab === i ? 'btn-primary' : 'btn-secondary'}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {equipment.map(eq => (
              <div key={eq.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-surface-200">{eq.name}</span>
                  <span className="badge-gray text-xs">{eq.category}</span>
                </div>
                <div className="w-full bg-surface-700/50 rounded-full h-2">
                  <div className="bg-accent-500 h-2 rounded-full transition-all" style={{ width: `${(eq.availableStock / eq.totalStock) * 100}%` }} />
                </div>
                <div className="text-xs text-surface-400">{eq.availableStock}/{eq.totalStock} 可用</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { resetBorrow(); setBorrowOpen(true) }} className="btn-primary flex items-center justify-center gap-2 py-3"><ArrowUpCircle className="h-4 w-4" />借出器材</button>
            <button onClick={() => { resetReturn(); setReturnOpen(true) }} className="btn-secondary flex items-center justify-center gap-2 py-3"><ArrowDownCircle className="h-4 w-4" />归还器材</button>
          </div>
          <DataTable columns={eqColumns} data={equipmentRecords as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-4">
          <button onClick={() => { resetInspect(); setInspectOpen(true) }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" />新建巡检任务</button>
          <DataTable columns={insColumns} data={inspectionTasks as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-4">
          <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} className="input-field">
            <option value="">全部场馆</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <DataTable columns={gateColumns} data={filteredGates as unknown as Record<string, unknown>[]} />
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-4">
          <button onClick={() => { resetComp(); setCompOpen(true) }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" />新建投诉</button>
          <DataTable columns={compColumns} data={complaints as unknown as Record<string, unknown>[]} />
        </div>
      )}

      <Modal isOpen={borrowOpen} onClose={() => setBorrowOpen(false)} title="借出器材">
        <div className="space-y-4">
          <select value={selEq} onChange={e => setSelEq(e.target.value)} className="input-field w-full"><option value="">选择器材</option>{equipment.filter(e => e.availableStock > 0).map(e => <option key={e.id} value={e.id}>{e.name} ({e.availableStock}可用)</option>)}</select>
          <select value={selMember} onChange={e => setSelMember(e.target.value)} className="input-field w-full"><option value="">选择会员</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <button onClick={handleBorrow} disabled={!selEq || !selMember} className="btn-primary w-full disabled:opacity-50">确认借出</button>
        </div>
      </Modal>

      <Modal isOpen={returnOpen} onClose={() => setReturnOpen(false)} title="归还器材">
        <div className="space-y-4">
          <select value={selEq} onChange={e => setSelEq(e.target.value)} className="input-field w-full"><option value="">选择器材</option>{equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <select value={selMember} onChange={e => setSelMember(e.target.value)} className="input-field w-full"><option value="">选择会员</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <select value={condition} onChange={e => setCondition(e.target.value as 'good' | 'damaged')} className="input-field w-full"><option value="good">完好</option><option value="damaged">损坏</option></select>
          <button onClick={handleReturn} disabled={!selEq || !selMember} className="btn-primary w-full disabled:opacity-50">确认归还</button>
        </div>
      </Modal>

      <Modal isOpen={inspectOpen} onClose={() => setInspectOpen(false)} title="新建巡检任务">
        <div className="space-y-4">
          <select value={insType} onChange={e => setInsType(e.target.value as typeof insType)} className="input-field w-full"><option value="cleaning">保洁</option><option value="equipment">设备</option><option value="gate">闸机</option></select>
          <input value={insAssignee} onChange={e => setInsAssignee(e.target.value)} placeholder="执行人" className="input-field w-full" />
          <select value={insVenue} onChange={e => setInsVenue(e.target.value)} className="input-field w-full"><option value="">选择场馆</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
          <input value={insDesc} onChange={e => setInsDesc(e.target.value)} placeholder="描述" className="input-field w-full" />
          <input type="datetime-local" value={insTime} onChange={e => setInsTime(e.target.value)} className="input-field w-full" />
          <button onClick={handleAddInspection} disabled={!insAssignee || !insVenue || !insTime} className="btn-primary w-full disabled:opacity-50">创建任务</button>
        </div>
      </Modal>

      <Modal isOpen={compOpen} onClose={() => setCompOpen(false)} title="新建投诉" size="lg">
        <div className="space-y-4">
          <input value={compName} onChange={e => setCompName(e.target.value)} placeholder="投诉人姓名" className="input-field w-full" />
          <select value={compCat} onChange={e => setCompCat(e.target.value)} className="input-field w-full">{complaintCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <textarea value={compDesc} onChange={e => setCompDesc(e.target.value)} placeholder="投诉描述" rows={3} className="input-field w-full" />
          <button onClick={handleAddComplaint} disabled={!compName || !compDesc} className="btn-primary w-full disabled:opacity-50">提交投诉</button>
        </div>
      </Modal>

      <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="指派处理人">
        <div className="space-y-4">
          <input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="处理人姓名" className="input-field w-full" />
          <button onClick={() => { updateComplaintStatus(assignId, 'processing', assignee); setAssignOpen(false) }} disabled={!assignee} className="btn-primary w-full disabled:opacity-50">确认指派</button>
        </div>
      </Modal>
    </div>
  )
}
