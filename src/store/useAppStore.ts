import { create } from 'zustand'
import type {
  Venue, Court, Reservation, Member, Course, Activity, Enrollment,
  InspectionTask, Complaint, RefundRequest, GateRecord, EquipmentRecord,
  Equipment, Transaction, Alert, DailyStats, Coach, GroupBooking, CourtStatus
} from '@/types'

const venues: Venue[] = [
  {
    id: 'v1', name: '篮球馆', type: 'basketball', status: 'open',
    courts: [
      { id: 'c1', venueId: 'v1', name: '1号场', status: 'available', pricingSlots: [
        { id: 'p1', courtId: 'c1', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 120 },
        { id: 'p2', courtId: 'c1', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 150 },
        { id: 'p3', courtId: 'c1', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 200 },
        { id: 'p4', courtId: 'c1', dayType: 'weekend', startTime: '08:00', endTime: '12:00', price: 150 },
        { id: 'p5', courtId: 'c1', dayType: 'weekend', startTime: '12:00', endTime: '18:00', price: 180 },
        { id: 'p6', courtId: 'c1', dayType: 'weekend', startTime: '18:00', endTime: '22:00', price: 250 },
      ]},
      { id: 'c2', venueId: 'v1', name: '2号场', status: 'occupied', pricingSlots: [
        { id: 'p7', courtId: 'c2', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 120 },
        { id: 'p8', courtId: 'c2', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 150 },
        { id: 'p9', courtId: 'c2', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 200 },
        { id: 'p10', courtId: 'c2', dayType: 'weekend', startTime: '08:00', endTime: '12:00', price: 150 },
        { id: 'p11', courtId: 'c2', dayType: 'weekend', startTime: '12:00', endTime: '18:00', price: 180 },
        { id: 'p12', courtId: 'c2', dayType: 'weekend', startTime: '18:00', endTime: '22:00', price: 250 },
      ]},
      { id: 'c3', venueId: 'v1', name: '3号场', status: 'available', pricingSlots: [
        { id: 'p13', courtId: 'c3', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 100 },
        { id: 'p14', courtId: 'c3', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 130 },
        { id: 'p15', courtId: 'c3', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 180 },
        { id: 'p16', courtId: 'c3', dayType: 'weekend', startTime: '08:00', endTime: '12:00', price: 130 },
        { id: 'p17', courtId: 'c3', dayType: 'weekend', startTime: '12:00', endTime: '18:00', price: 160 },
        { id: 'p18', courtId: 'c3', dayType: 'weekend', startTime: '18:00', endTime: '22:00', price: 220 },
      ]},
      { id: 'c4', venueId: 'v1', name: '4号场', status: 'locked', pricingSlots: [
        { id: 'p19', courtId: 'c4', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 120 },
        { id: 'p20', courtId: 'c4', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 150 },
        { id: 'p21', courtId: 'c4', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 200 },
      ]},
    ]
  },
  {
    id: 'v2', name: '羽毛球馆', type: 'badminton', status: 'open',
    courts: [
      { id: 'c5', venueId: 'v2', name: 'A场', status: 'occupied', pricingSlots: [
        { id: 'p22', courtId: 'c5', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 60 },
        { id: 'p23', courtId: 'c5', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 80 },
        { id: 'p24', courtId: 'c5', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 100 },
        { id: 'p25', courtId: 'c5', dayType: 'weekend', startTime: '08:00', endTime: '12:00', price: 80 },
        { id: 'p26', courtId: 'c5', dayType: 'weekend', startTime: '12:00', endTime: '18:00', price: 100 },
        { id: 'p27', courtId: 'c5', dayType: 'weekend', startTime: '18:00', endTime: '22:00', price: 120 },
      ]},
      { id: 'c6', venueId: 'v2', name: 'B场', status: 'available', pricingSlots: [
        { id: 'p28', courtId: 'c6', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 60 },
        { id: 'p29', courtId: 'c6', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 80 },
        { id: 'p30', courtId: 'c6', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 100 },
      ]},
      { id: 'c7', venueId: 'v2', name: 'C场', status: 'available', pricingSlots: [
        { id: 'p31', courtId: 'c7', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 60 },
        { id: 'p32', courtId: 'c7', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 80 },
        { id: 'p33', courtId: 'c7', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 100 },
      ]},
      { id: 'c8', venueId: 'v2', name: 'D场', status: 'maintenance', pricingSlots: [
        { id: 'p34', courtId: 'c8', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 60 },
        { id: 'p35', courtId: 'c8', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 80 },
      ]},
      { id: 'c9', venueId: 'v2', name: 'E场', status: 'occupied', pricingSlots: [
        { id: 'p36', courtId: 'c9', dayType: 'weekday', startTime: '08:00', endTime: '12:00', price: 60 },
        { id: 'p37', courtId: 'c9', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 80 },
        { id: 'p38', courtId: 'c9', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 100 },
      ]},
    ]
  },
  {
    id: 'v3', name: '游泳馆', type: 'swimming', status: 'open',
    courts: [
      { id: 'c10', venueId: 'v3', name: '标准池', status: 'available', pricingSlots: [
        { id: 'p39', courtId: 'c10', dayType: 'weekday', startTime: '06:00', endTime: '10:00', price: 50 },
        { id: 'p40', courtId: 'c10', dayType: 'weekday', startTime: '10:00', endTime: '14:00', price: 60 },
        { id: 'p41', courtId: 'c10', dayType: 'weekday', startTime: '14:00', endTime: '18:00', price: 70 },
        { id: 'p42', courtId: 'c10', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 80 },
        { id: 'p43', courtId: 'c10', dayType: 'weekend', startTime: '06:00', endTime: '10:00', price: 60 },
        { id: 'p44', courtId: 'c10', dayType: 'weekend', startTime: '10:00', endTime: '14:00', price: 80 },
        { id: 'p45', courtId: 'c10', dayType: 'weekend', startTime: '14:00', endTime: '18:00', price: 90 },
        { id: 'p46', courtId: 'c10', dayType: 'weekend', startTime: '18:00', endTime: '22:00', price: 100 },
      ]},
      { id: 'c11', venueId: 'v3', name: '训练池', status: 'occupied', pricingSlots: [
        { id: 'p47', courtId: 'c11', dayType: 'weekday', startTime: '06:00', endTime: '10:00', price: 40 },
        { id: 'p48', courtId: 'c11', dayType: 'weekday', startTime: '10:00', endTime: '14:00', price: 50 },
        { id: 'p49', courtId: 'c11', dayType: 'weekday', startTime: '14:00', endTime: '18:00', price: 60 },
        { id: 'p50', courtId: 'c11', dayType: 'weekday', startTime: '18:00', endTime: '22:00', price: 70 },
      ]},
      { id: 'c12', venueId: 'v3', name: '儿童池', status: 'available', pricingSlots: [
        { id: 'p51', courtId: 'c12', dayType: 'weekday', startTime: '09:00', endTime: '12:00', price: 40 },
        { id: 'p52', courtId: 'c12', dayType: 'weekday', startTime: '12:00', endTime: '18:00', price: 50 },
        { id: 'p53', courtId: 'c12', dayType: 'weekday', startTime: '18:00', endTime: '21:00', price: 60 },
      ]},
    ]
  },
]

const members: Member[] = [
  { id: 'm1', name: '张伟', phone: '138****1234', level: 'platinum', balance: 8600, totalSpent: 52800, visitCount: 156, registeredAt: '2024-03-15', avatar: '张' },
  { id: 'm2', name: '李娜', phone: '139****5678', level: 'gold', balance: 3200, totalSpent: 28600, visitCount: 98, registeredAt: '2024-05-20', avatar: '李' },
  { id: 'm3', name: '王强', phone: '137****9012', level: 'silver', balance: 1500, totalSpent: 12800, visitCount: 56, registeredAt: '2025-01-10', avatar: '王' },
  { id: 'm4', name: '刘芳', phone: '136****3456', level: 'gold', balance: 5400, totalSpent: 32100, visitCount: 120, registeredAt: '2024-07-08', avatar: '刘' },
  { id: 'm5', name: '陈明', phone: '135****7890', level: 'bronze', balance: 300, totalSpent: 2400, visitCount: 12, registeredAt: '2025-09-22', avatar: '陈' },
  { id: 'm6', name: '赵丽', phone: '158****2345', level: 'silver', balance: 2100, totalSpent: 15600, visitCount: 67, registeredAt: '2025-02-14', avatar: '赵' },
  { id: 'm7', name: '孙浩', phone: '159****6789', level: 'bronze', balance: 500, totalSpent: 3600, visitCount: 18, registeredAt: '2025-06-30', avatar: '孙' },
  { id: 'm8', name: '周婷', phone: '133****0123', level: 'platinum', balance: 12000, totalSpent: 68000, visitCount: 200, registeredAt: '2024-01-05', avatar: '周' },
  { id: 'm9', name: '吴磊', phone: '186****4567', level: 'gold', balance: 4100, totalSpent: 24800, visitCount: 88, registeredAt: '2024-09-12', avatar: '吴' },
  { id: 'm10', name: '郑洁', phone: '187****8901', level: 'silver', balance: 1800, totalSpent: 11200, visitCount: 45, registeredAt: '2025-04-18', avatar: '郑' },
  { id: 'm11', name: '黄鹏', phone: '152****2468', level: 'bronze', balance: 200, totalSpent: 1800, visitCount: 8, registeredAt: '2026-02-10', avatar: '黄' },
  { id: 'm12', name: '林燕', phone: '153****1357', level: 'gold', balance: 6700, totalSpent: 35200, visitCount: 105, registeredAt: '2024-06-01', avatar: '林' },
]

const coaches: Coach[] = [
  { id: 'co1', name: '刘教练', phone: '138****8001', specialty: '篮球', avatar: '刘', rating: 4.8 },
  { id: 'co2', name: '张教练', phone: '139****8002', specialty: '羽毛球', avatar: '张', rating: 4.9 },
  { id: 'co3', name: '王教练', phone: '137****8003', specialty: '游泳', avatar: '王', rating: 4.7 },
  { id: 'co4', name: '陈教练', phone: '136****8004', specialty: '篮球', avatar: '陈', rating: 4.6 },
  { id: 'co5', name: '赵教练', phone: '135****8005', specialty: '游泳', avatar: '赵', rating: 4.8 },
]

const reservations: Reservation[] = [
  { id: 'r1', courtId: 'c2', userId: 'm1', date: '2026-06-08', startTime: '09:00', endTime: '11:00', status: 'confirmed', totalPrice: 240, paymentMethod: 'member_card', createdAt: '2026-06-07 14:30', memberName: '张伟', courtName: '2号场', venueName: '篮球馆' },
  { id: 'r2', courtId: 'c5', userId: 'm2', date: '2026-06-08', startTime: '14:00', endTime: '16:00', status: 'confirmed', totalPrice: 160, paymentMethod: 'wechat', createdAt: '2026-06-07 16:20', memberName: '李娜', courtName: 'A场', venueName: '羽毛球馆' },
  { id: 'r3', courtId: 'c11', userId: 'm3', date: '2026-06-08', startTime: '18:00', endTime: '20:00', status: 'pending', totalPrice: 140, paymentMethod: 'alipay', createdAt: '2026-06-08 08:15', memberName: '王强', courtName: '训练池', venueName: '游泳馆' },
  { id: 'r4', courtId: 'c1', userId: 'm4', date: '2026-06-08', startTime: '19:00', endTime: '21:00', status: 'pending', totalPrice: 400, paymentMethod: 'member_card', createdAt: '2026-06-08 09:00', memberName: '刘芳', courtName: '1号场', venueName: '篮球馆' },
  { id: 'r5', courtId: 'c9', userId: 'm5', date: '2026-06-08', startTime: '10:00', endTime: '12:00', status: 'confirmed', totalPrice: 120, paymentMethod: 'cash', createdAt: '2026-06-07 20:45', memberName: '陈明', courtName: 'E场', venueName: '羽毛球馆' },
  { id: 'r6', courtId: 'c10', userId: 'm6', date: '2026-06-08', startTime: '06:00', endTime: '08:00', status: 'completed', totalPrice: 100, paymentMethod: 'member_card', createdAt: '2026-06-07 21:00', memberName: '赵丽', courtName: '标准池', venueName: '游泳馆' },
  { id: 'r7', courtId: 'c3', userId: 'm7', date: '2026-06-08', startTime: '15:00', endTime: '17:00', status: 'pending', totalPrice: 260, paymentMethod: 'wechat', createdAt: '2026-06-08 07:30', memberName: '孙浩', courtName: '3号场', venueName: '篮球馆' },
  { id: 'r8', courtId: 'c6', userId: 'm8', date: '2026-06-08', startTime: '18:00', endTime: '20:00', status: 'confirmed', totalPrice: 200, paymentMethod: 'member_card', createdAt: '2026-06-06 10:00', memberName: '周婷', courtName: 'B场', venueName: '羽毛球馆' },
  { id: 'r9', courtId: 'c2', userId: 'm9', date: '2026-06-09', startTime: '10:00', endTime: '12:00', status: 'pending', totalPrice: 240, paymentMethod: 'alipay', createdAt: '2026-06-08 10:20', memberName: '吴磊', courtName: '2号场', venueName: '篮球馆' },
  { id: 'r10', courtId: 'c12', userId: 'm10', date: '2026-06-08', startTime: '14:00', endTime: '16:00', status: 'cancelled', totalPrice: 100, paymentMethod: 'wechat', createdAt: '2026-06-07 12:00', memberName: '郑洁', courtName: '儿童池', venueName: '游泳馆' },
  { id: 'r11', courtId: 'c7', userId: 'm1', date: '2026-06-09', startTime: '09:00', endTime: '11:00', status: 'pending', totalPrice: 160, paymentMethod: 'member_card', createdAt: '2026-06-08 11:00', memberName: '张伟', courtName: 'C场', venueName: '羽毛球馆' },
  { id: 'r12', courtId: 'c1', userId: 'm3', date: '2026-06-09', startTime: '14:00', endTime: '16:00', status: 'pending', totalPrice: 300, paymentMethod: 'cash', createdAt: '2026-06-08 09:30', memberName: '王强', courtName: '1号场', venueName: '篮球馆' },
  { id: 'r13', courtId: 'c10', userId: 'm4', date: '2026-06-09', startTime: '18:00', endTime: '20:00', status: 'pending', totalPrice: 160, paymentMethod: 'member_card', createdAt: '2026-06-08 12:00', memberName: '刘芳', courtName: '标准池', venueName: '游泳馆' },
  { id: 'r14', courtId: 'c5', userId: 'm6', date: '2026-06-10', startTime: '10:00', endTime: '12:00', status: 'pending', totalPrice: 160, paymentMethod: 'wechat', createdAt: '2026-06-08 13:00', memberName: '赵丽', courtName: 'A场', venueName: '羽毛球馆' },
  { id: 'r15', courtId: 'c2', userId: 'm8', date: '2026-06-10', startTime: '19:00', endTime: '21:00', status: 'pending', totalPrice: 400, paymentMethod: 'member_card', createdAt: '2026-06-08 14:00', memberName: '周婷', courtName: '2号场', venueName: '篮球馆' },
]

const courses: Course[] = [
  { id: 'cr1', coachId: 'co1', coachName: '刘教练', title: '篮球基础训练班', venueId: 'v1', venueName: '篮球馆', schedule: '每周二、四 18:00-20:00', capacity: 15, enrolled: 12, price: 1200, status: 'active', category: '篮球' },
  { id: 'cr2', coachId: 'co2', coachName: '张教练', title: '羽毛球进阶班', venueId: 'v2', venueName: '羽毛球馆', schedule: '每周一、三 19:00-21:00', capacity: 10, enrolled: 8, price: 980, status: 'active', category: '羽毛球' },
  { id: 'cr3', coachId: 'co3', coachName: '王教练', title: '成人游泳课', venueId: 'v3', venueName: '游泳馆', schedule: '每周三、五 08:00-10:00', capacity: 12, enrolled: 10, price: 1500, status: 'active', category: '游泳' },
  { id: 'cr4', coachId: 'co4', coachName: '陈教练', title: '青少年篮球训练营', venueId: 'v1', venueName: '篮球馆', schedule: '每周六 09:00-12:00', capacity: 20, enrolled: 18, price: 800, status: 'active', category: '篮球' },
  { id: 'cr5', coachId: 'co5', coachName: '赵教练', title: '儿童游泳启蒙班', venueId: 'v3', venueName: '游泳馆', schedule: '每周日 10:00-11:30', capacity: 8, enrolled: 6, price: 680, status: 'active', category: '游泳' },
  { id: 'cr6', coachId: 'co1', coachName: '刘教练', title: '篮球战术提升班', venueId: 'v1', venueName: '篮球馆', schedule: '每周五 19:00-21:00', capacity: 12, enrolled: 5, price: 1500, status: 'active', category: '篮球' },
  { id: 'cr7', coachId: 'co2', coachName: '张教练', title: '羽毛球双打特训', venueId: 'v2', venueName: '羽毛球馆', schedule: '每周六 14:00-16:00', capacity: 8, enrolled: 8, price: 1280, status: 'active', category: '羽毛球' },
  { id: 'cr8', coachId: 'co3', coachName: '王教练', title: '花样游泳体验课', venueId: 'v3', venueName: '游泳馆', schedule: '每周日 15:00-17:00', capacity: 10, enrolled: 3, price: 200, status: 'active', category: '游泳' },
]

const activities: Activity[] = [
  { id: 'a1', title: '周末篮球联赛', venueId: 'v1', venueName: '篮球馆', date: '2026-06-14', capacity: 60, enrolled: 42, fee: 50, status: 'upcoming', description: '3v3街头篮球赛，奖品丰富' },
  { id: 'a2', title: '羽毛球友谊赛', venueId: 'v2', venueName: '羽毛球馆', date: '2026-06-15', capacity: 32, enrolled: 28, fee: 30, status: 'upcoming', description: '业余选手友谊交流赛' },
  { id: 'a3', title: '亲子游泳日', venueId: 'v3', venueName: '游泳馆', date: '2026-06-21', capacity: 40, enrolled: 35, fee: 0, status: 'upcoming', description: '家庭亲子水上活动' },
  { id: 'a4', title: '夏季游泳挑战赛', venueId: 'v3', venueName: '游泳馆', date: '2026-07-01', capacity: 50, enrolled: 20, fee: 80, status: 'upcoming', description: '百米自由泳挑战，赢取年卡' },
  { id: 'a5', title: '篮球明星见面会', venueId: 'v1', venueName: '篮球馆', date: '2026-05-20', capacity: 100, enrolled: 100, fee: 0, status: 'ended', description: '与篮球明星面对面交流' },
]

const enrollments: Enrollment[] = [
  { id: 'e1', courseId: 'cr1', activityId: '', memberId: 'm1', memberName: '张伟', type: 'course', status: 'checked_in', enrolledAt: '2026-05-01' },
  { id: 'e2', courseId: 'cr1', activityId: '', memberId: 'm3', memberName: '王强', type: 'course', status: 'enrolled', enrolledAt: '2026-05-15' },
  { id: 'e3', courseId: 'cr2', activityId: '', memberId: 'm2', memberName: '李娜', type: 'course', status: 'checked_in', enrolledAt: '2026-04-20' },
  { id: 'e4', courseId: 'cr3', activityId: '', memberId: 'm4', memberName: '刘芳', type: 'course', status: 'enrolled', enrolledAt: '2026-05-10' },
  { id: 'e5', courseId: '', activityId: 'a1', memberId: 'm1', memberName: '张伟', type: 'activity', status: 'enrolled', enrolledAt: '2026-06-01' },
  { id: 'e6', courseId: '', activityId: 'a1', memberId: 'm7', memberName: '孙浩', type: 'activity', status: 'enrolled', enrolledAt: '2026-06-02' },
  { id: 'e7', courseId: 'cr4', activityId: '', memberId: 'm5', memberName: '陈明', type: 'course', status: 'enrolled', enrolledAt: '2026-05-25' },
  { id: 'e8', courseId: 'cr5', activityId: '', memberId: 'm6', memberName: '赵丽', type: 'course', status: 'enrolled', enrolledAt: '2026-06-01' },
  { id: 'e9', courseId: '', activityId: 'a2', memberId: 'm2', memberName: '李娜', type: 'activity', status: 'enrolled', enrolledAt: '2026-06-03' },
  { id: 'e10', courseId: 'cr6', activityId: '', memberId: 'm9', memberName: '吴磊', type: 'course', status: 'enrolled', enrolledAt: '2026-06-05' },
]

const inspectionTasks: InspectionTask[] = [
  { id: 'it1', type: 'cleaning', assignee: '王阿姨', venueId: 'v1', venueName: '篮球馆', scheduledAt: '2026-06-08 06:00', status: 'completed', issues: [], description: '日常清洁' },
  { id: 'it2', type: 'cleaning', assignee: '李阿姨', venueId: 'v2', venueName: '羽毛球馆', scheduledAt: '2026-06-08 06:00', status: 'in_progress', issues: [], description: '日常清洁' },
  { id: 'it3', type: 'cleaning', assignee: '张阿姨', venueId: 'v3', venueName: '游泳馆', scheduledAt: '2026-06-08 06:00', status: 'pending', issues: [], description: '水质检测+清洁' },
  { id: 'it4', type: 'equipment', assignee: '赵师傅', venueId: 'v1', venueName: '篮球馆', scheduledAt: '2026-06-08 09:00', status: 'pending', issues: ['3号场篮圈松动'], description: '设备巡检' },
  { id: 'it5', type: 'equipment', assignee: '钱师傅', venueId: 'v2', venueName: '羽毛球馆', scheduledAt: '2026-06-08 10:00', status: 'pending', issues: [], description: '网柱及灯光检查' },
  { id: 'it6', type: 'gate', assignee: '孙保安', venueId: 'v1', venueName: '篮球馆', scheduledAt: '2026-06-08 08:00', status: 'completed', issues: [], description: '闸机巡检' },
  { id: 'it7', type: 'gate', assignee: '周保安', venueId: 'v3', venueName: '游泳馆', scheduledAt: '2026-06-08 08:00', status: 'completed', issues: [], description: '闸机巡检' },
  { id: 'it8', type: 'equipment', assignee: '赵师傅', venueId: 'v3', venueName: '游泳馆', scheduledAt: '2026-06-08 14:00', status: 'pending', issues: [], description: '泳池设备检查' },
  { id: 'it9', type: 'cleaning', assignee: '王阿姨', venueId: 'v1', venueName: '篮球馆', scheduledAt: '2026-06-08 18:00', status: 'pending', issues: [], description: '晚间清洁' },
  { id: 'it10', type: 'equipment', assignee: '钱师傅', venueId: 'v2', venueName: '羽毛球馆', scheduledAt: '2026-06-09 09:00', status: 'pending', issues: [], description: 'D场维修后复查' },
]

const complaints: Complaint[] = [
  { id: 'cp1', orderId: 'r5', userId: 'm5', userName: '陈明', category: '设施问题', description: '羽毛球馆更衣室热水不足，洗澡等待时间过长', status: 'open', assignee: '', createdAt: '2026-06-07 15:30', resolvedAt: '' },
  { id: 'cp2', orderId: 'r2', userId: 'm2', userName: '李娜', category: '服务态度', description: '前台接待态度冷淡，预约信息核对时间过长', status: 'processing', assignee: '前台主管', createdAt: '2026-06-06 20:10', resolvedAt: '' },
  { id: 'cp3', orderId: 'r6', userId: 'm6', userName: '赵丽', category: '卫生问题', description: '游泳馆更衣室地面湿滑，存在安全隐患', status: 'resolved', assignee: '保洁主管', createdAt: '2026-06-05 09:45', resolvedAt: '2026-06-05 14:20' },
  { id: 'cp4', orderId: 'r1', userId: 'm1', userName: '张伟', category: '场地问题', description: '篮球2号场地板有水渍，容易滑倒', status: 'processing', assignee: '赵师傅', createdAt: '2026-06-07 10:00', resolvedAt: '' },
  { id: 'cp5', orderId: '', userId: 'm11', userName: '黄鹏', category: '噪音问题', description: '篮球馆音乐声音太大，影响其他场馆使用', status: 'open', assignee: '', createdAt: '2026-06-08 08:30', resolvedAt: '' },
  { id: 'cp6', orderId: 'r8', userId: 'm8', userName: '周婷', category: '退款问题', description: '预约取消后退款未到账，已超过3个工作日', status: 'open', assignee: '', createdAt: '2026-06-08 09:15', resolvedAt: '' },
]

const refundRequests: RefundRequest[] = [
  { id: 'rf1', orderId: 'r10', amount: 100, reason: '临时有事无法到场', status: 'pending', createdAt: '2026-06-07 12:05', memberName: '郑洁', orderInfo: '儿童池 6/8 14:00-16:00' },
  { id: 'rf2', orderId: 'r3', amount: 70, reason: '身体不适，申请部分退款', status: 'pending', createdAt: '2026-06-08 08:20', memberName: '王强', orderInfo: '训练池 6/8 18:00-20:00' },
  { id: 'rf3', orderId: '', amount: 200, reason: '课程质量不满意', status: 'pending', createdAt: '2026-06-06 16:00', memberName: '陈明', orderInfo: '羽毛球进阶班 第3节课' },
  { id: 'rf4', orderId: '', amount: 50, reason: '重复扣费', status: 'approved', createdAt: '2026-06-05 10:00', memberName: '张伟', orderInfo: '篮球1号场 6/5 10:00-12:00' },
  { id: 'rf5', orderId: '', amount: 300, reason: '场地设备故障无法使用', status: 'rejected', createdAt: '2026-06-04 14:30', memberName: '刘芳', orderInfo: '羽毛球D场 6/4 15:00-17:00' },
  { id: 'rf6', orderId: '', amount: 150, reason: '课程时间冲突', status: 'pending', createdAt: '2026-06-08 10:45', memberName: '吴磊', orderInfo: '篮球战术提升班 6/6' },
]

const gateRecords: GateRecord[] = [
  { id: 'g1', memberId: 'm1', memberName: '张伟', gateId: 'g1', gateName: '篮球馆入口', direction: 'in', timestamp: '2026-06-08 08:45', isAbnormal: false },
  { id: 'g2', memberId: 'm5', memberName: '陈明', gateId: 'g2', gateName: '羽毛球馆入口', direction: 'in', timestamp: '2026-06-08 09:30', isAbnormal: false },
  { id: 'g3', memberId: 'm2', memberName: '李娜', gateId: 'g2', gateName: '羽毛球馆入口', direction: 'in', timestamp: '2026-06-08 13:50', isAbnormal: false },
  { id: 'g4', memberId: 'm8', memberName: '周婷', gateId: 'g2', gateName: '羽毛球馆入口', direction: 'in', timestamp: '2026-06-08 17:45', isAbnormal: false },
  { id: 'g5', memberId: 'm4', memberName: '刘芳', gateId: 'g1', gateName: '篮球馆入口', direction: 'in', timestamp: '2026-06-08 18:50', isAbnormal: false },
  { id: 'g6', memberId: 'm3', memberName: '王强', gateId: 'g3', gateName: '游泳馆入口', direction: 'in', timestamp: '2026-06-08 17:50', isAbnormal: false },
  { id: 'g7', memberId: 'm6', memberName: '赵丽', gateId: 'g3', gateName: '游泳馆入口', direction: 'out', timestamp: '2026-06-08 08:10', isAbnormal: false },
  { id: 'g8', memberId: '', memberName: '未注册用户', gateId: 'g3', gateName: '游泳馆入口', direction: 'in', timestamp: '2026-06-08 10:15', isAbnormal: true },
  { id: 'g9', memberId: 'm7', memberName: '孙浩', gateId: 'g1', gateName: '篮球馆入口', direction: 'in', timestamp: '2026-06-08 14:40', isAbnormal: false },
  { id: 'g10', memberId: 'm1', memberName: '张伟', gateId: 'g1', gateName: '篮球馆入口', direction: 'out', timestamp: '2026-06-08 11:10', isAbnormal: false },
  { id: 'g11', memberId: 'm9', memberName: '吴磊', gateId: 'g1', gateName: '篮球馆入口', direction: 'in', timestamp: '2026-06-08 19:30', isAbnormal: false },
  { id: 'g12', memberId: '', memberName: '未注册用户', gateId: 'g2', gateName: '羽毛球馆入口', direction: 'in', timestamp: '2026-06-08 16:20', isAbnormal: true },
]

const equipment: Equipment[] = [
  { id: 'eq1', name: '篮球', category: '球类', totalStock: 20, availableStock: 12, venueId: 'v1' },
  { id: 'eq2', name: '羽毛球拍', category: '球拍', totalStock: 15, availableStock: 8, venueId: 'v2' },
  { id: 'eq3', name: '羽毛球', category: '球类', totalStock: 50, availableStock: 35, venueId: 'v2' },
  { id: 'eq4', name: '游泳圈', category: '辅助', totalStock: 10, availableStock: 7, venueId: 'v3' },
  { id: 'eq5', name: '浮板', category: '辅助', totalStock: 12, availableStock: 10, venueId: 'v3' },
  { id: 'eq6', name: '护膝', category: '防护', totalStock: 20, availableStock: 16, venueId: 'v1' },
  { id: 'eq7', name: '护腕', category: '防护', totalStock: 15, availableStock: 12, venueId: 'v1' },
  { id: 'eq8', name: '泳镜', category: '辅助', totalStock: 8, availableStock: 5, venueId: 'v3' },
  { id: 'eq9', name: '跳绳', category: '训练', totalStock: 10, availableStock: 8, venueId: 'v1' },
  { id: 'eq10', name: '网球拍', category: '球拍', totalStock: 6, availableStock: 4, venueId: 'v2' },
]

const equipmentRecords: EquipmentRecord[] = [
  { id: 'er1', equipmentName: '篮球', type: 'borrow', memberId: 'm1', memberName: '张伟', timestamp: '2026-06-08 09:00', condition: 'good', equipmentId: 'eq1' },
  { id: 'er2', equipmentName: '羽毛球拍', type: 'borrow', memberId: 'm2', memberName: '李娜', timestamp: '2026-06-08 14:00', condition: 'good', equipmentId: 'eq2' },
  { id: 'er3', equipmentName: '游泳圈', type: 'borrow', memberId: 'm6', memberName: '赵丽', timestamp: '2026-06-08 06:10', condition: 'good', equipmentId: 'eq4' },
  { id: 'er4', equipmentName: '篮球', type: 'return', memberId: 'm1', memberName: '张伟', timestamp: '2026-06-08 11:00', condition: 'good', equipmentId: 'eq1' },
  { id: 'er5', equipmentName: '护膝', type: 'borrow', memberId: 'm7', memberName: '孙浩', timestamp: '2026-06-08 14:50', condition: 'good', equipmentId: 'eq6' },
  { id: 'er6', equipmentName: '泳镜', type: 'borrow', memberId: 'm3', memberName: '王强', timestamp: '2026-06-08 18:00', condition: 'good', equipmentId: 'eq8' },
  { id: 'er7', equipmentName: '羽毛球拍', type: 'return', memberId: 'm8', memberName: '周婷', timestamp: '2026-06-08 10:00', condition: 'damaged', equipmentId: 'eq2' },
  { id: 'er8', equipmentName: '浮板', type: 'borrow', memberId: 'm4', memberName: '刘芳', timestamp: '2026-06-08 19:00', condition: 'good', equipmentId: 'eq5' },
]

const transactions: Transaction[] = [
  { id: 't1', memberId: 'm1', memberName: '张伟', type: 'topup', amount: 5000, balance: 8600, description: '会员充值', createdAt: '2026-06-01 10:00' },
  { id: 't2', memberId: 'm1', memberName: '张伟', type: 'consumption', amount: -240, balance: 8360, description: '篮球2号场预约', createdAt: '2026-06-07 14:30' },
  { id: 't3', memberId: 'm2', memberName: '李娜', type: 'consumption', amount: -160, balance: 3040, description: '羽毛球A场预约', createdAt: '2026-06-07 16:20' },
  { id: 't4', memberId: 'm8', memberName: '周婷', type: 'topup', amount: 10000, balance: 12000, description: '会员充值', createdAt: '2026-06-03 09:00' },
  { id: 't5', memberId: 'm8', memberName: '周婷', type: 'consumption', amount: -200, balance: 11800, description: '羽毛球B场预约', createdAt: '2026-06-06 10:00' },
  { id: 't6', memberId: 'm4', memberName: '刘芳', type: 'consumption', amount: -400, balance: 5000, description: '篮球1号场预约', createdAt: '2026-06-08 09:00' },
  { id: 't7', memberId: 'm6', memberName: '赵丽', type: 'consumption', amount: -100, balance: 2000, description: '游泳标准池预约', createdAt: '2026-06-07 21:00' },
  { id: 't8', memberId: 'm9', memberName: '吴磊', type: 'topup', amount: 2000, balance: 4100, description: '会员充值', createdAt: '2026-06-05 15:00' },
  { id: 't9', memberId: 'm3', memberName: '王强', type: 'topup', amount: 1000, balance: 1500, description: '会员充值', createdAt: '2026-06-02 11:00' },
  { id: 't10', memberId: 'm5', memberName: '陈明', type: 'consumption', amount: -120, balance: 180, description: '羽毛球E场预约', createdAt: '2026-06-07 20:45' },
  { id: 't11', memberId: 'm12', memberName: '林燕', type: 'topup', amount: 3000, balance: 6700, description: '会员充值', createdAt: '2026-06-04 14:00' },
  { id: 't12', memberId: 'm10', memberName: '郑洁', type: 'refund', amount: 100, balance: 1800, description: '游泳儿童池退款', createdAt: '2026-06-07 12:10' },
]

const alerts: Alert[] = [
  { id: 'al1', type: 'error', title: '设备故障', message: '羽毛球馆D场灯光系统故障，已暂停使用', venueId: 'v2', isRead: false, createdAt: '2026-06-08 07:00' },
  { id: 'al2', type: 'warning', title: '投诉待处理', message: '新增2条投诉工单等待处理', venueId: '', isRead: false, createdAt: '2026-06-08 08:35' },
  { id: 'al3', type: 'warning', title: '退款待审核', message: '3笔退款申请等待审核', venueId: '', isRead: false, createdAt: '2026-06-08 08:40' },
  { id: 'al4', type: 'info', title: '预约提醒', message: '今日有8笔预约待确认', venueId: '', isRead: true, createdAt: '2026-06-08 06:00' },
  { id: 'al5', type: 'error', title: '异常通行', message: '游泳馆入口检测到未注册用户通行', venueId: 'v3', isRead: false, createdAt: '2026-06-08 10:15' },
  { id: 'al6', type: 'warning', title: '器材损耗', message: '羽毛球拍归还时发现损坏，请跟进', venueId: 'v2', isRead: true, createdAt: '2026-06-08 10:05' },
  { id: 'al7', type: 'info', title: '课程提醒', message: '篮球战术提升班今日19:00开课，已报名5人', venueId: 'v1', isRead: true, createdAt: '2026-06-08 09:00' },
  { id: 'al8', type: 'warning', title: '会员余额不足', message: '陈明余额仅剩180元，低于200元预警线', venueId: '', isRead: false, createdAt: '2026-06-08 08:00' },
]

function generateDailyStats(): DailyStats[] {
  const stats: DailyStats[] = []
  const venueIds = ['v1', 'v2', 'v3']
  for (let d = 30; d >= 0; d--) {
    const date = new Date(2026, 5, 8 - d)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${date.getFullYear()}-${mm}-${dd}`
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    for (const vid of venueIds) {
      const base = vid === 'v1' ? 1.4 : vid === 'v2' ? 1.0 : 0.8
      const multiplier = isWeekend ? 1.5 : 1.0
      stats.push({
        date: dateStr,
        venueId: vid,
        revenue: Math.round(base * multiplier * (800 + Math.random() * 600)),
        visitors: Math.round(base * multiplier * (40 + Math.random() * 30)),
        reservations: Math.round(base * multiplier * (8 + Math.random() * 8)),
        cancellations: Math.round(Math.random() * 3),
      })
    }
  }
  return stats
}

const dailyStats = generateDailyStats()

const ALL_TIME_SLOTS = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22']

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

interface SlotOverride {
  status: CourtStatus
  reason?: string
  bookingId?: string
  reservationId?: string
}

function buildInitialOverrides(reservations: Reservation[]): Record<string, SlotOverride> {
  const overrides: Record<string, SlotOverride> = {}
  for (const r of reservations) {
    if (r.status === 'confirmed') {
      const slots = timeSlotsFromRange(r.startTime, r.endTime)
      for (const ts of slots) {
        overrides[`${r.courtId}|${r.date}|${ts}`] = {
          status: 'occupied',
          reason: `预约: ${r.memberName}`,
          reservationId: r.id,
        }
      }
    }
  }
  return overrides
}

const initialOverrides = buildInitialOverrides(reservations)

interface AppState {
  sidebarCollapsed: boolean
  alertCount: number
  venues: Venue[]
  members: Member[]
  coaches: Coach[]
  reservations: Reservation[]
  courses: Course[]
  activities: Activity[]
  enrollments: Enrollment[]
  inspectionTasks: InspectionTask[]
  complaints: Complaint[]
  refundRequests: RefundRequest[]
  gateRecords: GateRecord[]
  equipment: Equipment[]
  equipmentRecords: EquipmentRecord[]
  transactions: Transaction[]
  alerts: Alert[]
  dailyStats: DailyStats[]
  slotOverrides: Record<string, SlotOverride>
  groupBookings: GroupBooking[]

  toggleSidebar: () => void
  setAlertCount: (count: number) => void
  confirmReservation: (id: string) => void
  cancelReservation: (id: string) => void
  lockSlot: (courtId: string, date: string, timeSlot: string, reason: string) => void
  unlockSlot: (courtId: string, date: string, timeSlot: string) => void
  lockCourt: (id: string, reason: string) => void
  unlockCourt: (id: string) => void
  approveRefund: (id: string) => void
  rejectRefund: (id: string) => void
  checkInEnrollment: (id: string) => void
  markAlertRead: (id: string) => void
  startInspection: (id: string) => void
  completeInspection: (id: string) => void
  updateComplaintStatus: (id: string, status: Complaint['status'], assignee?: string) => void
  addTransaction: (memberId: string, type: Transaction['type'], amount: number, description: string) => void
  addEquipmentRecord: (record: Omit<EquipmentRecord, 'id'>) => void
  updateEquipmentStock: (id: string, delta: number) => void
  addReservation: (res: Omit<Reservation, 'id'>) => void
  addCourse: (course: Omit<Course, 'id'>) => void
  addActivity: (activity: Omit<Activity, 'id'>) => void
  addEnrollment: (enrollment: Omit<Enrollment, 'id'>) => void
  addGateRecord: (record: Omit<GateRecord, 'id'>) => void
  addInspectionTask: (task: Omit<InspectionTask, 'id'>) => void
  addComplaint: (complaint: Omit<Complaint, 'id'>) => void
  addGroupBooking: (booking: Omit<GroupBooking, 'id'>) => void
  confirmGroupBooking: (id: string) => void
  cancelGroupBooking: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  alertCount: alerts.filter(a => !a.isRead).length,
  venues,
  members,
  coaches,
  reservations,
  courses,
  activities,
  enrollments,
  inspectionTasks,
  complaints,
  refundRequests,
  gateRecords,
  equipment,
  equipmentRecords,
  transactions,
  alerts,
  dailyStats,
  slotOverrides: initialOverrides,
  groupBookings: [],

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAlertCount: (count) => set({ alertCount: count }),

  confirmReservation: (id) => set((s) => {
    const reservation = s.reservations.find(r => r.id === id)
    if (!reservation) return s
    const slots = timeSlotsFromRange(reservation.startTime, reservation.endTime)
    const overrides = { ...s.slotOverrides }
    for (const ts of slots) {
      const key = `${reservation.courtId}|${reservation.date}|${ts}`
      const existing = overrides[key]
      if (existing && existing.status !== 'available') continue
      overrides[key] = {
        status: 'occupied',
        reason: `预约: ${reservation.memberName}`,
        reservationId: id,
      }
    }
    return {
      reservations: s.reservations.map(r => r.id === id ? { ...r, status: 'confirmed' as const } : r),
      slotOverrides: overrides,
    }
  }),

  cancelReservation: (id) => set((s) => {
    const reservation = s.reservations.find(r => r.id === id)
    const overrides = { ...s.slotOverrides }
    for (const key of Object.keys(overrides)) {
      if (overrides[key].reservationId === id) {
        const parts = key.split('|')
        const courtId = parts[0]
        const court = s.venues.flatMap(v => v.courts).find(c => c.id === courtId)
        if (court && court.status !== 'available') {
          overrides[key] = { status: 'available' as CourtStatus }
        } else {
          delete overrides[key]
        }
      }
    }
    return {
      reservations: s.reservations.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r),
      slotOverrides: overrides,
    }
  }),

  lockSlot: (courtId, date, timeSlot, reason) => set((s) => {
    const key = `${courtId}|${date}|${timeSlot}`
    const existing = s.slotOverrides[key]
    if (existing && existing.status !== 'available') return s
    return {
      slotOverrides: { ...s.slotOverrides, [key]: { status: 'locked', reason } }
    }
  }),

  unlockSlot: (courtId, date, timeSlot) => set((s) => {
    const key = `${courtId}|${date}|${timeSlot}`
    const court = s.venues.flatMap(v => v.courts).find(c => c.id === courtId)
    if (court && court.status === 'available') {
      const next = { ...s.slotOverrides }
      delete next[key]
      return { slotOverrides: next }
    }
    return {
      slotOverrides: { ...s.slotOverrides, [key]: { status: 'available' as CourtStatus } }
    }
  }),

  lockCourt: (id, reason) => set((s) => ({
    venues: s.venues.map(v => ({
      ...v,
      courts: v.courts.map(c => c.id === id ? { ...c, status: 'locked' as const, lockReason: reason } : c)
    }))
  })),

  unlockCourt: (id) => set((s) => ({
    venues: s.venues.map(v => ({
      ...v,
      courts: v.courts.map(c => c.id === id ? { ...c, status: 'available' as const, lockReason: '' } : c)
    }))
  })),

  approveRefund: (id) => set((s) => ({
    refundRequests: s.refundRequests.map(r => r.id === id ? { ...r, status: 'approved' as const } : r)
  })),

  rejectRefund: (id) => set((s) => ({
    refundRequests: s.refundRequests.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r)
  })),

  checkInEnrollment: (id) => set((s) => ({
    enrollments: s.enrollments.map(e => e.id === id ? { ...e, status: 'checked_in' as const } : e)
  })),

  markAlertRead: (id) => set((s) => {
    const newAlerts = s.alerts.map(a => a.id === id ? { ...a, isRead: true } : a)
    return { alerts: newAlerts, alertCount: newAlerts.filter(a => !a.isRead).length }
  }),

  startInspection: (id) => set((s) => ({
    inspectionTasks: s.inspectionTasks.map(t => t.id === id && t.status === 'pending' ? { ...t, status: 'in_progress' as const } : t)
  })),

  completeInspection: (id) => set((s) => ({
    inspectionTasks: s.inspectionTasks.map(t => t.id === id && t.status === 'in_progress' ? { ...t, status: 'completed' as const } : t)
  })),

  updateComplaintStatus: (id, status, assignee) => set((s) => ({
    complaints: s.complaints.map(c => c.id === id ? {
      ...c,
      status,
      ...(assignee ? { assignee } : {}),
      ...(status === 'resolved' ? { resolvedAt: new Date().toLocaleString('zh-CN') } : {}),
    } : c)
  })),

  addTransaction: (memberId, type, amount, description) => set((s) => {
    const member = s.members.find(m => m.id === memberId)
    if (!member) return s
    const newBalance = type === 'topup' ? member.balance + amount : member.balance - amount
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      memberId,
      memberName: member.name,
      type,
      amount: type === 'topup' ? amount : -amount,
      balance: newBalance,
      description,
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    return {
      members: s.members.map(m => m.id === memberId ? { ...m, balance: newBalance, totalSpent: type === 'consumption' ? m.totalSpent + amount : m.totalSpent } : m),
      transactions: [newTransaction, ...s.transactions],
    }
  }),

  addEquipmentRecord: (record) => set((s) => ({
    equipmentRecords: [{ ...record, id: `er${Date.now()}` }, ...s.equipmentRecords]
  })),

  updateEquipmentStock: (id, delta) => set((s) => ({
    equipment: s.equipment.map(e => e.id === id ? { ...e, availableStock: Math.max(0, Math.min(e.totalStock, e.availableStock + delta)) } : e)
  })),

  addReservation: (res) => set((s) => ({
    reservations: [{ ...res, id: `r${Date.now()}` }, ...s.reservations]
  })),

  addCourse: (course) => set((s) => ({
    courses: [{ ...course, id: `cr${Date.now()}` }, ...s.courses]
  })),

  addActivity: (activity) => set((s) => ({
    activities: [{ ...activity, id: `a${Date.now()}` }, ...s.activities]
  })),

  addEnrollment: (enrollment) => set((s) => {
    const newState: Partial<AppState> = {
      enrollments: [{ ...enrollment, id: `e${Date.now()}` }, ...s.enrollments],
    }
    if (enrollment.type === 'course' && enrollment.courseId) {
      newState.courses = s.courses.map(c =>
        c.id === enrollment.courseId ? { ...c, enrolled: c.enrolled + 1 } : c
      )
    }
    if (enrollment.type === 'activity' && enrollment.activityId) {
      newState.activities = s.activities.map(a =>
        a.id === enrollment.activityId ? { ...a, enrolled: a.enrolled + 1 } : a
      )
    }
    return newState
  }),

  addGateRecord: (record) => set((s) => ({
    gateRecords: [{ ...record, id: `g${Date.now()}` }, ...s.gateRecords]
  })),

  addInspectionTask: (task) => set((s) => ({
    inspectionTasks: [{ ...task, id: `it${Date.now()}` }, ...s.inspectionTasks]
  })),

  addComplaint: (complaint) => set((s) => ({
    complaints: [{ ...complaint, id: `cp${Date.now()}` }, ...s.complaints]
  })),

  addGroupBooking: (booking) => set((s) => {
    const id = `gb${Date.now()}`
    return {
      groupBookings: [{ ...booking, id }, ...s.groupBookings],
    }
  }),

  confirmGroupBooking: (id) => set((s) => {
    const booking = s.groupBookings.find(b => b.id === id)
    if (!booking) return s
    const overrides = { ...s.slotOverrides }
    const now = new Date().toLocaleString('zh-CN')
    for (const ts of booking.timeSlots) {
      const key = `${booking.courtId}|${booking.date}|${ts}`
      const existing = overrides[key]
      if (existing && existing.status !== 'available') continue
      overrides[key] = {
        status: 'locked',
        reason: `团体包场: ${booking.contactName}`,
        bookingId: id,
      }
    }
    return {
      groupBookings: s.groupBookings.map(b => b.id === id ? { ...b, status: 'confirmed' as const, confirmedAt: now } : b),
      slotOverrides: overrides,
    }
  }),

  cancelGroupBooking: (id) => set((s) => {
    const overrides = { ...s.slotOverrides }
    const now = new Date().toLocaleString('zh-CN')
    for (const key of Object.keys(overrides)) {
      if (overrides[key].bookingId === id) {
        const parts = key.split('|')
        const courtId = parts[0]
        const court = s.venues.flatMap(v => v.courts).find(c => c.id === courtId)
        if (court && court.status !== 'available') {
          overrides[key] = { status: 'available' as CourtStatus }
        } else {
          delete overrides[key]
        }
      }
    }
    return {
      groupBookings: s.groupBookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const, cancelledAt: now } : b),
      slotOverrides: overrides,
    }
  }),
}))
