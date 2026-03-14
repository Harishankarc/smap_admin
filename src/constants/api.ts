const BASE = '/api/admin'

export const API = {
  // Auth
  LOGIN:          '/api/auth/admin/login',
  LOGOUT:         '/api/auth/logout',
  REFRESH:        '/api/auth/refresh',

  // Profile
  PROFILE:        `${BASE}/profile`,
  PROFILE_PHOTO:  `${BASE}/profile/photo`,
  PROFILE_PASSWORD: `${BASE}/profile/password`,

  // Dashboard
  DASHBOARD_KPI:      `${BASE}/dashboard/kpi`,
  DASHBOARD_TODAY:    `${BASE}/dashboard/attendance/today`,
  DASHBOARD_HOURLY:   `${BASE}/dashboard/hourly-activity`,

  // Cameras / Live Monitor
  CAMERAS:            `${BASE}/cameras`,
  CAMERA_STREAM:      (id: string) => `${BASE}/cameras/${id}/stream`,
  CAMERA_EVENTS:      (id: string) => `${BASE}/cameras/${id}/events`,

  // Attendance
  ATTENDANCE_DAILY:   `${BASE}/attendance/daily`,
  ATTENDANCE_CALENDAR:`${BASE}/attendance/calendar`,
  ATTENDANCE_LOGS:    `${BASE}/attendance/logs`,

  // Reports
  REPORTS_EXPORT:     `${BASE}/reports/export`,

  // Users
  USERS:              `${BASE}/users`,
  USER_DETAIL:        (id: string) => `${BASE}/users/${id}`,
  USER_STATUS:        (id: string) => `${BASE}/users/${id}/status`,
  USER_ATTENDANCE:    (id: string) => `${BASE}/users/${id}/attendance/calendar`,
  USER_LOGS:          (id: string) => `${BASE}/users/${id}/logs`,
  USER_ANALYTICS:     (id: string) => `${BASE}/users/${id}/analytics`,

  // Analytics
  ANALYTICS_OVERVIEW: `${BASE}/analytics/overview`,

  // Unknown Faces
  UNKNOWN_FACES:        `${BASE}/unknown-faces`,
  UNKNOWN_FACE_REVIEW:  (id: string) => `${BASE}/unknown-faces/${id}/review`,
  UNKNOWN_FACES_BULK:   `${BASE}/unknown-faces/bulk-review`,
  UNKNOWN_FACE_REPORT:  (id: string) => `${BASE}/unknown-faces/${id}/report`,

  // Notifications
  NOTIFICATIONS:      `${BASE}/notifications`,
  NOTIFICATION_READ:  (id: string) => `${BASE}/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${BASE}/notifications/read-all`,

  // Settings
  SETTINGS_NOTIFICATIONS: `${BASE}/settings/notifications`,
  SETTINGS_PREFERENCES:   `${BASE}/settings/preferences`,
} as const
