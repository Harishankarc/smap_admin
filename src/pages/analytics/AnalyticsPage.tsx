import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import { Download, TrendingUp, TrendingDown, Users, Clock, CalendarCheck, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | '3months' | 'year'

// ─── Mock data generators ─────────────────────────────────────────────────────

function genDailyRate(days: number, base = 82) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { date: label, rate: Math.min(100, Math.max(55, base + Math.sin(i * 0.7) * 12 + (Math.random() - 0.5) * 8)) }
  })
}

function genLateArrival(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { date: label, count: Math.floor(Math.random() * 6) }
  })
}

function genDuration(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { date: label, hours: +(7 + Math.sin(i * 0.5) * 1.2 + (Math.random() - 0.5) * 0.8).toFixed(1) }
  })
}

function genHeatmap() {
  const days = ['Mon','Tue','Wed','Thu','Fri']
  const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`)
  return days.flatMap(day =>
    hours.map(hour => ({
      day, hour,
      value: Math.floor(Math.random() * 38) + 2,
    }))
  )
}

const TOP_PERFORMERS = [
  { userId:'1',  fullName:'Aisha Nair',     rate: 98 },
  { userId:'7',  fullName:'Sneha Thomas',   rate: 96 },
  { userId:'3',  fullName:'Priya Krishnan', rate: 94 },
  { userId:'5',  fullName:'Deepa Pillai',   rate: 91 },
  { userId:'2',  fullName:'Rohan Mehta',    rate: 88 },
  { userId:'10', fullName:'Rahul Iyer',     rate: 85 },
  { userId:'6',  fullName:'Kiran Raj',      rate: 79 },
  { userId:'9',  fullName:'Meena Suresh',   rate: 74 },
  { userId:'4',  fullName:'Arjun Sharma',   rate: 65 },
  { userId:'8',  fullName:'Vikram Das',     rate: 52 },
]

const DEPT_USERS = [
  { value: 'all', label: 'All Users' },
  { value: '1',   label: 'Aisha Nair' },
  { value: '3',   label: 'Priya Krishnan' },
  { value: '7',   label: 'Sneha Thomas' },
  { value: '10',  label: 'Rahul Iyer' },
  { value: '2',   label: 'Rohan Mehta' },
]

const PERIOD_DAYS: Record<Period, number> = {
  today: 1, week: 7, month: 30, '3months': 90, year: 365,
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.value}{unit}
        </p>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function KpiCard({ title, value, unit = '', icon: Icon, trend, color }: {
  title: string; value: number | string; unit?: string
  icon: typeof Users; trend?: { value: number; label: string }
  color: 'teal' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    teal:  { icon: 'bg-teal-500/10 text-teal-400',   badge: 'text-teal-400' },
    green: { icon: 'bg-green-500/10 text-green-400',  badge: 'text-green-400' },
    amber: { icon: 'bg-amber-500/10 text-amber-400',  badge: 'text-amber-400' },
    red:   { icon: 'bg-red-500/10 text-red-400',      badge: 'text-red-400' },
  }
  const c = colors[color]
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', c.icon)}>
            <Icon size={17} />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-0.5">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
            {trend && (
              <div className={cn('flex items-center justify-end gap-1 text-2xs mt-1', trend.value >= 0 ? 'text-green-500' : 'text-red-500')}>
                {trend.value >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(trend.value)}% {trend.label}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function PresenceHeatmap({ data }: { data: ReturnType<typeof genHeatmap> }) {
  const max = Math.max(...data.map(d => d.value))
  const days  = ['Mon','Tue','Wed','Thu','Fri']
  const hours = Array.from(new Set(data.map(d => d.hour)))

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[420px]">
        {/* Hour headers */}
        <div className="flex gap-1 mb-1 ml-10">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-2xs text-muted-foreground">{h}</div>
          ))}
        </div>
        {/* Rows */}
        {days.map(day => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-9 text-2xs text-muted-foreground text-right pr-2 shrink-0">{day}</div>
            {hours.map(hour => {
              const cell = data.find(d => d.day === day && d.hour === hour)
              const intensity = cell ? cell.value / max : 0
              return (
                <div
                  key={hour}
                  className="flex-1 h-6 rounded-sm transition-colors"
                  style={{ backgroundColor: `rgba(13,148,136,${0.08 + intensity * 0.85})` }}
                  title={`${day} ${hour}: ${cell?.value ?? 0} present`}
                />
              )
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-2xs text-muted-foreground">Low</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
              <div key={v} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `rgba(13,148,136,${0.08 + v * 0.85})` }} />
            ))}
          </div>
          <span className="text-2xs text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  )
}

// ─── Top Performers bar ───────────────────────────────────────────────────────

function TopPerformersChart({ data }: { data: typeof TOP_PERFORMERS }) {
  return (
    <div className="space-y-2">
      {data.map((p, i) => (
        <div key={p.userId} className="flex items-center gap-3">
          <span className="text-2xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
          <span className="text-xs text-foreground w-28 truncate shrink-0">{p.fullName}</span>
          <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all"
              style={{
                width: `${p.rate}%`,
                backgroundColor: p.rate >= 90 ? '#10b981' : p.rate >= 75 ? '#0d9488' : p.rate >= 60 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span className={cn('text-xs font-mono w-10 text-right shrink-0',
            p.rate >= 90 ? 'text-emerald-500' : p.rate >= 75 ? 'text-teal-500' : p.rate >= 60 ? 'text-amber-500' : 'text-red-500'
          )}>{p.rate}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── Summary table ────────────────────────────────────────────────────────────

function SummaryTable({ period, days }: { period: Period; days: number }) {
  const rows = [
    { label: 'Total Working Days',     value: Math.min(days, 22),   unit: 'days' },
    { label: 'Avg Attendance Rate',    value: '83.4',               unit: '%' },
    { label: 'Total Present Days',     value: Math.round(days * 0.83 * 6), unit: 'person-days' },
    { label: 'Total Absent Days',      value: Math.round(days * 0.17 * 6), unit: 'person-days' },
    { label: 'Total Late Arrivals',    value: Math.round(days * 0.8),      unit: 'occurrences' },
    { label: 'Avg Daily Duration',     value: '7.4',                unit: 'hrs' },
    { label: 'Dept Size',              value: 10,                   unit: 'members' },
  ]
  return (
    <div className="divide-y divide-border">
      {rows.map(({ label, value, unit }) => (
        <div key={label} className="flex items-center justify-between py-2.5 px-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-semibold tabular-nums">
            {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod]     = useState<Period>('month')
  const [userFilter, setUserFilter] = useState('all')

  const days = PERIOD_DAYS[period]

  const { data: rateData    = [] } = useQuery({ queryKey: ['analytics-rate',     period], queryFn: async () => genDailyRate(Math.min(days, 60))    })
  const { data: lateData    = [] } = useQuery({ queryKey: ['analytics-late',     period], queryFn: async () => genLateArrival(Math.min(days, 60))  })
  const { data: durationData= [] } = useQuery({ queryKey: ['analytics-duration', period], queryFn: async () => genDuration(Math.min(days, 60))     })
  const { data: heatmapData = [] } = useQuery({ queryKey: ['analytics-heatmap'],           queryFn: async () => genHeatmap()                        })

  const avgRate     = useMemo(() => rateData.length ? +(rateData.reduce((a,d) => a + d.rate, 0) / rateData.length).toFixed(1) : 0, [rateData])
  const avgDuration = useMemo(() => durationData.length ? +(durationData.reduce((a,d) => a + d.hours, 0) / durationData.length).toFixed(1) : 0, [durationData])
  const totalLate   = useMemo(() => lateData.reduce((a,d) => a + d.count, 0), [lateData])

  // Thin out x-axis labels for readability
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : days <= 90 ? 9 : 29

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        subtitle="Department attendance insights and trends"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download size={13} /> Export Report
          </Button>
        }
      />

      {/* ── Controls ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={period} onValueChange={v => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="3months">3 Months</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-44 h-9 text-xs">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            {DEPT_USERS.map(u => (
              <SelectItem key={u.value} value={u.value} className="text-xs">{u.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {userFilter !== 'all' && (
          <Badge variant="secondary" className="gap-1.5">
            {DEPT_USERS.find(u => u.value === userFilter)?.label}
            <button onClick={() => setUserFilter('all')} className="hover:text-foreground transition-colors">×</button>
          </Badge>
        )}
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Avg Attendance Rate" value={avgRate}     unit="%"  icon={CalendarCheck} color="teal"  trend={{ value: 2.1,  label: 'vs prev period' }} />
        <KpiCard title="Avg Daily Duration"  value={avgDuration} unit="hrs" icon={Clock}         color="green" trend={{ value: 0.3,  label: 'vs prev period' }} />
        <KpiCard title="Total Late Arrivals" value={totalLate}              icon={AlertTriangle}  color="amber" trend={{ value: -1.5, label: 'vs prev period' }} />
        <KpiCard title="Dept Size"           value={10}          unit="members" icon={Users}     color="teal" />
      </div>

      {/* ── Charts row 1: Attendance Rate + Heatmap ── */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Attendance Rate Over Time</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {userFilter === 'all' ? 'Department average' : DEPT_USERS.find(u=>u.value===userFilter)?.label} · % present per day
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-teal-600 border-teal-200 bg-teal-50">
                Avg {avgRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rateData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={tickInterval} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Presence Heatmap</CardTitle>
            <CardDescription className="text-xs mt-0.5">Peak activity by day & hour</CardDescription>
          </CardHeader>
          <CardContent>
            <PresenceHeatmap data={heatmapData} />
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row 2: Late Arrivals + Avg Duration ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Late Arrivals Trend</CardTitle>
            <CardDescription className="text-xs mt-0.5">Number of late arrivals per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={lateData} barSize={days <= 7 ? 20 : days <= 30 ? 8 : 4} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={tickInterval} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit=" late" />} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {lateData.map((entry, i) => (
                    <Cell key={i} fill={entry.count >= 5 ? '#ef4444' : entry.count >= 3 ? '#f59e0b' : '#0d9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Duration Trend</CardTitle>
            <CardDescription className="text-xs mt-0.5">Average hours present per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={durationData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={tickInterval} />
                <YAxis domain={[4, 10]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}h`} />
                <Tooltip content={<ChartTooltip unit="h" />} />
                <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={2} fill="url(#durationGrad)" dot={false} activeDot={{ r: 4, fill: '#0d9488' }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row: Top Performers + Summary ── */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Performers</CardTitle>
            <CardDescription className="text-xs mt-0.5">Attendance rate per team member · {period === 'today' ? 'today' : `last ${period}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <TopPerformersChart data={TOP_PERFORMERS} />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Summary</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {period === 'today' ? "Today's stats" : period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : period === '3months' ? 'Last 90 days' : 'Last 365 days'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <SummaryTable period={period} days={days} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}