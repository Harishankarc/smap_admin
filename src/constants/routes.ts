export const ROUTES = {
  LOGIN:          '/login',
  DASHBOARD:      '/dashboard',
  LIVE_MONITOR:   '/live-monitor',
  ATTENDANCE:     '/attendance',
  USERS:          '/users',
  USER_DETAIL:    '/users/:id',
  ANALYTICS:      '/analytics',
  UNKNOWN_FACES:  '/unknown-faces',
  NOTIFICATIONS:  '/notifications',
  SETTINGS:       '/settings',
} as const

export function userDetailPath(id: string) {
  return `/users/${id}`
}
