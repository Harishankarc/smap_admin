import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Download, ArrowRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay } from 'date-fns'

import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { userDetailPath } from '@/constants/routes'
import { formatTime, formatDuration, getInitials, todayISO } from '@/lib/utils'
import { mockTodayAttendance } from '@/lib/mockData'
import type { UserAttendanceToday, AttendanceStatus } from '@/types'

// ── Tab helpers ──────────────────────────────────────────────────────────────

type Tab = 'daily' | 'calendar' | 'logs'

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present:    'bg-green-500',
  absent:     'bg-red-400',
  late:       'bg-amber-400',
  early_exit: 'bg-orange-400',
  on_leave:   'bg-sky-400',
}

// ── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<UserAttendanceToday>()

function useColumns(navigate: ReturnType<typeof useNavigate>) {
  return [
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
            <span className="font-medium">{u.fullName}</span>
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
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(userDetailPath(row.original.userId)) }}
          className="btn-ghost text-xs py-1 px-2 gap-1"
        >
          Full Logs <ArrowRight size={11} />
        </button>
      ),
    }),
  ]
}

// ── Daily Tab ────────────────────────────────────────────────────────────────

function DailyTab() {
  const navigate = useNavigate()
  const columns = useColumns(navigate)
  const [date, setDate] = useState(todayISO())

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['attendance-daily', date],
    queryFn: async () => mockTodayAttendance,
  })

  const summary = rows.reduce(
    (acc, r) => {
      if (r.status === 'present' || r.status === 'early_exit') acc.present++
      else if (r.status === 'absent') acc.absent++
      else if (r.status === 'late') acc.late++
      return acc
    },
    { present: 0, absent: 0, late: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-base w-40 h-8 text-xs"
          />
          {/* Summary chips */}
          <div className="flex items-center gap-2">
            {[
              { label: 'Present', value: summary.present, bg: 'bg-green-50 text-green-700 ring-green-200' },
              { label: 'Absent',  value: summary.absent,  bg: 'bg-red-50 text-red-700 ring-red-200' },
              { label: 'Late',    value: summary.late,    bg: 'bg-amber-50 text-amber-700 ring-amber-200' },
            ].map(({ label, value, bg }) => (
              <span key={label} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ring-1 ${bg}`}>
                {value} {label}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-secondary text-xs gap-1.5">
          <Download size={12} /> Export CSV
        </button>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        loading={isLoading}
        emptyMessage="No attendance data for this date."
        onRowClick={(row) => navigate(userDetailPath(row.userId))}
      />
    </div>
  )
}

// ── Calendar Tab ─────────────────────────────────────────────────────────────

// Generate mock calendar dots per day
function makeMockCalendar(year: number, month: number) {
  const daysInMonth = getDaysInMonth(new Date(year, month))
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'late', 'absent', 'early_exit', 'on_leave']
    return {
      day: d,
      users: mockTodayAttendance.map((u) => ({
        userId: u.userId,
        status: statuses[Math.floor(Math.random() * (d % 2 === 0 ? 3 : statuses.length))] as AttendanceStatus,
      })),
    }
  })
}

function CalendarTab() {
  const navigate = useNavigate()
  const columns = useColumns(navigate)
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const calDays = makeMockCalendar(year, month)
  const firstDow = getDay(startOfMonth(viewDate)) // 0=Sun

  const selectedData = calDays.find((d) => d.day === selectedDay)

  // Map to UserAttendanceToday shape for the table
  const selectedRows: UserAttendanceToday[] = selectedData?.users.map((u) => {
    const orig = mockTodayAttendance.find((x) => x.userId === u.userId)!
    return { ...orig, status: u.status }
  }) ?? []

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Left: calendar grid */}
      <div className="col-span-2">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="btn-ghost p-1.5">
            <ChevronLeft size={15} />
          </button>
          <p className="text-sm font-semibold text-text-primary">
            {format(viewDate, 'MMMM yyyy')}
          </p>
          <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="btn-ghost p-1.5">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-2xs font-semibold text-text-secondary py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {calDays.map(({ day, users }) => {
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
            const isSelected = day === selectedDay
            const dots = users.slice(0, 8)
            const extra = users.length - 8

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`rounded-lg p-1.5 text-left transition-all ${
                  isSelected
                    ? 'bg-brand-600 ring-2 ring-brand-400'
                    : isToday
                    ? 'bg-brand-50 ring-1 ring-brand-200'
                    : 'hover:bg-bg'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : isToday ? 'text-brand-600' : 'text-text-primary'}`}>
                  {day}
                </p>
                <div className="flex flex-wrap gap-0.5">
                  {dots.map((u) => (
                    <span key={u.userId} className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[u.status]}`} />
                  ))}
                  {extra > 0 && <span className="text-2xs text-text-secondary">+{extra}</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(STATUS_DOT).map(([status, bg]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${bg}`} />
              <span className="text-2xs text-text-secondary capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: day detail table */}
      <div className="col-span-3">
        <div className="mb-4">
          <p className="text-sm font-semibold text-text-primary">
            {format(new Date(year, month, selectedDay), 'EEEE, MMM d')}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{selectedRows.length} records</p>
        </div>
        <DataTable
          data={selectedRows}
          columns={columns}
          showPagination={false}
          emptyMessage="No data for this day."
          onRowClick={(row) => navigate(userDetailPath(row.userId))}
        />
      </div>
    </div>
  )
}

// ── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const navigate = useNavigate()
  const [userFilter, setUserFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'exit'>('all')
  const [dateFrom, setDateFrom] = useState(todayISO())
  const [dateTo, setDateTo]     = useState(todayISO())

  // Generate mock log rows from today's data
  const logs = mockTodayAttendance.flatMap((u) => {
    const rows = []
    if (u.entryTime) rows.push({ ...u, _type: 'entry' as const, _time: u.entryTime })
    if (u.exitTime)  rows.push({ ...u, _type: 'exit'  as const, _time: u.exitTime  })
    return rows
  })

  const filtered = logs.filter((l) => {
    const matchUser = userFilter === 'all' || l.userId === userFilter
    const matchType = typeFilter === 'all' || l._type === typeFilter
    return matchUser && matchType
  })

  const logColumns = [
    col.display({
      id: 'type',
      header: 'Event',
      cell: ({ row }) => {
        const r = row.original as typeof filtered[0]
        return (
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              r._type === 'entry' ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-700'
            }`}>
              {r._type === 'entry' ? '↓' : '↑'}
            </span>
            <span className="capitalize font-medium">{r._type}</span>
          </div>
        )
      },
    }),
    col.display({
      id: 'user',
      header: 'Name',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
              {getInitials(u.fullName)}
            </div>
            <span>{u.fullName}</span>
          </div>
        )
      },
    }),
    col.display({
      id: 'time',
      header: 'Time',
      cell: ({ row }) => {
        const r = row.original as typeof filtered[0]
        return <span className="font-mono text-xs">{formatTime(r._time)}</span>
      },
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(userDetailPath(row.original.userId)) }}
          className="btn-ghost text-xs py-1 px-2"
        >
          View Profile
        </button>
      ),
    }),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* User filter */}
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="input-base w-44 h-8 text-xs"
        >
          <option value="all">All Users</option>
          {mockTodayAttendance.map((u) => (
            <option key={u.userId} value={u.userId}>{u.fullName}</option>
          ))}
        </select>

        {/* Type filter */}
        <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-xs">
          {(['all', 'entry', 'exit'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                typeFilter === v ? 'bg-brand-600 text-white' : 'text-text-secondary hover:bg-brand-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base w-36 h-8 text-xs" />
        <span className="text-text-secondary text-xs">to</span>
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="input-base w-36 h-8 text-xs" />

        <button className="btn-secondary text-xs gap-1.5 ml-auto">
          <Download size={12} /> Export
        </button>
      </div>

      <DataTable
        data={filtered as UserAttendanceToday[]}
        columns={logColumns}
        emptyMessage="No logs match your filters."
        onRowClick={(row) => navigate(userDetailPath(row.userId))}
      />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [tab, setTab] = useState<Tab>('daily')

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle="Department-wide attendance management"
        actions={
          <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-xs">
            {([
              ['daily',    'Daily View'],
              ['calendar', 'Calendar'],
              ['logs',     'Logs'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-4 py-2 font-medium transition-colors ${
                  tab === value
                    ? 'bg-brand-600 text-white'
                    : 'text-text-secondary hover:bg-brand-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="card p-6">
        {tab === 'daily'    && <DailyTab />}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'logs'     && <LogsTab />}
      </div>
    </div>
  )
}
