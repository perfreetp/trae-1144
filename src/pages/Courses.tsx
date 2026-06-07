import { useState } from 'react'
import { Plus, Users, Calendar, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import type { Course, Activity } from '@/types'

const tabs = [
  { key: 'courses', label: '课程管理', icon: Calendar },
  { key: 'activities', label: '活动管理', icon: Users },
  { key: 'checkin', label: '签到核销', icon: CheckCircle },
]

const categories = ['篮球', '羽毛球', '游泳'] as const
const catColor: Record<string, string> = {
  '篮球': 'bg-orange-500/20 text-orange-400',
  '羽毛球': 'bg-green-500/20 text-green-400',
  '游泳': 'bg-blue-500/20 text-blue-400',
}

const statusMap: Record<string, string> = {
  enrolled: '待签到',
  checked_in: '已签到',
  cancelled: '已取消',
}

export default function Courses() {
  const [tab, setTab] = useState('courses')
  const { courses, activities, enrollments, members, coaches, venues, addCourse, addActivity, addEnrollment, checkInEnrollment } = useAppStore()

  const [addCourseOpen, setAddCourseOpen] = useState(false)
  const [addActivityOpen, setAddActivityOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollTarget, setEnrollTarget] = useState<{ type: 'course' | 'activity'; id: string; title: string } | null>(null)
  const [selectedMember, setSelectedMember] = useState('')

  const [courseForm, setCourseForm] = useState({ title: '', category: '篮球', coachId: '', venueId: '', schedule: '', capacity: 10, price: 0 })
  const [activityForm, setActivityForm] = useState({ title: '', venueId: '', date: '', capacity: 20, fee: 0, description: '' })

  const handleAddCourse = () => {
    const coach = coaches.find(c => c.id === courseForm.coachId)
    const venue = venues.find(v => v.id === courseForm.venueId)
    if (!coach || !venue) return
    addCourse({ ...courseForm, coachName: coach.name, venueName: venue.name, enrolled: 0, status: 'active' })
    setCourseForm({ title: '', category: '篮球', coachId: '', venueId: '', schedule: '', capacity: 10, price: 0 })
    setAddCourseOpen(false)
  }

  const handleAddActivity = () => {
    const venue = venues.find(v => v.id === activityForm.venueId)
    if (!venue) return
    addActivity({ ...activityForm, venueName: venue.name, enrolled: 0, status: 'upcoming' })
    setActivityForm({ title: '', venueId: '', date: '', capacity: 20, fee: 0, description: '' })
    setAddActivityOpen(false)
  }

  const handleEnroll = () => {
    const member = members.find(m => m.id === selectedMember)
    if (!member || !enrollTarget) return
    addEnrollment({
      courseId: enrollTarget.type === 'course' ? enrollTarget.id : '',
      activityId: enrollTarget.type === 'activity' ? enrollTarget.id : '',
      memberId: member.id,
      memberName: member.name,
      type: enrollTarget.type,
      status: 'enrolled',
      enrolledAt: new Date().toISOString().split('T')[0],
    })
    setSelectedMember('')
    setEnrollOpen(false)
    setEnrollTarget(null)
  }

  const openEnroll = (type: 'course' | 'activity', id: string, title: string) => {
    setEnrollTarget({ type, id, title })
    setSelectedMember('')
    setEnrollOpen(true)
  }

  const renderProgress = (enrolled: number, capacity: number) => {
    const pct = capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-surface-400 mb-1">
          <span>{enrolled}/{capacity}人</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-700">
          <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-surface-700/50 pb-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-accent-500 text-accent-400' : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn-primary flex items-center gap-2" onClick={() => setAddCourseOpen(true)}>
              <Plus className="h-4 w-4" /> 发布课程
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(c => (
              <div key={c.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`badge ${catColor[c.category] ?? 'badge-gray'}`}>{c.category}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="text-surface-100 font-semibold">{c.title}</h3>
                <div className="text-sm text-surface-400 space-y-1">
                  <p>教练：{c.coachName}</p>
                  <p>场馆：{c.venueName}</p>
                  <p>时间：{c.schedule}</p>
                  <p className="text-accent-400 font-medium">¥{c.price}</p>
                </div>
                {renderProgress(c.enrolled, c.capacity)}
                {c.enrolled < c.capacity ? (
                  <button className="btn-primary w-full text-sm" onClick={() => openEnroll('course', c.id, c.title)}>报名</button>
                ) : (
                  <button className="btn-secondary w-full text-sm cursor-not-allowed opacity-50" disabled>已满员</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'activities' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn-primary flex items-center gap-2" onClick={() => setAddActivityOpen(true)}>
              <Plus className="h-4 w-4" /> 创建活动
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activities.map(a => (
              <div key={a.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-surface-100 font-semibold">{a.title}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <div className="text-sm text-surface-400 space-y-1">
                  <p>场馆：{a.venueName}</p>
                  <p>日期：{a.date}</p>
                  <p>{a.fee > 0 ? <span className="text-accent-400 font-medium">¥{a.fee}</span> : <span className="text-green-400 font-medium">免费</span>}</p>
                </div>
                {renderProgress(a.enrolled, a.capacity)}
                {a.status === 'upcoming' && a.enrolled < a.capacity ? (
                  <button className="btn-primary w-full text-sm" onClick={() => openEnroll('activity', a.id, a.title)}>报名</button>
                ) : (
                  <button className="btn-secondary w-full text-sm cursor-not-allowed opacity-50" disabled>
                    {a.status !== 'upcoming' ? '不可报名' : '已满员'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'checkin' && (
        <DataTable
          columns={[
            { key: 'memberName', header: '会员' },
            {
              key: 'type', header: '类型',
              render: (row) => (
                <span className={row.type === 'course' ? 'badge-blue' : 'badge-yellow'}>
                  {row.type === 'course' ? '课程' : '活动'}
                </span>
              ),
            },
            {
              key: 'title', header: '课程/活动',
              render: (row) => {
                const name = row.type === 'course'
                  ? courses.find((c: Course) => c.id === row.courseId)?.title ?? '-'
                  : activities.find((a: Activity) => a.id === row.activityId)?.title ?? '-'
                return name
              },
            },
            { key: 'enrolledAt', header: '报名时间' },
            {
              key: 'status', header: '状态',
              render: (row: any) => <StatusBadge status={row.status as string} label={statusMap[row.status as string]} />,
            },
            {
              key: 'action', header: '操作',
              render: (row: any) =>
                row.status === 'enrolled'
                  ? <button className="btn-primary text-xs px-3 py-1" onClick={() => checkInEnrollment(row.id as string)}>签到</button>
                  : <span className="text-surface-500">—</span>,
            },
          ]}
          data={enrollments as unknown as Record<string, unknown>[]}
        />
      )}

      <Modal isOpen={addCourseOpen} onClose={() => setAddCourseOpen(false)} title="发布课程">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="课程名称" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
          <select className="input-field w-full" value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field w-full" value={courseForm.coachId} onChange={e => setCourseForm(f => ({ ...f, coachId: e.target.value }))}>
            <option value="">选择教练</option>
            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}（{c.specialty}）</option>)}
          </select>
          <select className="input-field w-full" value={courseForm.venueId} onChange={e => setCourseForm(f => ({ ...f, venueId: e.target.value }))}>
            <option value="">选择场馆</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input className="input-field w-full" placeholder="上课时间" value={courseForm.schedule} onChange={e => setCourseForm(f => ({ ...f, schedule: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field w-full" type="number" placeholder="容量" value={courseForm.capacity} onChange={e => setCourseForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            <input className="input-field w-full" type="number" placeholder="价格" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: Number(e.target.value) }))} />
          </div>
          <button className="btn-primary w-full" onClick={handleAddCourse}>确认发布</button>
        </div>
      </Modal>

      <Modal isOpen={addActivityOpen} onClose={() => setAddActivityOpen(false)} title="创建活动">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder="活动名称" value={activityForm.title} onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))} />
          <select className="input-field w-full" value={activityForm.venueId} onChange={e => setActivityForm(f => ({ ...f, venueId: e.target.value }))}>
            <option value="">选择场馆</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input className="input-field w-full" type="date" value={activityForm.date} onChange={e => setActivityForm(f => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field w-full" type="number" placeholder="容量" value={activityForm.capacity} onChange={e => setActivityForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            <input className="input-field w-full" type="number" placeholder="费用（0为免费）" value={activityForm.fee} onChange={e => setActivityForm(f => ({ ...f, fee: Number(e.target.value) }))} />
          </div>
          <textarea className="input-field w-full" rows={2} placeholder="活动描述" value={activityForm.description} onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} />
          <button className="btn-primary w-full" onClick={handleAddActivity}>确认创建</button>
        </div>
      </Modal>

      <Modal isOpen={enrollOpen} onClose={() => { setEnrollOpen(false); setEnrollTarget(null) }} title="报名" size="sm">
        <div className="space-y-3">
          {enrollTarget && (
            <div className="text-sm text-surface-400 bg-surface-900/40 rounded-lg p-3">
              <p className="text-surface-200 font-medium">{enrollTarget.title}</p>
              <p className="mt-1">类型：{enrollTarget.type === 'course' ? '课程' : '活动'}</p>
            </div>
          )}
          <select className="input-field w-full" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
            <option value="">选择会员</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}（{m.phone}）</option>)}
          </select>
          <button className="btn-primary w-full" onClick={handleEnroll} disabled={!selectedMember}>确认报名</button>
        </div>
      </Modal>
    </div>
  )
}
