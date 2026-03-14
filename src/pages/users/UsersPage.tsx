import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { Info } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { useDebounce } from '@/hooks/useDebounce'
import { userDetailPath } from '@/constants/routes'
import { relativeTime, getInitials } from '@/lib/utils'
import { mockUsers } from '@/lib/mockData'
import { toast } from '@/stores/uiStore'
import type { UserModel } from '@/types'

const col = createColumnHelper<UserModel>()

export default function UsersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [faceFilter, setFaceFilter] = useState<'all' | 'registered' | 'unregyistered'>('all')
  const debouncedSearch = useDebounce(search)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => mockUsers,
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // In production: axiosInstance.patch(API.USER_STATUS(userId), { isActive })
      return { userId, isActive }
    },
    onSuccess: ({ userId, isActive }) => {
      qc.setQueryData<UserModel[]>(['users'], (old) =>
        old?.map((u) => u.userId === userId ? { ...u, isActive } : u) ?? []
      )
      toast(`User ${isActive ? 'activated' : 'deactivated'} successfully`, 'success')
    },
    onError: () => toast('Failed to update user status', 'error'),
  })

  const filtered = users.filter((u) => {
    const matchSearch = !debouncedSearch ||
      u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.userId.includes(debouncedSearch)
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive)
    const matchFace =
      faceFilter === 'all' ||
      (faceFilter === 'registered' && u.faceRegistered) ||
      (faceFilter === 'unregistered' && !u.faceRegistered)
    return matchSearch && matchStatus && matchFace
  })

  const columns = [
    col.display({
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
              {getInitials(u.fullName)}
            </div>
            <div>
              <p className="font-medium text-text-primary">{u.fullName}</p>
              <p className="text-2xs text-text-secondary">#{u.userId}</p>
            </div>
          </div>
        )
      },
    }),
    col.accessor('designation', { header: 'Designation' }),
    col.display({
      id: 'faceStatus',
      header: 'Face Status',
      cell: ({ row }) => row.original.faceRegistered
        ? <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">Registered</span>
        : <span className="text-xs font-medium text-text-secondary bg-bg px-2 py-0.5 rounded-full ring-1 ring-border">Not Registered</span>,
    }),
    col.display({
      id: 'todayStatus',
      header: "Today's Status",
      cell: ({ row }) => <StatusBadge status={row.original.todayStatus} />,
    }),
    col.accessor('lastSeen', {
      header: 'Last Seen',
      cell: (i) => i.getValue()
        ? <span className="text-text-secondary">{relativeTime(i.getValue()!)}</span>
        : <span className="text-text-secondary">—</span>,
    }),
    col.display({
      id: 'accountStatus',
      header: 'Account',
      cell: ({ row }) => {
        const u = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleStatus.mutate({ userId: u.userId, isActive: !u.isActive })
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-ring ${
              u.isActive ? 'bg-brand-600' : 'bg-border'
            }`}
            role="switch"
            aria-checked={u.isActive}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              u.isActive ? 'translate-x-4' : 'translate-x-1'
            }`} />
          </button>
        )
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
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="My Users"
        subtitle={`${users.length} members in your department`}
      />

      {/* Restrictions banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-brand-50 border-l-4 border-brand-400 text-sm text-text-secondary">
        <Info size={15} className="text-brand-500 mt-0.5 shrink-0" />
        <p>
          User accounts are managed by the Super Admin.{' '}
          <span className="font-medium text-text-primary">Contact your Super Admin</span> to add or remove users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base w-60 h-8 text-xs"
        />

        <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-xs">
          {(['all', 'active', 'inactive'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                statusFilter === v
                  ? 'bg-brand-600 text-white'
                  : 'text-text-secondary hover:bg-brand-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-xs">
          {([
            ['all', 'All Faces'],
            ['registered', 'Registered'],
            ['unregistered', 'Not Registered'],
          ] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFaceFilter(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                faceFilter === v
                  ? 'bg-brand-600 text-white'
                  : 'text-text-secondary hover:bg-brand-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-text-secondary">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="card p-1">
        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users match your filters."
          onRowClick={(row) => navigate(userDetailPath(row.userId))}
        />
      </div>
    </div>
  )
}
