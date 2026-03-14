// ─── Auth / User ────────────────────────────────────────────────────────────

export interface AdminUserModel {
  adminId: string
  fullName: string
  email: string
  phone?: string
  photoUrl?: string
  departmentId: string
  departmentName: string
  role: 'admin'
  lastLogin: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit' | 'on_leave'

export interface UserModel {
  userId: string
  fullName: string
  email: string
  designation: string
  photoUrl?: string
  departmentId: string
  isActive: boolean
  faceRegistered: boolean
  todayStatus: AttendanceStatus
  lastSeen?: string
}

export interface UserDetailModel extends UserModel {
  phone?: string
  joinedAt: string
  employeeId: string
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export interface UserAttendanceToday {
  userId: string
  fullName: string
  photoUrl?: string
  status: AttendanceStatus
  entryTime?: string
  exitTime?: string
  durationMinutes?: number
}

export interface AttendanceLogEntry {
  logId: string
  userId: string
  fullName: string
  photoUrl?: string
  eventType: 'entry' | 'exit'
  timestamp: string
  cameraId: string
  cameraName: string
}

export interface CalendarGridData {
  month: string  // YYYY-MM
  days: Array<{
    date: string   // YYYY-MM-DD
    summary: { present: number; absent: number; late: number }
    users: Array<{ userId: string; status: AttendanceStatus }>
  }>
}

// ─── KPI ────────────────────────────────────────────────────────────────────

export interface DeptKpiModel {
  presentToday: number
  absentToday: number
  lateArrivals: number
  unknownDetections: number
  totalUsers: number
}

export interface HourlyData {
  hour: string   // "08:00"
  count: number
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsOverviewModel {
  attendanceRate: Array<{ date: string; rate: number }>
  presenceHeatmap: Array<{ day: string; hour: number; value: number }>
  lateArrivalsTrend: Array<{ date: string; count: number }>
  avgDurationTrend: Array<{ date: string; hours: number }>
  topPerformers: Array<{ userId: string; fullName: string; rate: number }>
  summary: {
    totalPresent: number
    totalAbsent: number
    totalLate: number
    avgAttendanceRate: number
    avgDurationHours: number
  }
}

export interface UserAnalyticsModel {
  attendanceRate: number
  avgDurationHours: number
  totalPresent: number
  totalAbsent: number
  totalLate: number
  trend: Array<{ date: string; status: AttendanceStatus }>
}

// ─── Camera / Live Monitor ──────────────────────────────────────────────────

export interface CameraModel {
  cameraId: string
  name: string
  location: string
  isOnline: boolean
  streamUrl?: string
  lastEventAt?: string
}

export interface RecognitionEvent {
  eventId: string
  cameraId: string
  cameraName: string
  userId?: string
  fullName?: string
  photoUrl?: string
  type: 'known' | 'unknown'
  status?: AttendanceStatus
  timestamp: string
  confidence: number
}

// ─── Unknown Faces ──────────────────────────────────────────────────────────

export interface UnknownFaceModel {
  faceId: string
  cameraId: string
  cameraName: string
  capturedAt: string
  imageUrl: string
  reviewStatus: 'pending' | 'reviewed'
  reviewedAt?: string
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotificationType =
  | 'late_arrival'
  | 'early_exit'
  | 'absent'
  | 'high_absence_rate'
  | 'unknown_face'
  | 'system'

export interface NotificationModel {
  notificationId: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AdminProfileModel {
  adminId: string
  fullName: string
  email: string
  phone?: string
  photoUrl?: string
  departmentId: string
  departmentName: string
}

export interface NotificationRulesModel {
  lateArrival: boolean
  earlyExit: boolean
  absent: boolean
  highAbsenceRate: boolean
  absenceThreshold: number
  unknownFace: boolean
}

export interface DisplayPrefsModel {
  defaultLandingPage: 'dashboard' | 'attendance' | 'analytics'
  defaultPeriod: 'week' | 'month' | '3months'
  tableRowsPerPage: 10 | 20 | 50
  showLateWarning: boolean
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── API errors ──────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}
