import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, UserX, Clock, AlertTriangle, Download, ArrowRight, Wifi } from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable } from '@/components/DataTable'
import { useAuthStore } from '@/stores/authStore'
import { userDetailPath } from '@/constants/routes'
import { formatTime, relativeTime, formatDuration, getInitials } from '@/lib/utils'
import { mockKpi, mockTodayAttendance, mockHourlyData, mockLiveFeed } from '@/lib/mockData'
import type { UserAttendanceToday, RecognitionEvent } from '@/types'

const col = createColumnHelper<UserAttendanceToday>()

const columns = [
  col.display({
    id: 'user',
    header: 'Name',
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
            {getInitials(u.fullName)}
          </div>
          <span className="font-medium text-text-primary">{u.fullName}</span>
        </div>
      )
    },
  }),
  col.display({
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  col.accessor('entryTime', {
    header: 'Entry',
    cell: (i) => i.getValue()
      ? formatTime(i.getValue()!)
      : <span className="text-muted-foreground">—</span>,
  }),
  col.accessor('exitTime', {
    header: 'Exit',
    cell: (i) => i.getValue()
      ? formatTime(i.getValue()!)
      : <span className="text-muted-foreground">—</span>,
  }),
  col.accessor('durationMinutes', {
    header: 'Duration',
    cell: (i) => i.getValue() != null
      ? <span className="font-mono text-xs">{formatDuration(i.getValue()!)}</span>
      : <span className="text-muted-foreground">—</span>,
  }),
]

function LiveFeedItem({ event }: { event: RecognitionEvent }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0 animate-fade-in">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        event.type === 'unknown'
          ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
          : 'bg-brand-100 text-brand-700'
      }`}>
        {event.type === 'unknown' ? '?' : getInitials(event.fullName ?? '')}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {event.type === 'unknown' ? 'Unknown Person' : event.fullName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{event.cameraName}</p>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        {event.status && <StatusBadge status={event.status} size="sm" />}
        {event.type === 'unknown' && (
          <Badge variant="destructive" className="text-2xs px-2 py-0">Unknown</Badge>
        )}
        <p className="text-2xs text-muted-foreground">{relativeTime(event.timestamp)}</p>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <Card className="px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-brand-600 mt-0.5">{payload[0].value} present</p>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [liveFeed, setLiveFeed] = useState<RecognitionEvent[]>(mockLiveFeed)

  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: async () => mockKpi,
  })
  const { data: todayRows = [], isLoading: tableLoading } = useQuery({
    queryKey: ['dashboard-today'],
    queryFn: async () => mockTodayAttendance,
  })
  const { data: hourly = [] } = useQuery({
    queryKey: ['dashboard-hourly'],
    queryFn: async () => mockHourlyData,
  })

  useEffect(() => {
    const names = ['Arjun Sharma', 'Deepa Pillai', 'Meena Suresh', 'Vikram Das']
    const cameras = ['Main Entrance', 'Floor 2 Entry', 'Parking Entry']
    const timer = setInterval(() => {
      const isKnown = Math.random() > 0.25
      const newEvent: RecognitionEvent = {
        eventId: `live-${Date.now()}`,
        cameraId: 'c1',
        cameraName: cameras[Math.floor(Math.random() * cameras.length)],
        userId: isKnown ? String(Math.ceil(Math.random() * 10)) : undefined,
        fullName: isKnown ? names[Math.floor(Math.random() * names.length)] : undefined,
        type: isKnown ? 'known' : 'unknown',
        status: isKnown ? 'present' : undefined,
        timestamp: new Date().toISOString(),
        confidence: isKnown ? 0.9 + Math.random() * 0.09 : 0.3 + Math.random() * 0.2,
      }
      setLiveFeed((prev) => [newEvent, ...prev].slice(0, 20))
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${user?.departmentName ?? 'Department'} Overview`}
        subtitle={`Today, ${today}`}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download size={13} /> Export Today's Report
          </Button>
        }
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Present Today"      value={kpi?.presentToday ?? 0}      icon={Users}         color="green"  loading={kpiLoading} trend={{ value: 4, label: 'vs yesterday' }} />
        <StatCard title="Absent Today"       value={kpi?.absentToday ?? 0}       icon={UserX}         color="red"    loading={kpiLoading} />
        <StatCard title="Late Arrivals"      value={kpi?.lateArrivals ?? 0}      icon={Clock}         color="amber"  loading={kpiLoading} />
        <StatCard title="Unknown Detections" value={kpi?.unknownDetections ?? 0} icon={AlertTriangle} color="purple" loading={kpiLoading} onClick={() => navigate('/unknown-faces')} />
      </div>

      {/* ── Today's Attendance Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Today's Attendance</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {kpi ? `${kpi.presentToday} of ${kpi.totalUsers} members present` : '—'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 text-xs"
              />
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Download size={12} /> CSV
              </Button>
            </div>
          </div>

          {/* Summary badges */}
          {kpi && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="gap-1.5 text-green-700 border-green-200 bg-green-50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {kpi.presentToday} Present
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-red-700 border-red-200 bg-red-50">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {kpi.absentToday} Absent
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-amber-700 border-amber-200 bg-amber-50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {kpi.lateArrivals} Late
              </Badge>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-4 px-4">
          <DataTable
            data={todayRows}
            columns={columns}
            loading={tableLoading}
            globalFilter={search}
            showPagination={false}
            emptyMessage="No attendance records for today."
            onRowClick={(row) => navigate(userDetailPath(row.userId))}
          />
        </CardContent>
      </Card>

      {/* ── Live Feed + Hourly Chart ── */}
      <div className="grid grid-cols-5 gap-4">

        {/* Live Feed */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Live Activity Feed</CardTitle>
                  <Badge className="gap-1 text-2xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                    <Wifi size={9} /> LIVE
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Real-time recognition events · department cameras
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 h-7"
                onClick={() => navigate('/live-monitor')}
              >
                Live Monitor <ArrowRight size={12} />
              </Button>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 overflow-y-auto max-h-80 pt-2 px-4">
            {liveFeed.map((event) => (
              <LiveFeedItem key={event.eventId} event={event} />
            ))}
          </CardContent>
        </Card>

        {/* Hourly Chart */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Hourly Presence</CardTitle>
            <CardDescription className="text-xs">People present per hour today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourly} barSize={14} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FDFA' }} />
                <Bar dataKey="count" fill="#0D9488" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}