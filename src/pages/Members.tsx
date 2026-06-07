import { useState } from 'react'
import { Search, Crown, Wallet, TrendingUp, Users, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import type { Member, MemberLevel } from '@/types'

const levelColors: Record<MemberLevel, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#00CED1',
}
const levelLabels: Record<MemberLevel, string> = {
  bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金',
}
const levelBadgeClass: Record<MemberLevel, string> = {
  bronze: 'badge bg-orange-500/20 text-orange-400',
  silver: 'badge bg-surface-500/20 text-surface-300',
  gold: 'badge bg-yellow-500/20 text-yellow-400',
  platinum: 'badge bg-cyan-500/20 text-cyan-400',
}
const levelFilters: ('all' | MemberLevel)[] = ['all', 'bronze', 'silver', 'gold', 'platinum']
const filterLabels: Record<string, string> = {
  all: '全部', bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金',
}

const levelCards: { level: MemberLevel; discount: string; requirement: string; benefits: string[] }[] = [
  { level: 'bronze', discount: '95折', requirement: '消费0-5000元', benefits: ['场地预约9.5折', '积分1倍', '生日礼券'] },
  { level: 'silver', discount: '9折', requirement: '消费5000-20000元', benefits: ['场地预约9折', '积分1.5倍', '优先预约权', '生日礼券'] },
  { level: 'gold', discount: '85折', requirement: '消费20000-50000元', benefits: ['场地预约8.5折', '积分2倍', '优先预约权', '专属更衣室', '免费停车'] },
  { level: 'platinum', discount: '8折', requirement: '消费50000元以上', benefits: ['场地预约8折', '积分3倍', 'VIP优先预约', '专属更衣室', '免费停车', '私教体验课'] },
]

export default function Members() {
  const { members, transactions, addTransaction } = useAppStore()
  const [activeTab, setActiveTab] = useState<'list' | 'levels'>('list')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | MemberLevel>('all')
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [txType, setTxType] = useState<'topup' | 'consumption'>('topup')
  const [txAmount, setTxAmount] = useState('')
  const [txDesc, setTxDesc] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.includes(search) || m.phone.includes(search)
    const matchLevel = levelFilter === 'all' || m.level === levelFilter
    return matchSearch && matchLevel
  })

  const openTransaction = (member: Member) => {
    setSelectedMember(member)
    setTxType('topup')
    setTxAmount('')
    setTxDesc('')
    setSuccessMsg('')
    setTransactionModalOpen(true)
  }

  const openDetail = (member: Member) => {
    setSelectedMember(member)
    setDetailModalOpen(true)
  }

  const handleSubmitTx = () => {
    if (!selectedMember || !txAmount || Number(txAmount) <= 0) return
    addTransaction(selectedMember.id, txType, Number(txAmount), txDesc || (txType === 'topup' ? '会员充值' : '会员扣费'))
    setSuccessMsg(`${txType === 'topup' ? '充值' : '扣费'}成功！`)
    setTimeout(() => {
      setTransactionModalOpen(false)
      setSuccessMsg('')
    }, 1200)
  }

  const memberTransactions = selectedMember
    ? transactions.filter(t => t.memberId === selectedMember.id).slice(0, 10)
    : []

  const columns = [
    {
      key: 'name', header: '会员',
      render: (m: any) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openDetail(m)}>
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: levelColors[m.level] }}>
            {m.name[0]}
          </div>
          <span className="text-surface-100 font-medium hover:text-accent-400 transition-colors">{m.name}</span>
        </div>
      ),
    },
    { key: 'phone', header: '手机号', render: (m: any) => <span className="font-mono">{m.phone}</span> },
    {
      key: 'level', header: '等级',
      render: (m: any) => <span className={levelBadgeClass[m.level]}>{levelLabels[m.level]}</span>,
    },
    {
      key: 'balance', header: '余额',
      render: (m: any) => (
        <span className={`font-mono ${m.balance > 500 ? 'text-accent-400' : m.balance < 200 ? 'text-red-400' : 'text-surface-300'}`}>
          ¥{m.balance.toLocaleString()}
        </span>
      ),
    },
    { key: 'totalSpent', header: '累计消费', render: (m: any) => <span className="font-mono">¥{m.totalSpent.toLocaleString()}</span> },
    { key: 'visitCount', header: '到访次数', render: (m: any) => <span>{m.visitCount}次</span> },
    { key: 'registeredAt', header: '注册时间' },
    {
      key: 'actions', header: '操作',
      render: (m: any) => (
        <button className="btn-primary text-xs px-3 py-1.5" onClick={(e) => { e.stopPropagation(); openTransaction(m) }}>
          储值扣费
        </button>
      ),
    },
  ]

  const tabs = [
    { key: 'list' as const, label: '会员列表' },
    { key: 'levels' as const, label: '会员等级' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-surface-700/50 pb-0">
        {tabs.map(tab => (
          <button key={tab.key}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? 'text-accent-400 border-accent-400' : 'text-surface-400 border-transparent hover:text-surface-200'}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
              <input className="input-field w-full pl-9" placeholder="搜索姓名或手机号..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              {levelFilters.map(lv => (
                <button key={lv}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    levelFilter === lv ? 'bg-accent-600 text-white' : 'bg-surface-700/50 text-surface-400 hover:bg-surface-700 hover:text-surface-200'}`}
                  onClick={() => setLevelFilter(lv)}>
                  {filterLabels[lv]}
                </button>
              ))}
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filtered as unknown as Record<string, unknown>[]}
          />

        </>
      )}

      {activeTab === 'levels' && (
        <div className="grid grid-cols-4 gap-5">
          {levelCards.map(card => {
            const count = members.filter(m => m.level === card.level).length
            return (
              <div key={card.level} className="card p-6 space-y-4" style={{ borderTop: `3px solid ${levelColors[card.level]}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: levelColors[card.level] + '20' }}>
                      <Crown className="h-5 w-5" style={{ color: levelColors[card.level] }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: levelColors[card.level] }}>{levelLabels[card.level]}</h3>
                      <p className="text-xs text-surface-500">{card.discount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">会员数</p>
                    <p className="text-lg font-bold text-surface-200">{count}</p>
                  </div>
                </div>
                <div className="text-sm text-surface-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-surface-500" />
                    <span>升级条件：{card.requirement}</span>
                  </div>
                </div>
                <div className="border-t border-surface-700/50 pt-3">
                  <p className="text-xs text-surface-500 mb-2">会员权益</p>
                  <ul className="space-y-1.5">
                    {card.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: levelColors[card.level] }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={transactionModalOpen} onClose={() => setTransactionModalOpen(false)} title="储值扣费" size="sm">
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-surface-900/60 rounded-lg p-3">
              <span className="text-surface-300">{selectedMember.name}</span>
              <span className="font-mono text-accent-400">¥{selectedMember.balance.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              {(['topup', 'consumption'] as const).map(t => (
                <button key={t}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    txType === t ? 'bg-accent-600 text-white' : 'bg-surface-700/50 text-surface-400 hover:bg-surface-700'}`}
                  onClick={() => setTxType(t)}>
                  {t === 'topup' ? '充值' : '扣费'}
                </button>
              ))}
            </div>
            <input type="number" className="input-field w-full" placeholder="金额" min="0"
              value={txAmount} onChange={e => setTxAmount(e.target.value)} />
            <input className="input-field w-full" placeholder="备注（选填）"
              value={txDesc} onChange={e => setTxDesc(e.target.value)} />
            {successMsg && (
              <div className="flex items-center gap-2 text-accent-400 text-sm"><CheckCircle className="h-4 w-4" />{successMsg}</div>
            )}
            {!successMsg && (
              <button className="btn-primary w-full" onClick={handleSubmitTx}>确认</button>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="会员详情" size="lg">
        {selectedMember && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-surface-900/60 rounded-lg p-4">
              <div className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: levelColors[selectedMember.level] }}>
                {selectedMember.name[0]}
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div><p className="text-xs text-surface-500">姓名</p><p className="text-surface-200 font-medium">{selectedMember.name}</p></div>
                <div><p className="text-xs text-surface-500">手机号</p><p className="text-surface-200 font-mono">{selectedMember.phone}</p></div>
                <div><p className="text-xs text-surface-500">等级</p><span className={levelBadgeClass[selectedMember.level]}>{levelLabels[selectedMember.level]}</span></div>
                <div><p className="text-xs text-surface-500">余额</p><p className={`font-mono font-bold ${selectedMember.balance > 500 ? 'text-accent-400' : selectedMember.balance < 200 ? 'text-red-400' : 'text-surface-200'}`}>¥{selectedMember.balance.toLocaleString()}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-3 text-center"><p className="text-xs text-surface-500 mb-1">累计消费</p><p className="font-mono text-surface-200">¥{selectedMember.totalSpent.toLocaleString()}</p></div>
              <div className="card p-3 text-center"><p className="text-xs text-surface-500 mb-1">到访次数</p><p className="font-mono text-surface-200">{selectedMember.visitCount}次</p></div>
              <div className="card p-3 text-center"><p className="text-xs text-surface-500 mb-1">注册时间</p><p className="text-surface-200">{selectedMember.registeredAt}</p></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-surface-300 mb-3">最近交易记录</h4>
              {memberTransactions.length === 0 ? (
                <p className="text-sm text-surface-500 py-4 text-center">暂无交易记录</p>
              ) : (
                <div className="space-y-2">
                  {memberTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-surface-900/40 rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-surface-500 font-mono">{t.createdAt}</span>
                        <StatusBadge status={t.type === 'topup' ? 'active' : t.type === 'refund' ? 'checked_in' : 'pending'}
                          label={t.type === 'topup' ? '充值' : t.type === 'refund' ? '退款' : '消费'} />
                        <span className="text-sm text-surface-300">{t.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono font-medium ${t.type === 'topup' ? 'text-accent-400' : t.type === 'refund' ? 'text-primary-400' : 'text-red-400'}`}>
                          {t.type === 'topup' ? '+' : '-'}¥{Math.abs(t.amount).toLocaleString()}
                        </span>
                        <span className="text-xs text-surface-500 font-mono">余额 ¥{t.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
