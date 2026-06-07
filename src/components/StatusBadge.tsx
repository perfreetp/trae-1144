import { cn } from '@/lib/utils'

const statusColorMap: Record<string, string> = {
  available: 'badge-green',
  confirmed: 'badge-green',
  active: 'badge-green',
  completed: 'badge-green',
  approved: 'badge-green',
  enrolled: 'badge-green',
  occupied: 'badge-yellow',
  pending: 'badge-yellow',
  in_progress: 'badge-yellow',
  processing: 'badge-yellow',
  upcoming: 'badge-yellow',
  ongoing: 'badge-yellow',
  locked: 'badge-red',
  maintenance: 'badge-red',
  closed: 'badge-red',
  rejected: 'badge-red',
  cancelled: 'badge-red',
  out: 'badge-red',
  damaged: 'badge-red',
  checked_in: 'badge-blue',
  ended: 'badge-gray',
}

const statusLabelMap: Record<string, string> = {
  available: '可用',
  confirmed: '已确认',
  active: '进行中',
  completed: '已完成',
  approved: '已审批',
  enrolled: '已报名',
  occupied: '占用中',
  pending: '待处理',
  in_progress: '进行中',
  processing: '处理中',
  upcoming: '即将开始',
  ongoing: '进行中',
  locked: '已锁定',
  maintenance: '维护中',
  closed: '已关闭',
  rejected: '已拒绝',
  cancelled: '已取消',
  out: '离线',
  damaged: '已损坏',
  checked_in: '已签到',
  ended: '已结束',
}

interface StatusBadgeProps {
  status: string
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const badgeClass = statusColorMap[status] ?? 'badge-gray'
  const displayLabel = label ?? statusLabelMap[status] ?? status

  return <span className={cn(badgeClass)}>{displayLabel}</span>
}
