import { useState, useMemo } from 'react'
import {
  UserX, CheckCheck, Camera, Clock, Eye,
  AlertTriangle, Send, Filter, LayoutGrid, List,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from '@/components/PageHeader'
import { cn, relativeTime, formatTime, formatDate } from '@/lib/utils'
import { toast } from '@/stores/uiStore'
import type { UnknownFaceModel } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FACES: UnknownFaceModel[] = [
  { faceId:'uf-01', cameraId:'cam-01', cameraName:'Main Entrance',    capturedAt: new Date(Date.now()-9*60000).toISOString(),          imageUrl:'', reviewStatus:'pending'  },
  { faceId:'uf-02', cameraId:'cam-05', cameraName:'Cafeteria',        capturedAt: new Date(Date.now()-25*60000).toISOString(),         imageUrl:'', reviewStatus:'pending'  },
  { faceId:'uf-03', cameraId:'cam-02', cameraName:'Floor 2 Corridor', capturedAt: new Date(Date.now()-1.5*3600000).toISOString(),      imageUrl:'', reviewStatus:'pending'  },
  { faceId:'uf-04', cameraId:'cam-01', cameraName:'Main Entrance',    capturedAt: new Date(Date.now()-3*3600000).toISOString(),        imageUrl:'', reviewStatus:'reviewed', reviewedAt: new Date(Date.now()-2.5*3600000).toISOString() },
  { faceId:'uf-05', cameraId:'cam-07', cameraName:'Meeting Room A',   capturedAt: new Date(Date.now()-5*3600000).toISOString(),        imageUrl:'', reviewStatus:'reviewed', reviewedAt: new Date(Date.now()-4*3600000).toISOString() },
  { faceId:'uf-06', cameraId:'cam-03', cameraName:'Parking Entry',    capturedAt: new Date(Date.now()-6*3600000).toISOString(),        imageUrl:'', reviewStatus:'pending'  },
  { faceId:'uf-07', cameraId:'cam-01', cameraName:'Main Entrance',    capturedAt: new Date(Date.now()-8*3600000).toISOString(),        imageUrl:'', reviewStatus:'reviewed', reviewedAt: new Date(Date.now()-7*3600000).toISOString() },
  { faceId:'uf-08', cameraId:'cam-05', cameraName:'Cafeteria',        capturedAt: new Date(Date.now()-26*3600000).toISOString(),       imageUrl:'', reviewStatus:'pending'  },
  { faceId:'uf-09', cameraId:'cam-02', cameraName:'Floor 2 Corridor', capturedAt: new Date(Date.now()-27*3600000).toISOString(),       imageUrl:'', reviewStatus:'reviewed', reviewedAt: new Date(Date.now()-26*3600000).toISOString() },
  { faceId:'uf-10', cameraId:'cam-06', cameraName:'Stairwell B',      capturedAt: new Date(Date.now()-28*3600000).toISOString(),       imageUrl:'', reviewStatus:'pending'  },
]

// Deterministic "face image" placeholder using canvas seed
function FacePlaceholder({ faceId, size = 80 }: { faceId: string; size?: number }) {
  const seed  = faceId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue   = (seed * 47) % 360
  const style = { width: size, height: size }
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
      style={{ ...style, background: `linear-gradient(135deg, hsl(${hue},30%,20%), hsl(${hue},40%,30%))` }}
    >
      <UserX size={size * 0.35} style={{ color: `hsl(${hue},60%,70%)`, opacity: 0.7 }} />
    </div>
  )
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function FaceDetailDrawer({
  face,
  onClose,
  onMarkReviewed,
  onReport,
}: {
  face: UnknownFaceModel
  onClose: () => void
  onMarkReviewed: (id: string) => void
  onReport: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-96 h-full bg-background border-l shadow-2xl flex flex-col animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="text-sm font-semibold">Unknown Face Detail</p>
            <p className="text-xs text-muted-foreground mt-0.5">{face.faceId}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
        </div>

        <ScrollArea className="flex-1 p-5">
          <div className="space-y-5">
            {/* Large face image */}
            <div className="flex justify-center">
              <FacePlaceholder faceId={face.faceId} size={160} />
            </div>

            {/* Status */}
            <div className="flex justify-center">
              <Badge
                className={cn(
                  face.reviewStatus === 'reviewed'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/10'
                    : 'bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10',
                  'border text-xs gap-1.5 px-3 py-1'
                )}
              >
                {face.reviewStatus === 'reviewed' ? <><Eye size={11} /> Reviewed</> : <><AlertTriangle size={11} /> Pending Review</>}
              </Badge>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              {[
                { label: 'Camera',      value: face.cameraName, icon: Camera },
                { label: 'Detected',    value: `${formatDate(face.capturedAt)} at ${formatTime(face.capturedAt)}`, icon: Clock },
                { label: 'Relative',    value: relativeTime(face.capturedAt), icon: Clock },
                ...(face.reviewedAt ? [{ label: 'Reviewed at', value: formatTime(face.reviewedAt), icon: Eye }] : []),
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              {face.reviewStatus === 'pending' && (
                <Button
                  className="w-full gap-1.5 bg-brand-600 hover:bg-brand-700 text-white"
                  onClick={() => onMarkReviewed(face.faceId)}
                >
                  <Eye size={14} /> Mark as Reviewed
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => onReport(face.faceId)}
              >
                <Send size={14} /> Report to Super Admin
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 leading-relaxed">
              Only Super Admins can register unknown persons as new users. Use "Report to Super Admin" to flag this person for identity registration.
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Face card (grid view) ────────────────────────────────────────────────────

function FaceCard({
  face,
  selected,
  onClick,
  onMarkReviewed,
  onReport,
}: {
  face: UnknownFaceModel
  selected: boolean
  onClick: () => void
  onMarkReviewed: (id: string) => void
  onReport: (id: string) => void
}) {
  const isPending = face.reviewStatus === 'pending'
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-brand-400',
        isPending && 'border-amber-200',
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Face image + status dot */}
        <div className="relative flex justify-center">
          <FacePlaceholder faceId={face.faceId} size={96} />
          <span className={cn(
            'absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-background',
            isPending ? 'bg-amber-400' : 'bg-emerald-400',
          )} />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <Badge
            variant="outline"
            className={cn(
              'text-2xs',
              isPending ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50',
            )}
          >
            {isPending ? 'Pending' : 'Reviewed'}
          </Badge>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Camera size={10} />
            <span className="truncate">{face.cameraName}</span>
          </div>
          <p className="text-xs text-muted-foreground">{relativeTime(face.capturedAt)}</p>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          {isPending && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-2xs gap-1 text-brand-600 border-brand-200 hover:bg-brand-50"
              onClick={() => onMarkReviewed(face.faceId)}
            >
              <Eye size={10} /> Review
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-2xs gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={() => onReport(face.faceId)}
          >
            <Send size={10} /> Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Face row (list view) ─────────────────────────────────────────────────────

function FaceRow({
  face,
  selected,
  onClick,
  onMarkReviewed,
  onReport,
}: {
  face: UnknownFaceModel
  selected: boolean
  onClick: () => void
  onMarkReviewed: (id: string) => void
  onReport: (id: string) => void
}) {
  const isPending = face.reviewStatus === 'pending'
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50',
        selected && 'ring-2 ring-brand-400',
        isPending ? 'border-amber-200/50' : 'border-border',
      )}
    >
      <FacePlaceholder faceId={face.faceId} size={44} />

      <div className="flex-1 min-w-0 grid grid-cols-3 gap-4 items-center">
        <div>
          <Badge
            variant="outline"
            className={cn(
              'text-2xs mb-1',
              isPending ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50',
            )}
          >
            {isPending ? '⚠ Pending' : '✓ Reviewed'}
          </Badge>
          <p className="text-xs text-muted-foreground font-mono">{face.faceId}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Camera size={12} className="shrink-0" />
          <span className="truncate">{face.cameraName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={12} className="shrink-0" />
          <span>{relativeTime(face.capturedAt)}</span>
        </div>
      </div>

      <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        {isPending && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-brand-600 border-brand-200 hover:bg-brand-50" onClick={() => onMarkReviewed(face.faceId)}>
            <Eye size={12} /> Review
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => onReport(face.faceId)}>
          <Send size={12} /> Report
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'reviewed'
type ViewMode     = 'grid' | 'list'

export default function UnknownFacesPage() {
  const qc = useQueryClient()
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('all')
  const [cameraFilter,  setCameraFilter]  = useState('all')
  const [search,        setSearch]        = useState('')
  const [viewMode,      setViewMode]      = useState<ViewMode>('grid')
  const [selectedFace,  setSelectedFace]  = useState<UnknownFaceModel | null>(null)
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set())

  const { data: faces = [] } = useQuery({
    queryKey: ['unknown-faces'],
    queryFn:  async () => MOCK_FACES,
  })

  const cameras = useMemo(() => ['all', ...Array.from(new Set(faces.map(f => f.cameraName)))], [faces])

  const filtered = useMemo(() => faces.filter(f => {
    const matchStatus = statusFilter === 'all' || f.reviewStatus === statusFilter
    const matchCam    = cameraFilter === 'all'  || f.cameraName === cameraFilter
    const matchSearch = !search || f.cameraName.toLowerCase().includes(search.toLowerCase()) || f.faceId.includes(search)
    return matchStatus && matchCam && matchSearch
  }), [faces, statusFilter, cameraFilter, search])

  const pendingCount  = faces.filter(f => f.reviewStatus === 'pending').length
  const reviewedCount = faces.filter(f => f.reviewStatus === 'reviewed').length

  const markReviewed = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 500))
      return id
    },
    onSuccess: (id) => {
      qc.setQueryData<UnknownFaceModel[]>(['unknown-faces'], old =>
        old?.map(f => f.faceId === id ? { ...f, reviewStatus: 'reviewed', reviewedAt: new Date().toISOString() } : f) ?? []
      )
      setSelectedFace(prev => prev?.faceId === id ? { ...prev, reviewStatus: 'reviewed', reviewedAt: new Date().toISOString() } : prev)
      toast('Marked as reviewed', 'success')
    },
  })

  const bulkReview = useMutation({
    mutationFn: async (ids: string[]) => {
      await new Promise(r => setTimeout(r, 600))
      return ids
    },
    onSuccess: (ids) => {
      qc.setQueryData<UnknownFaceModel[]>(['unknown-faces'], old =>
        old?.map(f => ids.includes(f.faceId) ? { ...f, reviewStatus: 'reviewed', reviewedAt: new Date().toISOString() } : f) ?? []
      )
      setSelectedIds(new Set())
      toast(`${ids.length} faces marked as reviewed`, 'success')
    },
  })

  function handleReport(id: string) {
    toast(`Reported face ${id} to Super Admin`, 'info')
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Unknown Faces"
        subtitle="Unrecognised persons detected in department cameras"
        actions={
          selectedIds.size > 0 ? (
            <Button
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs"
              onClick={() => bulkReview.mutate(Array.from(selectedIds))}
              disabled={bulkReview.isPending}
            >
              <CheckCheck size={13} />
              Review Selected ({selectedIds.size})
            </Button>
          ) : undefined
        }
      />

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Detected', value: faces.length,   color: 'text-foreground',   bg: '' },
          { label: 'Pending Review', value: pendingCount,   color: 'text-amber-600',     bg: 'bg-amber-50 border-amber-200' },
          { label: 'Reviewed',       value: reviewedCount,  color: 'text-emerald-600',   bg: 'bg-emerald-50 border-emerald-200' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className={cn(bg)}>
            <CardContent className="p-4 flex items-center gap-3">
              <UserX size={20} className={cn(color, 'opacity-70')} />
              <div>
                <p className={cn('text-xl font-semibold', color)}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters + View toggle ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search by camera or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56 h-8 text-xs"
        />

        {/* Status filter */}
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {(['all', 'pending', 'reviewed'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {s}
              {s === 'pending'  && pendingCount  > 0 && <span className="ml-1.5 bg-amber-100 text-amber-700 text-2xs px-1.5 rounded-full">{pendingCount}</span>}
              {s === 'reviewed' && reviewedCount > 0 && <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-2xs px-1.5 rounded-full">{reviewedCount}</span>}
            </button>
          ))}
        </div>

        {/* Camera filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-muted-foreground" />
          <select
            value={cameraFilter}
            onChange={e => setCameraFilter(e.target.value)}
            className="h-8 text-xs border border-border rounded-lg px-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {cameras.map(c => <option key={c} value={c}>{c === 'all' ? 'All Cameras' : c}</option>)}
          </select>
        </div>

        {/* View mode */}
        <div className="ml-auto flex rounded-lg border border-border overflow-hidden text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('px-3 py-1.5 transition-colors', viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-muted')}
          >
            <LayoutGrid size={13} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('px-3 py-1.5 transition-colors', viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-muted-foreground hover:bg-muted')}
          >
            <List size={13} />
          </button>
        </div>

        <span className="text-xs text-muted-foreground">{filtered.length} results</span>
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <UserX size={36} className="text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">No unknown faces match your filters</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(face => (
            <FaceCard
              key={face.faceId}
              face={face}
              selected={selectedFace?.faceId === face.faceId}
              onClick={() => setSelectedFace(f => f?.faceId === face.faceId ? null : face)}
              onMarkReviewed={id => markReviewed.mutate(id)}
              onReport={handleReport}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(face => (
            <FaceRow
              key={face.faceId}
              face={face}
              selected={selectedFace?.faceId === face.faceId}
              onClick={() => setSelectedFace(f => f?.faceId === face.faceId ? null : face)}
              onMarkReviewed={id => markReviewed.mutate(id)}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* ── Detail drawer ── */}
      {selectedFace && (
        <FaceDetailDrawer
          face={selectedFace}
          onClose={() => setSelectedFace(null)}
          onMarkReviewed={id => markReviewed.mutate(id)}
          onReport={handleReport}
        />
      )}
    </div>
  )
}