//----------------------------1 classroom level--------------------------------------------

import { useState, useEffect, useRef } from 'react'
import {
  Camera, CameraOff, AlertTriangle, User, Clock,
  Activity, RefreshCw, Maximize2, Minimize2,
  LogIn, LogOut, Building2, UserX, Radio, X,
} from 'lucide-react'
import { cn, relativeTime, getInitials, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Types ────────────────────────────────────────────────────────────────────

type CameraStatus = 'online' | 'offline' | 'malfunction'
type EventType    = 'entry' | 'exit' | 'unknown'

interface RoomAttendee {
  userId: string
  fullName: string
  designation: string
  entryTime: string
  confidence: number
}

interface RoomEvent {
  eventId: string
  type: EventType
  userId?: string
  fullName?: string
  designation?: string
  timestamp: string
  confidence: number
  snapshot?: string
}

interface ClassroomCamera {
  cameraId: string
  name: string
  location: string
  status: CameraStatus
  malfunctionDetail?: string
  fps: number
  latencyMs: number
  resolution: string
  uptime: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CLASSROOM_CAMERA: ClassroomCamera = {
  cameraId: 'cam-cls-01',
  name: 'Classroom A — Front Camera',
  location: 'Block B, Room 204',
  status: 'online',
  fps: 30,
  latencyMs: 44,
  resolution: '1080p',
  uptime: 99.6,
}

const INITIAL_ATTENDEES: RoomAttendee[] = [
  { userId:'1',  fullName:'Aisha Nair',     designation:'Senior Engineer',   entryTime: new Date(Date.now()-90*60000).toISOString(), confidence:0.98 },
  { userId:'3',  fullName:'Priya Krishnan', designation:'Lead Designer',     entryTime: new Date(Date.now()-85*60000).toISOString(), confidence:0.96 },
  { userId:'7',  fullName:'Sneha Thomas',   designation:'UI Designer',       entryTime: new Date(Date.now()-80*60000).toISOString(), confidence:0.99 },
  { userId:'10', fullName:'Rahul Iyer',     designation:'Frontend Dev',      entryTime: new Date(Date.now()-75*60000).toISOString(), confidence:0.95 },
  { userId:'2',  fullName:'Rohan Mehta',    designation:'Engineer',          entryTime: new Date(Date.now()-70*60000).toISOString(), confidence:0.97 },
  { userId:'5',  fullName:'Deepa Pillai',   designation:'QA Engineer',       entryTime: new Date(Date.now()-60*60000).toISOString(), confidence:0.94 },
]

const INITIAL_EVENTS: RoomEvent[] = [
  { eventId:'ev1', type:'entry',   userId:'1',  fullName:'Aisha Nair',     designation:'Senior Engineer', timestamp: new Date(Date.now()-90*60000).toISOString(), confidence:0.98 },
  { eventId:'ev2', type:'entry',   userId:'3',  fullName:'Priya Krishnan', designation:'Lead Designer',   timestamp: new Date(Date.now()-85*60000).toISOString(), confidence:0.96 },
  { eventId:'ev3', type:'entry',   userId:'7',  fullName:'Sneha Thomas',   designation:'UI Designer',     timestamp: new Date(Date.now()-80*60000).toISOString(), confidence:0.99 },
  { eventId:'ev4', type:'entry',   userId:'10', fullName:'Rahul Iyer',     designation:'Frontend Dev',    timestamp: new Date(Date.now()-75*60000).toISOString(), confidence:0.95 },
  { eventId:'ev5', type:'entry',   userId:'2',  fullName:'Rohan Mehta',    designation:'Engineer',        timestamp: new Date(Date.now()-70*60000).toISOString(), confidence:0.97 },
  { eventId:'ev6', type:'unknown',                                                                         timestamp: new Date(Date.now()-65*60000).toISOString(), confidence:0.38 },
  { eventId:'ev7', type:'entry',   userId:'5',  fullName:'Deepa Pillai',   designation:'QA Engineer',     timestamp: new Date(Date.now()-60*60000).toISOString(), confidence:0.94 },
  { eventId:'ev8', type:'exit',    userId:'10', fullName:'Rahul Iyer',     designation:'Frontend Dev',    timestamp: new Date(Date.now()-30*60000).toISOString(), confidence:0.95 },
  { eventId:'ev9', type:'entry',   userId:'10', fullName:'Rahul Iyer',     designation:'Frontend Dev',    timestamp: new Date(Date.now()-20*60000).toISOString(), confidence:0.96 },
]

// ─── Camera Feed Canvas ───────────────────────────────────────────────────────

function CameraFeed({ camera, fullscreen }: { camera: ClassroomCamera; fullscreen?: boolean }) {
  const ref      = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (camera.status !== 'online') return
    const canvas = ref.current; if (!canvas) return
    const ctx    = canvas.getContext('2d'); if (!ctx) return

    function draw(t: number) {
      const w = canvas!.width, h = canvas!.height

      // Room background
      ctx!.fillStyle = 'hsl(210,20%,8%)'; ctx!.fillRect(0, 0, w, h)

      // Floor perspective lines
      ctx!.strokeStyle = 'rgba(255,255,255,0.03)'; ctx!.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        ctx!.beginPath(); ctx!.moveTo(w * 0.5, h * 0.35)
        ctx!.lineTo(i * (w / 7), h); ctx!.stroke()
      }

      // Simulated desks
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const dx = w * 0.15 + col * w * 0.28
          const dy = h * 0.48 + row * h * 0.22
          ctx!.fillStyle = 'rgba(255,255,255,0.04)'
          ctx!.fillRect(dx, dy, w * 0.22, h * 0.08)
        }
      }

      // Animated persons
      const persons = [
        { x: w*0.18, y: h*0.52 }, { x: w*0.42, y: h*0.50 }, { x: w*0.66, y: h*0.53 },
        { x: w*0.28, y: h*0.72 }, { x: w*0.52, y: h*0.70 }, { x: w*0.76, y: h*0.71 },
      ]
      persons.forEach((p, i) => {
        const px = p.x + Math.sin(t * 0.0003 + i) * 3
        const py = p.y + Math.cos(t * 0.0004 + i) * 2
        const g  = ctx!.createRadialGradient(px, py - 10, 2, px, py - 10, 22)
        g.addColorStop(0, 'hsla(160,60%,55%,0.55)'); g.addColorStop(1, 'transparent')
        ctx!.fillStyle = g; ctx!.fillRect(px - 22, py - 40, 44, 55)
        ctx!.strokeStyle = 'hsla(160,70%,55%,0.65)'; ctx!.lineWidth = 1.2
        ctx!.strokeRect(px - 14, py - 38, 28, 42)
        if (!fullscreen) return
        ctx!.fillStyle = 'hsla(160,70%,60%,0.85)'; ctx!.font = '9px monospace'
        const names = ['Aisha','Priya','Sneha','Rahul','Rohan','Deepa']
        ctx!.fillText(names[i] ?? 'Person', px - 12, py - 42)
      })

      // Scanlines
      ctx!.fillStyle = 'rgba(0,0,0,0.12)'
      for (let y = 0; y < h; y += 3) ctx!.fillRect(0, y, w, 1)

      // OSD
      const now = new Date().toLocaleTimeString()
      ctx!.fillStyle = 'rgba(0,0,0,0.55)'; ctx!.fillRect(4, 4, 94, 16)
      ctx!.fillStyle = 'rgba(0,255,150,0.9)'; ctx!.font = '9px monospace'
      ctx!.fillText(`⏺ REC  ${now}`, 8, 15)
      if (fullscreen) {
        ctx!.fillStyle = 'rgba(0,0,0,0.55)'; ctx!.fillRect(w - 54, 4, 50, 16)
        ctx!.fillStyle = 'rgba(0,255,150,0.7)'; ctx!.fillText(`${camera.fps}fps`, w - 50, 15)
      }

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [camera, fullscreen])

  if (camera.status !== 'online') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 gap-3">
        {camera.status === 'offline'
          ? <CameraOff size={40} className="text-red-500" />
          : <AlertTriangle size={40} className="text-amber-500" />}
        <p className={`text-sm font-mono ${camera.status === 'offline' ? 'text-red-400' : 'text-amber-400'}`}>
          {camera.status.toUpperCase()}
        </p>
        {camera.malfunctionDetail && (
          <p className="text-xs text-gray-500 text-center max-w-xs px-4">{camera.malfunctionDetail}</p>
        )}
      </div>
    )
  }
  return <canvas ref={ref} width={1280} height={720} className="w-full h-full object-cover" />
}

// ─── Event Icon ───────────────────────────────────────────────────────────────

function EventIcon({ type }: { type: EventType }) {
  if (type === 'entry')   return <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0"><LogIn  size={11} className="text-emerald-400" /></div>
  if (type === 'exit')    return <div className="w-6 h-6 rounded-full bg-sky-500/15    border border-sky-500/30    flex items-center justify-center shrink-0"><LogOut size={11} className="text-sky-400"     /></div>
  return                         <div className="w-6 h-6 rounded-full bg-red-500/15    border border-red-500/30    flex items-center justify-center shrink-0"><UserX  size={11} className="text-red-400"      /></div>
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveMonitorPage() {
  const [camera]      = useState<ClassroomCamera>(CLASSROOM_CAMERA)
  const [attendees, setAttendees] = useState<RoomAttendee[]>(INITIAL_ATTENDEES)
  const [events, setEvents]       = useState<RoomEvent[]>(INITIAL_EVENTS)
  const [fullscreen, setFullscreen] = useState(false)
  const [activeTab, setActiveTab]   = useState<'attendance' | 'log' | 'alerts'>('attendance')

  const unknownAlerts = events.filter(e => e.type === 'unknown')
  const unreadAlerts  = unknownAlerts.length

  // Simulate live events every ~10s
  useEffect(() => {
    const names = [
      { userId:'6', fullName:'Kiran Raj',   designation:'DevOps Engineer' },
      { userId:'4', fullName:'Arjun Sharma',designation:'Product Manager' },
    ]
    const timer = setInterval(() => {
      const roll = Math.random()

      // 15% chance unknown face
      if (roll < 0.15) {
        const ev: RoomEvent = {
          eventId: `ev-${Date.now()}`, type: 'unknown',
          timestamp: new Date().toISOString(), confidence: 0.3 + Math.random() * 0.2,
        }
        setEvents(prev => [ev, ...prev])
        return
      }

      // 35% chance someone exits
      if (roll < 0.50 && attendees.length > 2) {
        const leaving = attendees[Math.floor(Math.random() * attendees.length)]
        const ev: RoomEvent = {
          eventId: `ev-${Date.now()}`, type: 'exit',
          userId: leaving.userId, fullName: leaving.fullName,
          designation: leaving.designation,
          timestamp: new Date().toISOString(), confidence: 0.93 + Math.random() * 0.06,
        }
        setAttendees(prev => prev.filter(a => a.userId !== leaving.userId))
        setEvents(prev => [ev, ...prev])
        return
      }

      // Otherwise someone enters
      const person = names[Math.floor(Math.random() * names.length)]
      if (attendees.some(a => a.userId === person.userId)) return
      const newAttendee: RoomAttendee = { ...person, entryTime: new Date().toISOString(), confidence: 0.94 + Math.random() * 0.05 }
      const ev: RoomEvent = {
        eventId: `ev-${Date.now()}`, type: 'entry', ...person,
        timestamp: new Date().toISOString(), confidence: newAttendee.confidence,
      }
      setAttendees(prev => [...prev, newAttendee])
      setEvents(prev => [ev, ...prev])
    }, 10000)
    return () => clearInterval(timer)
  }, [attendees])

  // Esc exits fullscreen
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 bg-gray-950 text-white overflow-hidden">

      {/* ── Fullscreen overlay ── */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-gray-900/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold">{camera.name}</p>
                <p className="text-xs text-gray-400">{camera.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs font-mono">
              {[
                { l:'FPS',        v: String(camera.fps),        ok: camera.fps >= 24 },
                { l:'Latency',    v: `${camera.latencyMs}ms`,   ok: camera.latencyMs < 100 },
                { l:'Resolution', v: camera.resolution,          ok: true },
                { l:'Uptime',     v: `${camera.uptime}%`,        ok: camera.uptime > 95 },
              ].map(({ l, v, ok }) => (
                <div key={l} className="text-center">
                  <p className="text-gray-600 text-2xs uppercase">{l}</p>
                  <p className={ok ? 'text-emerald-400' : 'text-amber-400'}>{v}</p>
                </div>
              ))}
              <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)}
                className="w-8 h-8 text-gray-400 hover:text-white ml-2">
                <X size={16} />
              </Button>
            </div>
          </div>
          {/* Feed */}
          <div className="flex-1 overflow-hidden">
            <CameraFeed camera={camera} fullscreen />
          </div>
          {/* Bottom strip — live attendee count */}
          <div className="shrink-0 px-5 py-2.5 border-t border-white/10 bg-gray-900/80 backdrop-blur flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5"><User size={12} className="text-teal-400"/><span className="text-gray-300">{attendees.length} in room</span></div>
            {unreadAlerts > 0 && <div className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-400"/><span className="text-amber-400">{unreadAlerts} unknown alert{unreadAlerts > 1 ? 's' : ''}</span></div>}
            <span className="text-gray-600 ml-auto">Press Esc to exit</span>
          </div>
        </div>
      )}

      {/* ── Left: Camera feed ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Feed header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-gray-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-teal-400" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{camera.name}</p>
                <Badge className={cn(
                  'text-2xs gap-1 border',
                  camera.status === 'online'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                    : camera.status === 'malfunction'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/10'
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', camera.status === 'online' ? 'bg-emerald-400 animate-pulse' : camera.status === 'malfunction' ? 'bg-amber-400' : 'bg-red-400')} />
                  {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{camera.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Camera stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              {[
                { l:'FPS',     v: String(camera.fps),      ok: camera.fps >= 24 },
                { l:'Latency', v: `${camera.latencyMs}ms`, ok: camera.latencyMs < 100 },
                { l:'Uptime',  v: `${camera.uptime}%`,     ok: camera.uptime > 95 },
              ].map(({ l, v, ok }) => (
                <div key={l}>
                  <p className="text-gray-600 text-2xs">{l}</p>
                  <p className={ok ? 'text-emerald-400' : 'text-amber-400'}>{v}</p>
                </div>
              ))}
            </div>
            <Separator orientation="vertical" className="h-8 bg-white/10" />
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(true)}
              className="text-xs text-gray-400 hover:text-white gap-1.5">
              <Maximize2 size={13} /> Fullscreen
            </Button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 relative overflow-hidden bg-gray-950">
          <CameraFeed camera={camera} />

          {/* Overlay: person count bubble */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur rounded-lg px-3 py-1.5 border border-white/10">
              <User size={12} className="text-teal-400" />
              <span className="text-xs font-mono text-white">{attendees.length} in room</span>
            </div>
            {unreadAlerts > 0 && (
              <div className="flex items-center gap-2 bg-red-950/80 backdrop-blur rounded-lg px-3 py-1.5 border border-red-500/30 animate-pulse">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-xs font-mono text-red-400">{unreadAlerts} unknown</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera health bar */}
        <div className="shrink-0 flex items-center gap-6 px-5 py-2.5 border-t border-white/10 bg-gray-900/50 text-xs">
          <div className="flex items-center gap-1.5"><Building2 size={12} className="text-gray-500" /><span className="text-gray-400">{camera.location}</span></div>
          <div className="flex items-center gap-1.5"><Camera size={12} className="text-gray-500" /><span className="text-gray-400">{camera.resolution}</span></div>
          {camera.status === 'malfunction' && camera.malfunctionDetail && (
            <div className="flex items-center gap-1.5 text-amber-400"><AlertTriangle size={11} /><span>{camera.malfunctionDetail}</span></div>
          )}
          <span className="ml-auto text-gray-600 font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── Right: Panels ── */}
      <div className="w-80 shrink-0 border-l border-white/10 bg-gray-900 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0">
          {([
            ['attendance', `👥 In Room (${attendees.length})`],
            ['log',        '📋 Log'],
            ['alerts',     `🚨 Alerts${unreadAlerts > 0 ? ` (${unreadAlerts})` : ''}`],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 text-xs font-medium transition-colors relative whitespace-nowrap px-1',
                activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {label}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />}
            </button>
          ))}
        </div>

        {/* ── Attendance tab ── */}
        {activeTab === 'attendance' && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1.5">
              {attendees.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No one currently in the room</p>
                </div>
              ) : attendees.map(a => (
                <div key={a.userId} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-teal-900/60 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
                    {getInitials(a.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{a.fullName}</p>
                    <p className="text-2xs text-gray-500 truncate">{a.designation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xs text-gray-500">since</p>
                    <p className="text-2xs font-mono text-teal-400">{formatTime(a.entryTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* ── Log tab ── */}
        {activeTab === 'log' && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {events.map((ev, i) => (
                <div key={ev.eventId}>
                  <div className="flex items-start gap-2.5 py-2">
                    <EventIcon type={ev.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {ev.type === 'unknown' ? 'Unknown Person' : ev.fullName}
                      </p>
                      {ev.designation && <p className="text-2xs text-gray-500 truncate">{ev.designation}</p>}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-2xs font-medium capitalize', ev.type === 'entry' ? 'text-emerald-400' : ev.type === 'exit' ? 'text-sky-400' : 'text-red-400')}>
                          {ev.type}
                        </span>
                        <span className="text-2xs text-gray-600">{relativeTime(ev.timestamp)}</span>
                        <span className="text-2xs font-mono text-gray-600 ml-auto">{Math.round(ev.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  {i < events.length - 1 && <Separator className="bg-white/5" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* ── Alerts tab ── */}
        {activeTab === 'alerts' && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {unknownAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={24} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No unknown face alerts</p>
                </div>
              ) : unknownAlerts.map(ev => (
                <Card key={ev.eventId} className="bg-red-950/30 border-red-900/50 text-white">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-semibold text-red-300 flex items-center gap-2">
                      <UserX size={13} className="text-red-400" />
                      Unknown Face Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-red-900/40 border border-red-800/50 flex items-center justify-center">
                        <UserX size={18} className="text-red-400" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xs text-gray-500">Confidence</p>
                        <p className="text-xs font-mono text-amber-400">{Math.round(ev.confidence * 100)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-2xs text-gray-500">
                      <Clock size={9} />
                      <span>{formatTime(ev.timestamp)} · {relativeTime(ev.timestamp)}</span>
                    </div>
                    <Button size="sm" variant="outline"
                      className="w-full h-7 text-2xs border-red-800/50 text-red-400 hover:bg-red-900/30 hover:text-red-300 bg-transparent mt-1">
                      Report to Super Admin
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Bottom summary strip */}
        <div className="shrink-0 border-t border-white/10 px-4 py-3 bg-gray-900/80">
          <div className="flex items-center justify-between text-2xs text-gray-500">
            <div className="flex items-center gap-1.5"><User size={10} className="text-teal-400" />{attendees.length} present</div>
            <div className="flex items-center gap-1.5"><LogIn size={10} className="text-emerald-400" />{events.filter(e=>e.type==='entry').length} entries</div>
            <div className="flex items-center gap-1.5"><LogOut size={10} className="text-sky-400" />{events.filter(e=>e.type==='exit').length} exits</div>
            {unreadAlerts > 0 && <div className="flex items-center gap-1.5"><AlertTriangle size={10} className="text-red-400" />{unreadAlerts} alerts</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

//---------------------------building level--------------------------------------------------


// import { useState, useEffect, useRef } from 'react'
// import {
//   Camera, CameraOff, AlertTriangle, Search,
//   Maximize2, RefreshCw, MapPin, User, Clock,
//   ChevronRight, Activity, ZapOff, Thermometer, EyeOff,
//   X, ArrowLeft, Radio, WifiOff, Wifi,
// } from 'lucide-react'
// import { type LucideIcon } from 'lucide-react'
// import { relativeTime, getInitials } from '@/lib/utils'
// import { cn } from '@/lib/utils'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// type CameraStatus = 'online' | 'offline' | 'malfunction' | 'maintenance'
// type MalfunctionType = 'no_signal' | 'overheating' | 'obstructed' | 'hardware_fault' | 'network_lag'

// interface DetectedPerson {
//   userId: string; fullName: string; designation: string
//   detectedAt: string; confidence: number
// }
// interface FloorCamera {
//   cameraId: string; name: string; location: string; floor: number; zone: string
//   status: CameraStatus; malfunctionType?: MalfunctionType
//   malfunctionSince?: string; malfunctionDetail?: string; lastEventAt?: string
//   mapX: number; mapY: number; detectedPersons: DetectedPerson[]
//   fps: number; latencyMs: number; resolution: string; uptime: number
// }
// interface PersonLocation {
//   userId: string; fullName: string; designation: string
//   currentCameraId: string; currentCameraName: string; floor: number; zone: string
//   entryTime: string; trail: Array<{ cameraId: string; cameraName: string; time: string }>
// }

// const MOCK_PERSONS: DetectedPerson[] = [
//   { userId:'1', fullName:'Aisha Nair',     designation:'Senior Engineer', detectedAt: new Date(Date.now()-2*60000).toISOString(), confidence:0.98 },
//   { userId:'3', fullName:'Priya Krishnan', designation:'Lead Designer',   detectedAt: new Date(Date.now()-5*60000).toISOString(), confidence:0.96 },
//   { userId:'7', fullName:'Sneha Thomas',   designation:'UI Designer',     detectedAt: new Date(Date.now()-1*60000).toISOString(), confidence:0.99 },
//   { userId:'10',fullName:'Rahul Iyer',     designation:'Frontend Dev',    detectedAt: new Date(Date.now()-8*60000).toISOString(), confidence:0.95 },
//   { userId:'2', fullName:'Rohan Mehta',    designation:'Engineer',        detectedAt: new Date(Date.now()-3*60000).toISOString(), confidence:0.97 },
//   { userId:'5', fullName:'Deepa Pillai',   designation:'QA Engineer',     detectedAt: new Date(Date.now()-6*60000).toISOString(), confidence:0.94 },
// ]

// const INIT_CAMERAS: FloorCamera[] = [
//   { cameraId:'cam-01', name:'Main Entrance',    location:'Ground Floor Lobby',   floor:0,  zone:'Entrance',    status:'online',      mapX:50, mapY:88, fps:30, latencyMs:42,  resolution:'1080p', uptime:99.8, lastEventAt:new Date(Date.now()-2*60000).toISOString(),  detectedPersons:[MOCK_PERSONS[0],MOCK_PERSONS[4]] },
//   { cameraId:'cam-02', name:'Floor 2 Corridor', location:'2nd Floor East Wing',  floor:2,  zone:'Corridor',    status:'online',      mapX:72, mapY:40, fps:25, latencyMs:67,  resolution:'1080p', uptime:98.2, lastEventAt:new Date(Date.now()-5*60000).toISOString(),  detectedPersons:[MOCK_PERSONS[1]] },
//   { cameraId:'cam-03', name:'Parking Entry',    location:'Basement Parking',     floor:-1, zone:'Parking',     status:'malfunction', malfunctionType:'overheating', malfunctionSince:new Date(Date.now()-45*60000).toISOString(), malfunctionDetail:'CPU temperature exceeded 85°C. Auto-throttling active. Feed may be unstable.', mapX:25, mapY:95, fps:12, latencyMs:320, resolution:'720p',  uptime:87.4, detectedPersons:[] },
//   { cameraId:'cam-04', name:'Server Room',      location:'3rd Floor IT Zone',    floor:3,  zone:'Restricted',  status:'online',      mapX:80, mapY:20, fps:30, latencyMs:38,  resolution:'4K',    uptime:100,  lastEventAt:new Date(Date.now()-30*60000).toISOString(), detectedPersons:[] },
//   { cameraId:'cam-05', name:'Cafeteria',        location:'Ground Floor Canteen', floor:0,  zone:'Common Area', status:'online',      mapX:30, mapY:70, fps:30, latencyMs:55,  resolution:'1080p', uptime:99.1, lastEventAt:new Date(Date.now()-1*60000).toISOString(),  detectedPersons:[MOCK_PERSONS[2],MOCK_PERSONS[5]] },
//   { cameraId:'cam-06', name:'Stairwell B',      location:'1st Floor Stairwell',  floor:1,  zone:'Transit',     status:'offline',     malfunctionType:'no_signal',   malfunctionSince:new Date(Date.now()-3*3600000).toISOString(), malfunctionDetail:'No signal received since 09:45 AM. Network switch on Floor 1 may be the cause.', mapX:55, mapY:60, fps:0, latencyMs:0, resolution:'1080p', uptime:62.3, detectedPersons:[] },
//   { cameraId:'cam-07', name:'Meeting Room A',   location:'2nd Floor West Wing',  floor:2,  zone:'Meeting',     status:'online',      mapX:20, mapY:35, fps:30, latencyMs:49,  resolution:'1080p', uptime:99.5, lastEventAt:new Date(Date.now()-12*60000).toISOString(), detectedPersons:[MOCK_PERSONS[3]] },
//   { cameraId:'cam-08', name:'Rooftop Access',   location:'Rooftop Entry',        floor:4,  zone:'Restricted',  status:'maintenance', malfunctionType:'hardware_fault', malfunctionSince:new Date(Date.now()-24*3600000).toISOString(), malfunctionDetail:'Scheduled lens replacement. Expected back online by 6:00 PM today.', mapX:60, mapY:10, fps:0, latencyMs:0, resolution:'4K', uptime:94.7, detectedPersons:[] },
// ]

// const PERSON_TRAILS: PersonLocation[] = [
//   { userId:'1', fullName:'Aisha Nair', designation:'Senior Engineer', currentCameraId:'cam-01', currentCameraName:'Main Entrance', floor:0, zone:'Entrance', entryTime:new Date(Date.now()-4*3600000).toISOString(), trail:[{cameraId:'cam-01',cameraName:'Main Entrance',time:new Date(Date.now()-4*3600000).toISOString()},{cameraId:'cam-05',cameraName:'Cafeteria',time:new Date(Date.now()-3*3600000).toISOString()},{cameraId:'cam-02',cameraName:'Floor 2 Corridor',time:new Date(Date.now()-2*3600000).toISOString()},{cameraId:'cam-01',cameraName:'Main Entrance',time:new Date(Date.now()-2*60000).toISOString()}] },
//   { userId:'3', fullName:'Priya Krishnan', designation:'Lead Designer', currentCameraId:'cam-02', currentCameraName:'Floor 2 Corridor', floor:2, zone:'Corridor', entryTime:new Date(Date.now()-3*3600000).toISOString(), trail:[{cameraId:'cam-01',cameraName:'Main Entrance',time:new Date(Date.now()-3*3600000).toISOString()},{cameraId:'cam-02',cameraName:'Floor 2 Corridor',time:new Date(Date.now()-5*60000).toISOString()}] },
//   { userId:'7', fullName:'Sneha Thomas', designation:'UI Designer', currentCameraId:'cam-05', currentCameraName:'Cafeteria', floor:0, zone:'Common Area', entryTime:new Date(Date.now()-5*3600000).toISOString(), trail:[{cameraId:'cam-01',cameraName:'Main Entrance',time:new Date(Date.now()-5*3600000).toISOString()},{cameraId:'cam-07',cameraName:'Meeting Room A',time:new Date(Date.now()-2*3600000).toISOString()},{cameraId:'cam-05',cameraName:'Cafeteria',time:new Date(Date.now()-1*60000).toISOString()}] },
// ]

// const STATUS_CFG: Record<CameraStatus,{label:string;color:string;dot:string}> = {
//   online:      { label:'Online',      color:'text-emerald-400', dot:'bg-emerald-400' },
//   offline:     { label:'Offline',     color:'text-red-400',     dot:'bg-red-400'     },
//   malfunction: { label:'Malfunction', color:'text-amber-400',   dot:'bg-amber-400'   },
//   maintenance: { label:'Maintenance', color:'text-sky-400',     dot:'bg-sky-400'     },
// }

// const MALF_ICONS: Record<MalfunctionType, LucideIcon> = {
//   no_signal: WifiOff, overheating: Thermometer, obstructed: EyeOff, hardware_fault: ZapOff, network_lag: Wifi,
// }

// // ── Camera Feed Canvas ────────────────────────────────────────────────────────
// function CameraFeed({ camera, compact=false }: { camera:FloorCamera; compact?:boolean }) {
//   const ref = useRef<HTMLCanvasElement>(null)
//   const frameRef = useRef(0)
//   useEffect(() => {
//     if (camera.status !== 'online') return
//     const canvas = ref.current; if (!canvas) return
//     const ctx = canvas.getContext('2d'); if (!ctx) return
//     const seed = camera.cameraId.charCodeAt(camera.cameraId.length-1)
//     function draw(t: number) {
//       const w=canvas!.width, h=canvas!.height
//       ctx!.fillStyle=`hsl(${200+seed*3},20%,${8+seed%5}%)`; ctx!.fillRect(0,0,w,h)
//       ctx!.strokeStyle='rgba(255,255,255,0.04)'; ctx!.lineWidth=1
//       for(let i=0;i<6;i++){ctx!.beginPath();ctx!.moveTo(w*.5,h*.4);ctx!.lineTo(i*(w/5),h);ctx!.stroke()}
//       const blobs=(seed%3)+1
//       for(let b=0;b<blobs;b++){
//         const bx=(w*.2)+(b*w*.25)+Math.sin(t*.0003+b)*12, by=h*.55+Math.cos(t*.0004+b*2)*6
//         const g=ctx!.createRadialGradient(bx,by,2,bx,by-20,40)
//         g.addColorStop(0,`hsla(${160+seed*5},50%,60%,0.5)`); g.addColorStop(1,'transparent')
//         ctx!.fillStyle=g; ctx!.fillRect(bx-30,by-50,60,80)
//         ctx!.strokeStyle=`hsla(${160+seed*5},80%,60%,0.7)`; ctx!.lineWidth=1.5; ctx!.strokeRect(bx-18,by-48,36,56)
//         if(!compact){
//           ctx!.fillStyle=`hsla(${160+seed*5},80%,60%,0.9)`; ctx!.font='9px monospace'
//           ctx!.fillText(b<camera.detectedPersons.length?camera.detectedPersons[b].fullName.split(' ')[0]:'Unknown',bx-16,by-52)
//         }
//       }
//       ctx!.fillStyle='rgba(0,0,0,0.15)'
//       for(let y=0;y<h;y+=3) ctx!.fillRect(0,y,w,1)
//       if(!compact){
//         const now=new Date().toLocaleTimeString()
//         ctx!.fillStyle='rgba(0,0,0,0.5)'; ctx!.fillRect(4,4,90,16)
//         ctx!.fillStyle='rgba(0,255,150,0.9)'; ctx!.font='9px monospace'; ctx!.fillText(`REC ${now}`,8,15)
//         ctx!.fillStyle='rgba(0,0,0,0.5)'; ctx!.fillRect(w-50,4,46,16)
//         ctx!.fillStyle='rgba(0,255,150,0.7)'; ctx!.fillText(`${camera.fps}fps`,w-46,15)
//       }
//       frameRef.current=requestAnimationFrame(draw)
//     }
//     frameRef.current=requestAnimationFrame(draw)
//     return()=>cancelAnimationFrame(frameRef.current)
//   },[camera,compact])

//   if(camera.status!=='online') return (
//     <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 gap-2">
//       {camera.status==='offline'
//         ? <CameraOff size={compact?20:32} className="text-red-500"/>
//         : camera.status==='malfunction'
//         ? <AlertTriangle size={compact?20:32} className="text-amber-500"/>
//         : <RefreshCw size={compact?20:32} className="text-sky-500"/>}
//       {!compact && (
//         <p className={`text-xs font-mono ${camera.status==='offline'?'text-red-500':camera.status==='malfunction'?'text-amber-500':'text-sky-500'}`}>
//           {camera.status.toUpperCase()}
//         </p>
//       )}
//     </div>
//   )
//   return <canvas ref={ref} width={640} height={360} className="w-full h-full object-cover"/>
// }

// // ── Camera Card ───────────────────────────────────────────────────────────────
// function CameraCard({camera,isSelected,onClick,onFullscreen,trackedUserId}:{camera:FloorCamera;isSelected:boolean;onClick:()=>void;onFullscreen:()=>void;trackedUserId?:string}) {
//   const cfg = STATUS_CFG[camera.status]
//   const hasTracked = trackedUserId ? camera.detectedPersons.some(p=>p.userId===trackedUserId) : false
//   return (
//     <div
//       onClick={onClick}
//       className={cn(
//         'relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group border',
//         isSelected ? 'border-teal-500 ring-2 ring-teal-500/40'
//           : hasTracked ? 'border-amber-500/60 ring-1 ring-amber-500/30'
//           : 'border-white/10 hover:border-white/20'
//       )}
//     >
//       <div className="aspect-video bg-gray-950 relative overflow-hidden">
//         <CameraFeed camera={camera} compact/>
//         <div className="absolute top-2 left-2">
//           <span className={cn('w-2 h-2 rounded-full block', cfg.dot, camera.status==='online' && 'animate-pulse')}/>
//         </div>
//         {hasTracked && (
//           <Badge className="absolute top-2 right-2 bg-amber-500/90 text-black text-2xs gap-1 hover:bg-amber-500/90">
//             <MapPin size={8}/> TRACKED
//           </Badge>
//         )}
//         <Button
//           size="icon"
//           variant="ghost"
//           onClick={e=>{e.stopPropagation();onFullscreen()}}
//           className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded"
//         >
//           <Maximize2 size={11} className="text-white"/>
//         </Button>
//         {camera.detectedPersons.length > 0 && (
//           <div className="absolute bottom-2 left-2 bg-black/70 text-white text-2xs font-mono px-2 py-0.5 rounded flex items-center gap-1">
//             <User size={8}/>{camera.detectedPersons.length}
//           </div>
//         )}
//       </div>
//       <div className="bg-gray-900 px-3 py-2">
//         <p className="text-xs font-semibold text-white truncate">{camera.name}</p>
//         <div className="flex items-center justify-between mt-0.5">
//           <p className="text-2xs text-gray-500 truncate">{camera.location}</p>
//           <span className={cn('text-2xs font-medium', cfg.color)}>{cfg.label}</span>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Floor Map ─────────────────────────────────────────────────────────────────
// function FloorMap({cameras,selectedFloor,trackedUserId,onCameraClick}:{cameras:FloorCamera[];selectedFloor:number|'all';trackedUserId?:string;onCameraClick:(c:FloorCamera)=>void}) {
//   const shown = selectedFloor==='all' ? cameras : cameras.filter(c=>c.floor===selectedFloor)
//   return (
//     <TooltipProvider>
//       <div className="relative w-full bg-gray-950 rounded-xl border border-white/10 overflow-hidden" style={{paddingBottom:'56%'}}>
//         <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
//         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
//           <rect x="10" y="8" width="80" height="84" rx="1" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3"/>
//           <rect x="10" y="8" width="80" height="20" fill="rgba(14,116,144,0.05)"/>
//           <rect x="10" y="60" width="80" height="32" fill="rgba(5,150,105,0.05)"/>
//           <line x1="10" y1="28" x2="90" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3"/>
//           <line x1="10" y1="55" x2="90" y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3"/>
//           <line x1="50" y1="28" x2="50" y2="92" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" strokeDasharray="1,1"/>
//           <text x="13" y="14" fill="rgba(255,255,255,0.12)" fontSize="2.5" fontFamily="monospace">RESTRICTED ZONE</text>
//           <text x="13" y="50" fill="rgba(255,255,255,0.12)" fontSize="2.5" fontFamily="monospace">WORK AREA</text>
//           <text x="13" y="75" fill="rgba(255,255,255,0.12)" fontSize="2.5" fontFamily="monospace">COMMON AREA / ENTRANCE</text>
//         </svg>
//         {shown.map(cam=>{
//           const cfg = STATUS_CFG[cam.status]
//           const isTracked = trackedUserId ? cam.detectedPersons.some(p=>p.userId===trackedUserId) : false
//           return (
//             <Tooltip key={cam.cameraId}>
//               <TooltipTrigger asChild>
//                 <button
//                   onClick={()=>onCameraClick(cam)}
//                   className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
//                   style={{left:`${cam.mapX}%`,top:`${cam.mapY}%`}}
//                 >
//                   {isTracked && <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping"/>}
//                   <div className={cn(
//                     'w-6 h-6 rounded-full flex items-center justify-center border transition-all',
//                     isTracked ? 'bg-amber-500 border-amber-300 shadow-lg shadow-amber-500/40'
//                       : cam.status==='online' ? 'bg-emerald-500/20 border-emerald-400 hover:bg-emerald-500/40'
//                       : cam.status==='malfunction' ? 'bg-amber-500/20 border-amber-400'
//                       : 'bg-red-500/20 border-red-400'
//                   )}>
//                     <Camera size={10} className={isTracked ? 'text-black' : cfg.color}/>
//                   </div>
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent side="top" className="bg-gray-800 border-white/10 text-white">
//                 <p className="font-semibold text-xs">{cam.name}</p>
//                 <p className={cn('text-2xs', cfg.color)}>{cfg.label}</p>
//                 {cam.detectedPersons.length > 0 && (
//                   <p className="text-2xs text-gray-400">{cam.detectedPersons.length} detected</p>
//                 )}
//               </TooltipContent>
//             </Tooltip>
//           )
//         })}
//       </div>
//     </TooltipProvider>
//   )
// }

// // ── Person Tracker Panel ──────────────────────────────────────────────────────
// function PersonTrackerPanel({trails,trackedUserId,onTrack,onClear}:{trails:PersonLocation[];trackedUserId?:string;onTrack:(id:string)=>void;onClear:()=>void}) {
//   const tracked = trails.find(t=>t.userId===trackedUserId)
//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center justify-between mb-3">
//         <p className="text-xs font-semibold text-white uppercase tracking-wider">Person Tracker</p>
//         {trackedUserId && (
//           <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-2xs text-gray-500 hover:text-white px-2 gap-1">
//             <X size={10}/> Clear
//           </Button>
//         )}
//       </div>

//       <div className="space-y-1.5 mb-3">
//         {trails.map(person=>{
//           const isTracked = person.userId===trackedUserId
//           return (
//             <button
//               key={person.userId}
//               onClick={()=>isTracked ? onClear() : onTrack(person.userId)}
//               className={cn(
//                 'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all',
//                 isTracked ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
//                   : 'bg-white/5 border-white/10 hover:bg-white/10'
//               )}
//             >
//               <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-2xs font-bold shrink-0', isTracked ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300')}>
//                 {getInitials(person.fullName)}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-white truncate">{person.fullName}</p>
//                 <div className="flex items-center gap-1 mt-0.5">
//                   <MapPin size={8} className={isTracked ? 'text-amber-400' : 'text-gray-500'}/>
//                   <p className="text-2xs text-gray-500 truncate">{person.currentCameraName}</p>
//                 </div>
//               </div>
//               {isTracked && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"/>}
//             </button>
//           )
//         })}
//       </div>

//       {tracked && (
//         <ScrollArea className="flex-1">
//           <p className="text-2xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Movement Trail</p>
//           <div className="relative">
//             <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10"/>
//             <div className="space-y-2">
//               {[...tracked.trail].reverse().map((t,i)=>(
//                 <div key={i} className="flex items-start gap-3 relative">
//                   <div className={cn('w-5 h-5 rounded-full border flex items-center justify-center shrink-0 z-10', i===0 ? 'bg-amber-500 border-amber-300' : 'bg-gray-800 border-white/20')}>
//                     <Camera size={8} className={i===0 ? 'text-black' : 'text-gray-500'}/>
//                   </div>
//                   <div>
//                     <p className="text-xs text-white">{t.cameraName}</p>
//                     <p className="text-2xs text-gray-500">{relativeTime(t.time)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </ScrollArea>
//       )}
//       {!trackedUserId && <p className="text-2xs text-gray-600 text-center mt-4">Click a person above to track their movement</p>}
//     </div>
//   )
// }

// // ── Malfunction Panel ─────────────────────────────────────────────────────────
// function MalfunctionPanel({cameras}:{cameras:FloorCamera[]}) {
//   const faulted = cameras.filter(c=>c.status!=='online')
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-3">
//         <p className="text-xs font-semibold text-white uppercase tracking-wider">Camera Alerts</p>
//         <Badge variant="destructive" className="text-2xs px-2">{faulted.length} issue{faulted.length!==1?'s':''}</Badge>
//       </div>
//       <div className="space-y-2">
//         {faulted.map(cam=>{
//           const cfg = STATUS_CFG[cam.status]
//           const MIcon = cam.malfunctionType ? MALF_ICONS[cam.malfunctionType] : AlertTriangle
//           return (
//             <div key={cam.cameraId} className={cn(
//               'rounded-lg border p-3',
//               cam.status==='offline' ? 'bg-red-950/30 border-red-900/50'
//                 : cam.status==='malfunction' ? 'bg-amber-950/30 border-amber-900/50'
//                 : 'bg-sky-950/30 border-sky-900/50'
//             )}>
//               <div className="flex items-start gap-2.5">
//                 <MIcon size={14} className={cn('mt-0.5 shrink-0', cfg.color)}/>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between gap-2">
//                     <p className="text-xs font-semibold text-white truncate">{cam.name}</p>
//                     <Badge variant="outline" className={cn('text-2xs border-0 shrink-0', cfg.color)}>{cfg.label}</Badge>
//                   </div>
//                   <p className="text-2xs text-gray-500 mt-0.5">{cam.location}</p>
//                   {cam.malfunctionDetail && <p className="text-2xs text-gray-400 mt-1.5 leading-relaxed">{cam.malfunctionDetail}</p>}
//                   {cam.malfunctionSince && (
//                     <div className="flex items-center gap-1 mt-1.5">
//                       <Clock size={9} className="text-gray-600"/>
//                       <p className="text-2xs text-gray-600">Since {relativeTime(cam.malfunctionSince)}</p>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-3 mt-2">
//                     <div><p className="text-2xs text-gray-600">Uptime</p><p className="text-2xs font-mono text-gray-400">{cam.uptime}%</p></div>
//                     <div><p className="text-2xs text-gray-600">Res</p><p className="text-2xs font-mono text-gray-400">{cam.resolution}</p></div>
//                     {cam.latencyMs > 0 && <div><p className="text-2xs text-gray-600">Latency</p><p className="text-2xs font-mono text-amber-400">{cam.latencyMs}ms</p></div>}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )
//         })}
//         {faulted.length===0 && (
//           <div className="text-center py-6">
//             <Activity size={20} className="text-emerald-400 mx-auto mb-2"/>
//             <p className="text-xs text-gray-500">All cameras operating normally</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Fullscreen Modal ──────────────────────────────────────────────────────────
// function FullscreenModal({camera,onClose}:{camera:FloorCamera;onClose:()=>void}) {
//   const cfg = STATUS_CFG[camera.status]
//   useEffect(()=>{
//     const h=(e:KeyboardEvent)=>e.key==='Escape'&&onClose()
//     window.addEventListener('keydown',h)
//     return()=>window.removeEventListener('keydown',h)
//   },[onClose])

//   return (
//     <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
//       <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-gray-400 hover:text-white">
//             <ArrowLeft size={16}/>
//           </Button>
//           <div>
//             <p className="text-sm font-semibold text-white">{camera.name}</p>
//             <div className="flex items-center gap-2 mt-0.5">
//               <span className={cn('w-2 h-2 rounded-full', STATUS_CFG[camera.status].dot, camera.status==='online' && 'animate-pulse')}/>
//               <p className="text-xs text-gray-400">{camera.location} · {cfg.label}</p>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-6 text-xs font-mono">
//           {[
//             {l:'FPS',       v:String(camera.fps),        ok:camera.fps>=24},
//             {l:'Latency',   v:`${camera.latencyMs}ms`,   ok:camera.latencyMs<100},
//             {l:'Resolution',v:camera.resolution,          ok:true},
//             {l:'Uptime',    v:`${camera.uptime}%`,        ok:camera.uptime>95},
//           ].map(({l,v,ok})=>(
//             <div key={l} className="text-center">
//               <p className="text-gray-600 text-2xs uppercase">{l}</p>
//               <p className={ok ? 'text-emerald-400' : 'text-amber-400'}>{v}</p>
//             </div>
//           ))}
//           <Button variant="ghost" size="icon" onClick={onClose} className="ml-4 w-8 h-8 text-gray-500 hover:text-white">
//             <X size={18}/>
//           </Button>
//         </div>
//       </div>

//       <div className="flex-1 flex gap-4 p-4 min-h-0">
//         <div className="flex-1 rounded-xl overflow-hidden bg-gray-950">
//           <CameraFeed camera={camera}/>
//         </div>
//         <ScrollArea className="w-64 shrink-0">
//           <div className="space-y-4 pr-2">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
//                 Detected ({camera.detectedPersons.length})
//               </p>
//               {camera.detectedPersons.length===0
//                 ? <p className="text-xs text-gray-600">No persons detected</p>
//                 : <div className="space-y-2">
//                     {camera.detectedPersons.map(p=>(
//                       <div key={p.userId} className="bg-white/5 rounded-lg p-2.5 border border-white/10">
//                         <div className="flex items-center gap-2">
//                           <div className="w-7 h-7 rounded-full bg-teal-900 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
//                             {getInitials(p.fullName)}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-xs font-medium text-white truncate">{p.fullName}</p>
//                             <p className="text-2xs text-gray-500 truncate">{p.designation}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between mt-2">
//                           <span className="text-2xs text-gray-600">{relativeTime(p.detectedAt)}</span>
//                           <Badge variant="outline" className="text-2xs text-emerald-400 border-emerald-800 bg-emerald-950/30">
//                             {Math.round(p.confidence*100)}% conf.
//                           </Badge>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//               }
//             </div>
//             {camera.malfunctionDetail && (
//               <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg p-3">
//                 <div className="flex items-center gap-1.5 mb-1.5">
//                   <AlertTriangle size={12} className="text-amber-400"/>
//                   <p className="text-xs font-semibold text-amber-300">Alert</p>
//                 </div>
//                 <p className="text-2xs text-amber-200/70 leading-relaxed">{camera.malfunctionDetail}</p>
//               </div>
//             )}
//           </div>
//         </ScrollArea>
//       </div>
//     </div>
//   )
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// type GridSize = '2x2' | '3x3' | '2x3'
// const GRID_COLS: Record<GridSize,string> = { '2x2':'grid-cols-2', '3x3':'grid-cols-3', '2x3':'grid-cols-2' }

// export default function LiveMonitorPage() {
//   const [cameras, setCameras]           = useState<FloorCamera[]>(INIT_CAMERAS)
//   const [viewMode, setViewMode]         = useState<'grid'|'map'>('grid')
//   const [gridSize, setGridSize]         = useState<GridSize>('2x2')
//   const [selectedCamera, setSelectedCamera] = useState<FloorCamera|null>(null)
//   const [fullscreenCamera, setFullscreenCamera] = useState<FloorCamera|null>(null)
//   const [trackedUserId, setTrackedUserId] = useState<string|undefined>()
//   const [search, setSearch]             = useState('')
//   const [statusFilter, setStatusFilter] = useState<CameraStatus|'all'>('all')
//   const [activePanel, setActivePanel]   = useState<'tracker'|'alerts'>('alerts')
//   const [selectedFloor, setSelectedFloor] = useState<number|'all'>('all')

//   const onlineCount = cameras.filter(c=>c.status==='online').length
//   const alertCount  = cameras.filter(c=>c.status!=='online').length

//   const filtered = cameras.filter(c=>{
//     const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
//     const mf = statusFilter==='all' || c.status===statusFilter
//     return ms && mf
//   })

//   useEffect(()=>{
//     const timer = setInterval(()=>{
//       setCameras(prev=>{
//         const online = prev.filter(c=>c.status==='online')
//         if(online.length<2) return prev
//         const from = online[Math.floor(Math.random()*online.length)]
//         const to   = online.filter(c=>c.cameraId!==from.cameraId)[Math.floor(Math.random()*(online.length-1))]
//         if(!from.detectedPersons.length) return prev
//         const person = from.detectedPersons[0]
//         return prev.map(c=>{
//           if(c.cameraId===from.cameraId) return{...c,detectedPersons:c.detectedPersons.slice(1)}
//           if(c.cameraId===to.cameraId)   return{...c,detectedPersons:[...c.detectedPersons,{...person,detectedAt:new Date().toISOString()}],lastEventAt:new Date().toISOString()}
//           return c
//         })
//       })
//     },6000)
//     return()=>clearInterval(timer)
//   },[])

//   const floors = ['all', ...Array.from(new Set(cameras.map(c=>c.floor))).sort((a,b)=>b-a)]

//   return (
//     <div className="flex h-[calc(100vh-4rem)] -m-6 bg-gray-950 text-white overflow-hidden">

//       {/* ── Left sidebar ── */}
//       <div className="w-64 shrink-0 border-r border-white/10 flex flex-col bg-gray-900">
//         <div className="px-4 py-4 border-b border-white/10 space-y-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Radio size={14} className="text-teal-400"/>
//               <p className="text-sm font-semibold">Live Monitor</p>
//             </div>
//             <div className="flex items-center gap-1.5 text-2xs font-mono">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
//               <span className="text-emerald-400">{onlineCount}</span>
//               <span className="text-gray-600">/</span>
//               <span className="text-gray-400">{cameras.length}</span>
//             </div>
//           </div>

//           <div className="relative">
//             <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"/>
//             <Input
//               value={search}
//               onChange={e=>setSearch(e.target.value)}
//               placeholder="Search cameras…"
//               className="pl-7 h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-teal-500/50"
//             />
//           </div>

//           <div className="flex gap-1">
//             {(['all','online','malfunction','offline'] as const).map(s=>(
//               <button
//                 key={s}
//                 onClick={()=>setStatusFilter(s)}
//                 className={cn('flex-1 text-2xs font-medium py-1 rounded transition-colors capitalize',
//                   statusFilter===s ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-gray-500 hover:text-gray-300'
//                 )}
//               >{s}</button>
//             ))}
//           </div>
//         </div>

//         <ScrollArea className="flex-1">
//           <div className="py-2">
//             {filtered.map(cam=>{
//               const cfg = STATUS_CFG[cam.status]
//               const isSel = selectedCamera?.cameraId===cam.cameraId
//               const hasTracked = trackedUserId ? cam.detectedPersons.some(p=>p.userId===trackedUserId) : false
//               return (
//                 <button
//                   key={cam.cameraId}
//                   onClick={()=>setSelectedCamera(isSel?null:cam)}
//                   className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-l-2',
//                     isSel ? 'bg-teal-500/10 border-teal-500'
//                       : hasTracked ? 'bg-amber-500/5 border-amber-500/60'
//                       : 'border-transparent hover:bg-white/5'
//                   )}
//                 >
//                   <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot, cam.status==='online' && 'animate-pulse')}/>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-white truncate">{cam.name}</p>
//                     <p className="text-2xs text-gray-500 truncate">{cam.location}</p>
//                   </div>
//                   {cam.detectedPersons.length > 0 && (
//                     <span className="text-2xs text-teal-400 font-mono">{cam.detectedPersons.length}👤</span>
//                   )}
//                 </button>
//               )
//             })}
//           </div>
//         </ScrollArea>

//         {alertCount > 0 && (
//           <div className="px-4 py-3 border-t border-white/10 bg-amber-950/20">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={()=>setActivePanel('alerts')}
//               className="w-full justify-start text-xs text-amber-400 hover:text-amber-300 hover:bg-transparent gap-2 px-0"
//             >
//               <AlertTriangle size={12}/>
//               {alertCount} camera{alertCount>1?'s':''} need attention
//               <ChevronRight size={12} className="ml-auto"/>
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* ── Main area ── */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         {/* Toolbar */}
//         <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-gray-900/50 shrink-0">
//           <div className="flex items-center gap-2">
//             {/* View toggle */}
//             <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
//               {(['grid','map'] as const).map(v=>(
//                 <button key={v} onClick={()=>setViewMode(v)}
//                   className={cn('px-3 py-1.5 font-medium capitalize transition-colors',
//                     viewMode===v ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
//                   )}>
//                   {v==='grid' ? '⊞ Grid' : '⬡ Map'}
//                 </button>
//               ))}
//             </div>

//             {viewMode==='grid' && (
//               <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
//                 {(['2x2','3x3','2x3'] as const).map(g=>(
//                   <button key={g} onClick={()=>setGridSize(g)}
//                     className={cn('px-3 py-1.5 font-mono transition-colors',
//                       gridSize===g ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'
//                     )}>{g}</button>
//                 ))}
//               </div>
//             )}

//             {viewMode==='map' && (
//               <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
//                 {floors.map(f=>(
//                   <button key={String(f)} onClick={()=>setSelectedFloor(f as number|'all')}
//                     className={cn('px-3 py-1.5 font-medium transition-colors',
//                       selectedFloor===f ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
//                     )}>
//                     {f==='all'?'All':f===-1?'B1':f===0?'GF':`F${f}`}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Stats */}
//           <div className="flex items-center gap-5 text-xs font-mono">
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
//               <span className="text-gray-400">{onlineCount} Online</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <span className="w-2 h-2 rounded-full bg-amber-400"/>
//               <span className="text-gray-400">{alertCount} Alerts</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <User size={11} className="text-gray-500"/>
//               <span className="text-gray-400">{cameras.reduce((a,c)=>a+c.detectedPersons.length,0)} Detected</span>
//             </div>
//           </div>
//         </div>

//         {/* Feed */}
//         <ScrollArea className="flex-1 p-4">
//           {viewMode==='grid' ? (
//             <div className={cn('grid gap-3', GRID_COLS[gridSize])}>
//               {filtered.map(cam=>(
//                 <CameraCard
//                   key={cam.cameraId}
//                   camera={cam}
//                   isSelected={selectedCamera?.cameraId===cam.cameraId}
//                   onClick={()=>setSelectedCamera(c=>c?.cameraId===cam.cameraId?null:cam)}
//                   onFullscreen={()=>setFullscreenCamera(cam)}
//                   trackedUserId={trackedUserId}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <FloorMap cameras={cameras} selectedFloor={selectedFloor} trackedUserId={trackedUserId} onCameraClick={cam=>setSelectedCamera(c=>c?.cameraId===cam.cameraId?null:cam)}/>
//               <div className="grid grid-cols-4 gap-3">
//                 {filtered.slice(0,4).map(cam=>(
//                   <CameraCard key={cam.cameraId} camera={cam} isSelected={selectedCamera?.cameraId===cam.cameraId} onClick={()=>setSelectedCamera(c=>c?.cameraId===cam.cameraId?null:cam)} onFullscreen={()=>setFullscreenCamera(cam)} trackedUserId={trackedUserId}/>
//                 ))}
//               </div>
//             </div>
//           )}
//         </ScrollArea>

//         {/* Selected camera detail bar */}
//         {selectedCamera && (
//           <>
//             <Separator className="bg-white/10"/>
//             <div className="shrink-0 bg-gray-900/80 backdrop-blur px-5 py-3">
//               <div className="flex items-center gap-6">
//                 <div className="flex items-center gap-2">
//                   <span className={cn('w-2 h-2 rounded-full', STATUS_CFG[selectedCamera.status].dot)}/>
//                   <p className="text-sm font-semibold text-white">{selectedCamera.name}</p>
//                   <span className="text-xs text-gray-500">{selectedCamera.location}</span>
//                 </div>
//                 <div className="flex items-center gap-6 text-xs font-mono ml-4">
//                   {[
//                     {l:'FPS',     v:String(selectedCamera.fps),        ok:selectedCamera.fps>=24},
//                     {l:'Latency', v:`${selectedCamera.latencyMs}ms`,   ok:selectedCamera.latencyMs<100},
//                     {l:'Uptime',  v:`${selectedCamera.uptime}%`,        ok:selectedCamera.uptime>95},
//                     {l:'Res',     v:selectedCamera.resolution,          ok:true},
//                   ].map(({l,v,ok})=>(
//                     <div key={l}>
//                       <p className="text-gray-600 text-2xs">{l}</p>
//                       <p className={ok ? 'text-emerald-400' : 'text-amber-400'}>{v}</p>
//                     </div>
//                   ))}
//                   {selectedCamera.detectedPersons.length > 0 && (
//                     <div>
//                       <p className="text-gray-600 text-2xs">Detected</p>
//                       <p className="text-teal-400">{selectedCamera.detectedPersons.map(p=>p.fullName.split(' ')[0]).join(', ')}</p>
//                     </div>
//                   )}
//                 </div>
//                 <div className="ml-auto flex items-center gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={()=>setFullscreenCamera(selectedCamera)}
//                     className="text-xs text-teal-400 border-teal-500/30 hover:text-teal-300 hover:bg-teal-500/10 gap-1.5 bg-transparent"
//                   >
//                     <Maximize2 size={12}/> Fullscreen
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={()=>setSelectedCamera(null)} className="w-7 h-7 text-gray-500 hover:text-white">
//                     <X size={14}/>
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ── Right sidebar ── */}
//       <div className="w-64 shrink-0 border-l border-white/10 bg-gray-900 flex flex-col">
//         <div className="flex border-b border-white/10 shrink-0">
//           {(['alerts','tracker'] as const).map(panel=>(
//             <button
//               key={panel}
//               onClick={()=>setActivePanel(panel)}
//               className={cn('flex-1 py-3 text-xs font-medium capitalize transition-colors relative',
//                 activePanel===panel ? 'text-white' : 'text-gray-500 hover:text-gray-300'
//               )}
//             >
//               {panel==='alerts' ? '🔴 Alerts' : '📍 Tracker'}
//               {panel==='alerts' && alertCount > 0 && (
//                 <Badge className="ml-1.5 bg-red-500 text-white text-2xs w-4 h-4 p-0 inline-flex items-center justify-center rounded-full">
//                   {alertCount}
//                 </Badge>
//               )}
//               {activePanel===panel && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"/>}
//             </button>
//           ))}
//         </div>
//         <ScrollArea className="flex-1 p-4">
//           {activePanel==='alerts'
//             ? <MalfunctionPanel cameras={cameras}/>
//             : <PersonTrackerPanel trails={PERSON_TRAILS} trackedUserId={trackedUserId} onTrack={setTrackedUserId} onClear={()=>setTrackedUserId(undefined)}/>
//           }
//         </ScrollArea>
//       </div>

//       {fullscreenCamera && <FullscreenModal camera={fullscreenCamera} onClose={()=>setFullscreenCamera(null)}/>}
//     </div>
//   )
// }