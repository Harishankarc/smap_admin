import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Users, UserX, Clock, AlertTriangle, Download, ArrowRight, Wifi,
} from 'lucide-react'
import { createColumnHelper } from '@tanstack/react-table'

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
    cell: (i) => i.getValue() ? formatTime(i.getValue()!) : <span className="text-text-secondary">—</span>,
  }),
  col.accessor('exitTime', {
    header: 'Exit',
    cell: (i) => i.getValue() ? formatTime(i.getValue()!) : <span className="text-text-secondary">—</span>,
  }),
  col.accessor('durationMinutes', {
    header: 'Duration',
    cell: (i) => i.getValue() != null
      ? <span className="font-mono text-xs">{formatDuration(i.getValue()!)}</span>
      : <span className="text-text-secondary">—</span>,
  }),
]

function LiveFeedItem({ event }: { event: RecognitionEvent }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 animate-fade-in">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        event.type === 'unknown'
          ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
          : 'bg-brand-100 text-brand-700'
      }`}>
        {event.type === 'unknown' ? '?' : getInitials(event.fullName ?? '')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {event.type === 'unknown' ? 'Unknown Person' : event.fullName}
        </p>
        <p className="text-xs text-text-secondary truncate">{event.cameraName}</p>
      </div>
      <div className="text-right shrink-0">
        {event.status && <StatusBadge status={event.status} size="sm" />}
        {event.type === 'unknown' && (
          <span className="text-2xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
            Unknown
          </span>
        )}
        <p className="text-2xs text-text-secondary mt-0.5">{relativeTime(event.timestamp)}</p>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-card-md">
      <p className="text-text-secondary">{label}</p>
      <p className="font-semibold text-brand-600 mt-0.5">{payload[0].value} present</p>
    </div>
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

  // Simulate live WebSocket events
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
          <button className="btn-secondary text-xs gap-1.5">
            <Download size={13} />
            Export Today's Report
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Present Today"      value={kpi?.presentToday ?? 0}      icon={Users}         color="green"  loading={kpiLoading} trend={{ value: 4, label: 'vs yesterday' }} />
        <StatCard title="Absent Today"       value={kpi?.absentToday ?? 0}       icon={UserX}         color="red"    loading={kpiLoading} />
        <StatCard title="Late Arrivals"      value={kpi?.lateArrivals ?? 0}      icon={Clock}         color="amber"  loading={kpiLoading} />
        <StatCard title="Unknown Detections" value={kpi?.unknownDetections ?? 0} icon={AlertTriangle} color="purple" loading={kpiLoading} onClick={() => navigate('/unknown-faces')} />
      </div>

      {/* Today's Attendance Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Today's Attendance</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {kpi ? `${kpi.presentToday} of ${kpi.totalUsers} members present` : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base w-44 h-8 text-xs"
            />
            <button className="btn-secondary text-xs h-8 gap-1.5">
              <Download size={12} /> CSV
            </button>
          </div>
        </div>

        {kpi && (
          <div className="flex items-center gap-3 mb-4">
            {[
              { label: 'Present', value: kpi.presentToday, color: 'bg-green-500' },
              { label: 'Absent',  value: kpi.absentToday,  color: 'bg-red-500' },
              { label: 'Late',    value: kpi.lateArrivals,  color: 'bg-amber-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-text-secondary">{value} {label}</span>
              </div>
            ))}
          </div>
        )}

        <DataTable
          data={todayRows}
          columns={columns}
          loading={tableLoading}
          globalFilter={search}
          showPagination={false}
          emptyMessage="No attendance records for today."
          onRowClick={(row) => navigate(userDetailPath(row.userId))}
        />
      </div>

      {/* Live Feed + Hourly Chart */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary text-sm">Live Activity Feed</h3>
                <span className="flex items-center gap-1 text-2xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">
                  <Wifi size={9} /> LIVE
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">Real-time recognition events · department cameras</p>
            </div>
            <button onClick={() => navigate('/live-monitor')} className="btn-ghost text-xs gap-1">
              Live Monitor <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            {liveFeed.map((event) => (
              <LiveFeedItem key={event.eventId} event={event} />
            ))}
          </div>
        </div>

        <div className="col-span-2 card p-5">
          <h3 className="font-semibold text-text-primary text-sm mb-1">Hourly Presence</h3>
          <p className="text-xs text-text-secondary mb-4">People present per hour today</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourly} barSize={14} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FDFA' }} />
              <Bar dataKey="count" fill="#0D9488" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
