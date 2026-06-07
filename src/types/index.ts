export type VenueType = 'basketball' | 'badminton' | 'swimming'

export type VenueStatus = 'open' | 'closed' | 'maintenance'

export type CourtStatus = 'available' | 'occupied' | 'locked' | 'maintenance'

export type DayType = 'weekday' | 'weekend' | 'holiday'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type PaymentMethod = 'wechat' | 'alipay' | 'cash' | 'member_card'

export type MemberLevel = 'bronze' | 'silver' | 'gold' | 'platinum'

export type CourseStatus = 'active' | 'inactive'

export type ActivityStatus = 'upcoming' | 'ongoing' | 'ended'

export type EnrollmentType = 'course' | 'activity'

export type EnrollmentStatus = 'enrolled' | 'checked_in' | 'cancelled'

export type InspectionType = 'cleaning' | 'equipment' | 'gate'

export type InspectionStatus = 'pending' | 'in_progress' | 'completed'

export type ComplaintStatus = 'open' | 'processing' | 'resolved' | 'closed'

export type RefundStatus = 'pending' | 'approved' | 'rejected'

export type GateDirection = 'in' | 'out'

export type EquipmentActionType = 'borrow' | 'return'

export type EquipmentCondition = 'good' | 'damaged'

export type TransactionType = 'topup' | 'consumption' | 'refund'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type AlertType = 'error' | 'warning' | 'info'

export interface GroupBooking {
  id: string
  venueId: string
  venueName: string
  courtId: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  timeSlots: string[]
  contactName: string
  contactPhone: string
  price: number
  notes: string
  status: BookingStatus
  createdAt: string
  confirmedAt?: string
  cancelledAt?: string
}

export interface PricingSlot {
  id: string
  courtId: string
  dayType: DayType
  startTime: string
  endTime: string
  price: number
}

export interface Court {
  id: string
  venueId: string
  name: string
  status: CourtStatus
  pricingSlots: PricingSlot[]
  lockReason?: string
}

export interface Venue {
  id: string
  name: string
  type: VenueType
  courts: Court[]
  status: VenueStatus
}

export interface Reservation {
  id: string
  courtId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  totalPrice: number
  paymentMethod: PaymentMethod
  createdAt: string
  memberName: string
  courtName: string
  venueName: string
}

export interface Member {
  id: string
  name: string
  phone: string
  level: MemberLevel
  balance: number
  totalSpent: number
  visitCount: number
  registeredAt: string
  avatar: string
}

export interface Course {
  id: string
  coachId: string
  coachName: string
  title: string
  venueId: string
  venueName: string
  schedule: string
  capacity: number
  enrolled: number
  price: number
  status: CourseStatus
  category: string
}

export interface Activity {
  id: string
  title: string
  venueId: string
  venueName: string
  date: string
  capacity: number
  enrolled: number
  fee: number
  status: ActivityStatus
  description: string
}

export interface Enrollment {
  id: string
  courseId: string
  activityId: string
  memberId: string
  memberName: string
  type: EnrollmentType
  status: EnrollmentStatus
  enrolledAt: string
}

export interface InspectionTask {
  id: string
  type: InspectionType
  assignee: string
  venueId: string
  venueName: string
  scheduledAt: string
  status: InspectionStatus
  issues: string[]
  description: string
}

export interface Complaint {
  id: string
  orderId: string
  userId: string
  userName: string
  category: string
  description: string
  status: ComplaintStatus
  assignee: string
  createdAt: string
  resolvedAt: string
}

export interface RefundRequest {
  id: string
  orderId: string
  amount: number
  reason: string
  status: RefundStatus
  createdAt: string
  memberName: string
  orderInfo: string
}

export interface GateRecord {
  id: string
  memberId: string
  memberName: string
  gateId: string
  gateName: string
  direction: GateDirection
  timestamp: string
  isAbnormal: boolean
}

export interface EquipmentRecord {
  id: string
  equipmentName: string
  type: EquipmentActionType
  memberId: string
  memberName: string
  timestamp: string
  condition: EquipmentCondition
  equipmentId: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  totalStock: number
  availableStock: number
  venueId: string
}

export interface Transaction {
  id: string
  memberId: string
  memberName: string
  type: TransactionType
  amount: number
  balance: number
  description: string
  createdAt: string
}

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  venueId: string
  isRead: boolean
  createdAt: string
}

export interface DailyStats {
  date: string
  venueId: string
  revenue: number
  visitors: number
  reservations: number
  cancellations: number
}

export interface Coach {
  id: string
  name: string
  phone: string
  specialty: string
  avatar: string
  rating: number
}
