import { useState, useMemo } from 'react'
import { type LucideIcon } from 'lucide-react'
import {
  Bell, Clock, CheckCheck, ChevronDown, ChevronUp,
  AlertTriangle, LogIn, LogOut, UserX, MessageSquare, Activity,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from '@/components/PageHeader'
import { cn, relativeTime, formatTime } from '@/lib/utils'
import type { NotificationType, NotificationModel } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: NotificationModel[] = [
  {
    notificationId: 'n1',
    type: 'high_absence_rate',
    title: 'High Absence Rate Alert',
    body: 'Department attendance has dropped to 71% today — below your configured threshold of 75%. 3 members have not checked in. Consider sending a reminder or checking in with the team.',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    notificationId: 'n2',
    type: 'unknown_face',
    title: 'Unknown Face Detected',
    body: 'An unrecognised person was detected at Main Entrance (cam-01) at 09:32 AM. Confidence score: 38%. The person appeared twice within 10 minutes. Please review the footage.',
    isRead: false,
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    notificationId: 'n3',
    type: 'late_arrival',
    title: 'Late Arrival',
    body: 'Rohan Mehta arrived 32 minutes late (checked in at 09:32 AM). This is their 3rd late arrival this month.',
    isRead: false,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    notificationId: 'n4',
    type: 'late_arrival',
    title: 'Late Arrival',
    body: 'Kiran Raj arrived 58 minutes late (checked in at 09:58 AM).',
    isRead: false,
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
  },
  {
    notificationId: 'n5',
    type: 'early_exit',
    title: 'Early Exit',
    body: 'Meena Suresh left 2 hours before the end of shift (checked out at 03:00 PM). Expected departure: 05:00 PM.',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    notificationId: 'n6',
    type: 'absent',
    title: 'Absence Recorded',
    body: 'Arjun Sharma has not checked in today. This is their 2nd absence this week.',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    notificationId: 'n7',
    type: 'unknown_face',
    title: 'Unknown Face Detected',
    body: 'An unrecognised person was detected at Floor 2 Corridor (cam-02) at 02:15 PM. Confidence score: 42%.',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    notificationId: 'n8',
    type: 'system',
    title: 'System Message',
    body: 'Camera maintenance is scheduled for Sunday 10:00 AM – 12:00 PM. Cameras cam-03 and cam-06 will be temporarily offline. Live Monitor and face recognition will be unavailable for those cameras during this window.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    notificationId: 'n9',
    type: 'late_arrival',
    title: 'Late Arrival',
    body: 'Vikram Das arrived 45 minutes late (checked in at 09:45 AM).',
    isRead: true,
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    notificationId: 'n10',
    type: 'high_absence_rate',
    title: 'High Absence Rate Alert',
    body: 'Department attendance dropped to 68% yesterday. 4 members were absent. This was the lowest attendance rate this month.',
    isRead: true,
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
  {
    notificationId: 'n11',
    type: 'absent',
    title: 'Absence Recorded',
    body: 'Vikram Das has not checked in today.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    notificationId: 'n12',
    type: 'system',
    title: 'System Message',
    body: 'Your notification rules have been updated by the Super Admin. Absence alerts are now enabled for your department.',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'unread' | NotificationType

const FILTER_CHIPS: { value: FilterType; label: string }[] = [
  { value: 'all',               label: 'All' },
  { value: 'unread',            label: 'Unread' },
  { value: 'late_arrival',      label: 'Late Arrival' },
  { value: 'early_exit',        label: 'Early Exit' },
  { value: 'absent',            label: 'Absent' },
  { value: 'high_absence_rate', label: 'High Absence' },
  { value: 'unknown_face',      label: 'Unknown Face' },
  { value: 'system',            label: 'System' },
]

const TYPE_CONFIG: Record<NotificationType, {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  border: string
}> = {
  late_arrival:      { icon: LogIn,         iconBg: 'bg-amber-500/10',  iconColor: 'text-amber-400',  border: 'border-amber-500/20' },
  early_exit:        { icon: LogOut,        iconBg: 'bg-sky-500/10',    iconColor: 'text-sky-400',    border: 'border-sky-500/20' },
  absent:            { icon: Clock,         iconBg: 'bg-red-500/10',    iconColor: 'text-red-400',    border: 'border-red-500/20' },
  high_absence_rate: { icon: AlertTriangle, iconBg: 'bg-red-500/10',    iconColor: 'text-red-400',    border: 'border-red-500/30' },
  unknown_face:      { icon: UserX,         iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400', border: 'border-purple-500/20' },
  system:            { icon: MessageSquare, iconBg: 'bg-teal-500/10',   iconColor: 'text-teal-400',   border: 'border-teal-500/20' },
}

// ─── Group by date ────────────────────────────────────────────────────────────

function groupByDate(notifications: NotificationModel[]) {
  const groups: Record<string, NotificationModel[]> = {}
  notifications.forEach(n => {
    const d = new Date(n.createdAt)
    const now = new Date()
    let label: string
    if (d.toDateString() === now.toDateString()) {
      label = 'Today'
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      label = d.toDateString() === yesterday.toDateString()
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationModel
  onMarkRead: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TYPE_CONFIG[notification.type]
  const Icon = cfg.icon
  const isHighAbsence = notification.type === 'high_absence_rate'

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        isHighAbsence
          ? 'border-l-4 border-l-red-500 border-t-red-500/20 border-r-red-500/20 border-b-red-500/20 bg-red-500/5'
          : cn('border', cfg.border, !notification.isRead ? 'bg-muted/40' : 'bg-background'),
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => {
          setExpanded(e => !e)
          if (!notification.isRead) onMarkRead(notification.notificationId)
        }}
      >
        {/* Icon */}
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.iconBg)}>
          <Icon size={16} className={cfg.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm truncate', !notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80')}>
              {notification.title}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              )}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {relativeTime(notification.createdAt)}
              </span>
            </div>
          </div>

          {/* Preview or full body */}
          <p className={cn(
            'text-xs text-muted-foreground mt-1 leading-relaxed',
            !expanded && 'line-clamp-2',
          )}>
            {notification.body}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xs text-muted-foreground">
              {formatTime(notification.createdAt)}
            </span>
            <button className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> More</>}
            </button>
          </div>
        </div>
      </div>

      {/* High absence action */}
      {isHighAbsence && expanded && (
        <div className="px-4 pb-3 pt-0">
          <Separator className="mb-3" />
          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1.5">
            <Activity size={12} /> View Attendance
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationModel[]>(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState<FilterType>('all')

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filtered = useMemo(() => {
    if (filter === 'all')    return notifications
    if (filter === 'unread') return notifications.filter(n => !n.isRead)
    return notifications.filter(n => n.type === filter)
  }, [notifications, filter])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  function markRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
    )
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle="Alerts and updates for your department"
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={markAllRead}>
              <CheckCheck size={13} /> Mark All Read
            </Button>
          ) : undefined
        }
      />

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_CHIPS.map(chip => {
          const count = chip.value === 'unread'
            ? unreadCount
            : chip.value === 'all'
            ? notifications.length
            : notifications.filter(n => n.type === chip.value).length

          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                filter === chip.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-foreground',
              )}
            >
              {chip.label}
              {count > 0 && (
                <span className={cn(
                  'text-2xs font-bold px-1.5 py-0.5 rounded-full',
                  filter === chip.value
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground',
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Notification list ── */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Sticky date header */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {date}
                </p>
                <Separator className="flex-1" />
                <Badge variant="secondary" className="text-2xs shrink-0">{items.length}</Badge>
              </div>

              <div className="space-y-2">
                {items.map(n => (
                  <NotificationRow
                    key={n.notificationId}
                    notification={n}
                    onMarkRead={markRead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}