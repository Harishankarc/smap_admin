import type {
  DeptKpiModel, UserAttendanceToday, HourlyData,
  RecognitionEvent, UserModel, NotificationModel,
} from '@/types'

export const mockKpi: DeptKpiModel = {
  presentToday: 34,
  absentToday: 8,
  lateArrivals: 5,
  unknownDetections: 2,
  totalUsers: 42,
}

export const mockTodayAttendance: UserAttendanceToday[] = [
  { userId: '1', fullName: 'Aisha Nair',       status: 'present',    entryTime: '2026-03-14T08:45:00Z', exitTime: undefined,              durationMinutes: 230 },
  { userId: '2', fullName: 'Rohan Mehta',       status: 'late',       entryTime: '2026-03-14T09:32:00Z', exitTime: undefined,              durationMinutes: 163 },
  { userId: '3', fullName: 'Priya Krishnan',    status: 'present',    entryTime: '2026-03-14T08:52:00Z', exitTime: undefined,              durationMinutes: 223 },
  { userId: '4', fullName: 'Arjun Sharma',      status: 'absent',     entryTime: undefined,              exitTime: undefined,              durationMinutes: undefined },
  { userId: '5', fullName: 'Deepa Pillai',      status: 'present',    entryTime: '2026-03-14T08:38:00Z', exitTime: undefined,              durationMinutes: 237 },
  { userId: '6', fullName: 'Kiran Raj',         status: 'late',       entryTime: '2026-03-14T09:58:00Z', exitTime: undefined,              durationMinutes: 137 },
  { userId: '7', fullName: 'Sneha Thomas',      status: 'present',    entryTime: '2026-03-14T08:30:00Z', exitTime: undefined,              durationMinutes: 245 },
  { userId: '8', fullName: 'Vikram Das',        status: 'absent',     entryTime: undefined,              exitTime: undefined,              durationMinutes: undefined },
  { userId: '9', fullName: 'Meena Suresh',      status: 'early_exit', entryTime: '2026-03-14T08:55:00Z', exitTime: '2026-03-14T11:00:00Z', durationMinutes: 125 },
  { userId: '10', fullName: 'Rahul Iyer',       status: 'present',    entryTime: '2026-03-14T08:47:00Z', exitTime: undefined,              durationMinutes: 228 },
]

export const mockHourlyData: HourlyData[] = [
  { hour: '07:00', count: 2 },
  { hour: '08:00', count: 18 },
  { hour: '09:00', count: 28 },
  { hour: '10:00', count: 34 },
  { hour: '11:00', count: 33 },
  { hour: '12:00', count: 29 },
  { hour: '13:00', count: 27 },
  { hour: '14:00', count: 32 },
  { hour: '15:00', count: 30 },
  { hour: '16:00', count: 26 },
  { hour: '17:00', count: 14 },
  { hour: '18:00', count: 5 },
]

export const mockLiveFeed: RecognitionEvent[] = [
  { eventId: 'e1', cameraId: 'c1', cameraName: 'Main Entrance', userId: '1',  fullName: 'Aisha Nair',    type: 'known',   status: 'present', timestamp: new Date(Date.now() - 2 * 60000).toISOString(),  confidence: 0.98 },
  { eventId: 'e2', cameraId: 'c2', cameraName: 'Floor 2 Entry', userId: '3',  fullName: 'Priya Krishnan',type: 'known',   status: 'present', timestamp: new Date(Date.now() - 5 * 60000).toISOString(),  confidence: 0.96 },
  { eventId: 'e3', cameraId: 'c1', cameraName: 'Main Entrance',                                          type: 'unknown',            timestamp: new Date(Date.now() - 9 * 60000).toISOString(),  confidence: 0.41 },
  { eventId: 'e4', cameraId: 'c3', cameraName: 'Parking Entry', userId: '6',  fullName: 'Kiran Raj',     type: 'known',   status: 'late',    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), confidence: 0.97 },
  { eventId: 'e5', cameraId: 'c1', cameraName: 'Main Entrance', userId: '7',  fullName: 'Sneha Thomas',  type: 'known',   status: 'present', timestamp: new Date(Date.now() - 22 * 60000).toISOString(), confidence: 0.99 },
  { eventId: 'e6', cameraId: 'c2', cameraName: 'Floor 2 Entry', userId: '10', fullName: 'Rahul Iyer',    type: 'known',   status: 'present', timestamp: new Date(Date.now() - 31 * 60000).toISOString(), confidence: 0.95 },
]

export const mockUsers: UserModel[] = [
  { userId: '1',  fullName: 'Aisha Nair',     email: 'aisha@co.com',    designation: 'Senior Engineer',    departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'present',    lastSeen: new Date(Date.now() - 2 * 60000).toISOString() },
  { userId: '2',  fullName: 'Rohan Mehta',    email: 'rohan@co.com',    designation: 'Engineer',            departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'late',       lastSeen: new Date(Date.now() - 5 * 60000).toISOString() },
  { userId: '3',  fullName: 'Priya Krishnan', email: 'priya@co.com',    designation: 'Lead Designer',       departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'present',    lastSeen: new Date(Date.now() - 8 * 60000).toISOString() },
  { userId: '4',  fullName: 'Arjun Sharma',   email: 'arjun@co.com',    designation: 'Product Manager',     departmentId: 'd1', isActive: true,  faceRegistered: false, todayStatus: 'absent',     lastSeen: new Date(Date.now() - 86400000).toISOString() },
  { userId: '5',  fullName: 'Deepa Pillai',   email: 'deepa@co.com',    designation: 'QA Engineer',         departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'present',    lastSeen: new Date(Date.now() - 12 * 60000).toISOString() },
  { userId: '6',  fullName: 'Kiran Raj',      email: 'kiran@co.com',    designation: 'DevOps Engineer',     departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'late',       lastSeen: new Date(Date.now() - 15 * 60000).toISOString() },
  { userId: '7',  fullName: 'Sneha Thomas',   email: 'sneha@co.com',    designation: 'UI Designer',         departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'present',    lastSeen: new Date(Date.now() - 22 * 60000).toISOString() },
  { userId: '8',  fullName: 'Vikram Das',     email: 'vikram@co.com',   designation: 'Backend Developer',   departmentId: 'd1', isActive: false, faceRegistered: true,  todayStatus: 'absent',     lastSeen: new Date(Date.now() - 3 * 86400000).toISOString() },
  { userId: '9',  fullName: 'Meena Suresh',   email: 'meena@co.com',    designation: 'Business Analyst',    departmentId: 'd1', isActive: true,  faceRegistered: false, todayStatus: 'early_exit', lastSeen: new Date(Date.now() - 180 * 60000).toISOString() },
  { userId: '10', fullName: 'Rahul Iyer',     email: 'rahul@co.com',    designation: 'Frontend Developer',  departmentId: 'd1', isActive: true,  faceRegistered: true,  todayStatus: 'present',    lastSeen: new Date(Date.now() - 31 * 60000).toISOString() },
]

export const mockNotifications: NotificationModel[] = [
  { notificationId: 'n1', type: 'late_arrival',     title: 'Late Arrival',          body: 'Rohan Mehta arrived 32 minutes late.',                       isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { notificationId: 'n2', type: 'late_arrival',     title: 'Late Arrival',          body: 'Kiran Raj arrived 58 minutes late.',                         isRead: false, createdAt: new Date(Date.now() - 35 * 60000).toISOString() },
  { notificationId: 'n3', type: 'unknown_face',     title: 'Unknown Face Detected', body: 'An unrecognised person was detected at Main Entrance.',       isRead: false, createdAt: new Date(Date.now() - 9 * 60000).toISOString() },
  { notificationId: 'n4', type: 'high_absence_rate',title: 'High Absence Rate',     body: 'Department attendance dropped to 76% today.',                 isRead: true,  createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { notificationId: 'n5', type: 'early_exit',       title: 'Early Exit',            body: 'Meena Suresh left 2 hours before the end of shift.',          isRead: true,  createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { notificationId: 'n6', type: 'system',           title: 'System Message',        body: 'Camera maintenance scheduled for Sunday 10:00–12:00 PM.',     isRead: true,  createdAt: new Date(Date.now() - 86400000).toISOString() },
]
