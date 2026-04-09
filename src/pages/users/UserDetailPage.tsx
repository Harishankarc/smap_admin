import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Mail, Phone, Building2, CalendarDays,
  Clock, CheckCircle2, XCircle, AlertTriangle, LogIn, LogOut,
  TrendingUp, User,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/StatusBadge'
import { cn, getInitials, formatTime, relativeTime, formatDuration, formatDate } from '@/lib/utils'
import { mockUsers, mockTodayAttendance } from '@/lib/mockData'
import { toast } from '@/stores/uiStore'
import type { AttendanceStatus } from '@/types'
import {
  format, addMonths, subMonths, getDaysInMonth,
  getDay, startOfMonth,
} from 'date-fns'

// ─── Mock detail data ─────────────────────────────────────────────────────────

function getMockUserDetail(userId: string) {
  const user = mockUsers.find(u => u.userId === userId) ?? mockUsers[0]
  return {
    ...user,
    phone: '+91 98765 43210',
    joinedAt: '2022-03-15',
    employeeId: `EMP-${userId.padStart(4, '0')}`,
  }
}

function getMockAttendanceLogs(userId: string) {
  const attendance = mockTodayAttendance.find(u => u.userId === userId) ?? mockTodayAttendance[0]
  return [
    { logId: 'l1', type: 'entry' as const, time: attendance.entryTime ?? new Date(Date.now() - 4*3600000).toISOString(), camera: 'Main Entrance' },
    { logId: 'l2', type: 'exit'  as const, time: new Date(Date.now() - 2*3600000).toISOString(),                          camera: 'Main Entrance' },
    { logId: 'l3', type: 'entry' as const, time: new Date(Date.now() - 1.5*3600000).toISOString(),                        camera: 'Floor 2 Corridor' },
  ]
}

function getMockAnalytics() {
  return {
    attendanceRate: 87,
    avgDurationHours: 7.4,
    totalPresent: 18,
    totalAbsent: 3,
    totalLate: 2,
    trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: +(6.5 + Math.sin(i * 0.7) * 1.2 + (Math.random() - 0.5) * 0.6).toFixed(1),
    })),
    latePerWeek: [
      { week: 'Wk 1', count: 0 },
      { week: 'Wk 2', count: 1 },
      { week: 'Wk 3', count: 0 },
      { week: 'Wk 4', count: 1 },
    ],
  }
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present:    'bg-emerald-500',
  absent:     'bg-red-400',
  late:       'bg-amber-400',
  early_exit: 'bg-orange-400',
  on_leave:   'bg-sky-400',
}

function makeMockCalendar(year: number, month: number) {
  const statuses: AttendanceStatus[] = ['present','present','present','late','absent','early_exit','present']
  return Array.from({ length: getDaysInMonth(new Date(year, month)) }, (_, i) => ({
    day: i + 1,
    status: (i % 7 === 6 || i % 7 === 5)
      ? null
      : statuses[i % statuses.length] as AttendanceStatus,
  }))
}

// ─── Attendance calendar ──────────────────────────────────────────────────────

function AttendanceCalendar() {
  const today    = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const year   = viewDate.getFullYear()
  const month  = viewDate.getMonth()
  const days   = makeMockCalendar(year, month)
  const firstDow = getDay(startOfMonth(viewDate))

  const counts = days.reduce((acc, d) => {
    if (d.status) acc[d.status] = (acc[d.status] ?? 0) + 1
    return acc
  }, {} as Record<AttendanceStatus, number>)

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(counts) as [AttendanceStatus, number][]).map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('w-2 h-2 rounded-full', STATUS_DOT[status])} />
            {count} {status.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setViewDate(subMonths(viewDate, 1))}>‹</Button>
        <p className="text-sm font-semibold">{format(viewDate, 'MMMM yyyy')}</p>
        <Button variant="ghost" size="sm" onClick={() => setViewDate(addMonths(viewDate, 1))}>›</Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-2xs font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(({ day, status }) => {
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
          return (
            <div
              key={day}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-xs',
                isToday && 'ring-2 ring-brand-400',
                status ? 'cursor-default' : 'opacity-30',
              )}
              style={status ? { backgroundColor: `${getStatusBg(status)}` } : {}}
            >
              <span className={cn('font-medium', isToday && 'text-brand-600')}>{day}</span>
              {status && <span className={cn('w-1.5 h-1.5 rounded-full mt-0.5', STATUS_DOT[status])} />}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(STATUS_DOT).map(([s, dot]) => (
          <div key={s} className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', dot)} />
            <span className="text-2xs text-muted-foreground capitalize">{s.replace('_',' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getStatusBg(status: AttendanceStatus) {
  return {
    present:    'rgba(16,185,129,0.08)',
    absent:     'rgba(239,68,68,0.08)',
    late:       'rgba(245,158,11,0.08)',
    early_exit: 'rgba(249,115,22,0.08)',
    on_leave:   'rgba(14,165,233,0.08)',
  }[status]
}

// ─── Logs tab ─────────────────────────────────────────────────────────────────

function LogsTab({ userId }: { userId: string }) {
  const logs = getMockAttendanceLogs(userId)
  return (
    <div className="space-y-1">
      {logs.map((log, i) => (
        <div key={log.logId}>
          <div className="flex items-center gap-3 py-3">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              log.type === 'entry' ? 'bg-emerald-500/10' : 'bg-sky-500/10',
            )}>
              {log.type === 'entry'
                ? <LogIn  size={14} className="text-emerald-500" />
                : <LogOut size={14} className="text-sky-500" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{log.type}</p>
              <p className="text-xs text-muted-foreground">{log.camera}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono">{formatTime(log.time)}</p>
              <p className="text-xs text-muted-foreground">{relativeTime(log.time)}</p>
            </div>
          </div>
          {i < logs.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}

// ─── Analytics tab ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-brand-600">{payload[0].value}{unit}</p>
    </div>
  )
}

function AnalyticsTab() {
  const data = getMockAnalytics()
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Attendance Rate', value: `${data.attendanceRate}%`,   icon: TrendingUp,    color: 'text-teal-500'    },
          { label: 'Avg Duration',    value: `${data.avgDurationHours}h`, icon: Clock,         color: 'text-green-500'   },
          { label: 'Days Present',    value: data.totalPresent,            icon: CheckCircle2,  color: 'text-emerald-500' },
          { label: 'Days Absent',     value: data.totalAbsent,             icon: XCircle,       color: 'text-red-500'     },
          { label: 'Late Arrivals',   value: data.totalLate,               icon: AlertTriangle, color: 'text-amber-500'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex flex-col gap-1">
              <Icon size={15} className={color} />
              <p className="text-lg font-semibold">{value}</p>
              <p className="text-2xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Duration trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Duration (last 30 days)</CardTitle>
          <CardDescription className="text-xs">Hours present per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data.trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="userDurGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis domain={[4,10]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v=>`${v}h`} />
              <Tooltip content={<ChartTooltip unit="h" />} />
              <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={2} fill="url(#userDurGrad)" dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Late arrivals per week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Late Arrivals by Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data.latePerWeek} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip unit=" late" />} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const qc         = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', id],
    queryFn:  async () => getMockUserDetail(id ?? '1'),
  })

  const toggleStatus = useMutation({
    mutationFn: async (isActive: boolean) => {
      await new Promise(r => setTimeout(r, 600))
      return isActive
    },
    onSuccess: (isActive) => {
      qc.setQueryData(['user-detail', id], (old: typeof user) =>
        old ? { ...old, isActive } : old
      )
      toast(`User ${isActive ? 'activated' : 'deactivated'}`, 'success')
    },
  })

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Back to Users
      </button>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold shrink-0">
              {getInitials(user.fullName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">{user.fullName}</h2>
                  <p className="text-sm text-muted-foreground">{user.designation}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={user.todayStatus} />
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/10' : ''}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={user.faceRegistered ? 'outline' : 'secondary'}>
                      {user.faceRegistered ? '✓ Face Registered' : 'Face Not Registered'}
                    </Badge>
                  </div>
                </div>

                {/* Status toggle */}
                <Button
                  variant={user.isActive ? 'outline' : 'default'}
                  size="sm"
                  className={cn('text-xs gap-1.5 shrink-0', !user.isActive && 'bg-brand-600 hover:bg-brand-700 text-white')}
                  disabled={toggleStatus.isPending}
                  onClick={() => toggleStatus.mutate(!user.isActive)}
                >
                  {toggleStatus.isPending
                    ? 'Updating…'
                    : user.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={13} />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={13} />
                  <span>{(user as typeof user & { phone?: string }).phone ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 size={13} />
                  <span>{user.departmentId}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={13} />
                  <span>Joined {formatDate((user as typeof user & { joinedAt: string }).joinedAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={13} />
                  <span className="font-mono text-xs">{(user as typeof user & { employeeId: string }).employeeId}</span>
                </div>
                {user.lastSeen && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={13} />
                    <span>Last seen {relativeTime(user.lastSeen)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Monthly Attendance</CardTitle>
              <CardDescription className="text-xs">Colour-coded attendance calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Entry / Exit Logs</CardTitle>
              <CardDescription className="text-xs">Recent access events for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <LogsTab userId={id ?? '1'} />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}