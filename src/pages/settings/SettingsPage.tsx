import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2, Save, User, Bell, Monitor, Lock, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/uiStore'
import { cn, getInitials } from '@/lib/utils'
import type { NotificationRulesModel, DisplayPrefsModel } from '@/types'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
})

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-brand-600' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className={cn(
        'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4' : 'translate-x-1',
      )} />
    </button>
  )
}

// ─── Radio group ──────────────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            value === o.value
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-background text-muted-foreground border-border hover:border-brand-300 hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Tab 1: My Profile ────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateUser } = useAuthStore()
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName  ?? '',
      email:    user?.email     ?? '',
      phone:    user?.phone     ?? '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSaveProfile(data: ProfileForm) {
    setSavingProfile(true)
    await new Promise(r => setTimeout(r, 800))
    updateUser({ fullName: data.fullName, email: data.email, phone: data.phone })
    toast('Profile updated successfully', 'success')
    setSavingProfile(false)
  }

  async function onChangePassword(_data: PasswordForm) {
    setSavingPassword(true)
    await new Promise(r => setTimeout(r, 800))
    toast('Password changed successfully', 'success')
    passwordForm.reset()
    setSavingPassword(false)
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Profile Photo</CardTitle>
          <CardDescription className="text-xs">Your photo appears across the admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold shrink-0">
              {user?.photoUrl
                ? <img src={user.photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                : getInitials(user?.fullName ?? 'A')}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Upload size={13} /> Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF · max 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Information</CardTitle>
          <CardDescription className="text-xs">Update your name, email and phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input {...profileForm.register('fullName')} className="h-9 text-sm" />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email Address</Label>
                <Input {...profileForm.register('email')} type="email" className="h-9 text-sm" />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
                <Input {...profileForm.register('phone')} type="tel" placeholder="+91 98765 43210" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Input value={user?.departmentName ?? ''} disabled className="h-9 text-sm bg-muted" />
                <p className="text-xs text-muted-foreground">Assigned by Super Admin — cannot be changed</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs" disabled={savingProfile}>
                {savingProfile ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Lock size={14} /> Change Password</CardTitle>
          <CardDescription className="text-xs">Use a strong password with at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Password</Label>
              <Input {...passwordForm.register('currentPassword')} type="password" className="h-9 text-sm max-w-sm" />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-1.5">
                <Label className="text-xs">New Password</Label>
                <Input {...passwordForm.register('newPassword')} type="password" className="h-9 text-sm" />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm New Password</Label>
                <Input {...passwordForm.register('confirmPassword')} type="password" className="h-9 text-sm" />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-xs" disabled={savingPassword}>
                {savingPassword ? <><Loader2 size={13} className="animate-spin" /> Updating…</> : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab 2: Notification Rules ────────────────────────────────────────────────

const DEFAULT_NOTIF_RULES: NotificationRulesModel = {
  lateArrival:      true,
  earlyExit:        true,
  absent:           true,
  highAbsenceRate:  true,
  absenceThreshold: 75,
  unknownFace:      true,
}

function NotificationRulesTab() {
  const [rules,   setRules]   = useState<NotificationRulesModel>(DEFAULT_NOTIF_RULES)
  const [saving,  setSaving]  = useState(false)

  function toggle(key: keyof Omit<NotificationRulesModel, 'absenceThreshold'>) {
    setRules(r => ({ ...r, [key]: !r[key] }))
  }

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    toast('Notification rules saved', 'success')
    setSaving(false)
  }

  const rows: { key: keyof Omit<NotificationRulesModel, 'absenceThreshold'>; label: string; description: string }[] = [
    { key: 'lateArrival',     label: 'Late Arrival Alert',       description: 'Notify me when a user in my department arrives late' },
    { key: 'earlyExit',       label: 'Early Exit Alert',         description: 'Notify me when a user leaves before the end of shift' },
    { key: 'absent',          label: 'Absence Alert',            description: 'Notify me when a user is absent for the day' },
    { key: 'highAbsenceRate', label: 'High Absence Rate',        description: 'Notify me when department attendance drops below threshold' },
    { key: 'unknownFace',     label: 'Unknown Face Detection',   description: 'Notify me when an unknown face is detected in department cameras' },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Notification Rules</CardTitle>
        <CardDescription className="text-xs">
          Configure which events trigger notifications to you as department admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {rows.map((row, i) => (
          <div key={row.key}>
            <div className="flex items-center justify-between py-4">
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{row.description}</p>

                {/* Threshold input — only shown when highAbsenceRate is ON */}
                {row.key === 'highAbsenceRate' && rules.highAbsenceRate && (
                  <div className="flex items-center gap-3 mt-3">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Alert when below</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1} max={100}
                        value={rules.absenceThreshold}
                        onChange={e => setRules(r => ({ ...r, absenceThreshold: Number(e.target.value) }))}
                        className="h-7 w-16 text-xs text-center"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Badge variant="outline" className="text-2xs">Default: 75%</Badge>
                  </div>
                )}
              </div>
              <Toggle checked={rules[row.key] as boolean} onChange={() => toggle(row.key)} />
            </div>
            {i < rows.length - 1 && <Separator />}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <Button size="sm" onClick={save} className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs" disabled={saving}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Rules</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tab 3: Display Preferences ───────────────────────────────────────────────

const DEFAULT_PREFS: DisplayPrefsModel = {
  defaultLandingPage: 'dashboard',
  defaultPeriod:      'month',
  tableRowsPerPage:   20,
  showLateWarning:    true,
}

function DisplayPrefsTab() {
  const [prefs,  setPrefs]  = useState<DisplayPrefsModel>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    toast('Display preferences saved', 'success')
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Display Preferences</CardTitle>
        <CardDescription className="text-xs">Customise how the portal looks and behaves for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">

        {/* Landing page */}
        <div className="py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium">Default Landing Page</p>
              <p className="text-xs text-muted-foreground mt-0.5">The page you see after logging in</p>
            </div>
            <RadioGroup
              value={prefs.defaultLandingPage}
              onChange={v => setPrefs(p => ({ ...p, defaultLandingPage: v }))}
              options={[
                { value: 'dashboard',   label: 'Dashboard' },
                { value: 'attendance',  label: 'Attendance' },
                { value: 'analytics',   label: 'Analytics' },
              ]}
            />
          </div>
        </div>
        <Separator />

        {/* Default period */}
        <div className="py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium">Default Analytics Period</p>
              <p className="text-xs text-muted-foreground mt-0.5">Starting period for the Analytics page</p>
            </div>
            <RadioGroup
              value={prefs.defaultPeriod}
              onChange={v => setPrefs(p => ({ ...p, defaultPeriod: v }))}
              options={[
                { value: 'week',    label: 'This Week' },
                { value: 'month',   label: 'This Month' },
                { value: '3months', label: 'Last 3 Months' },
              ]}
            />
          </div>
        </div>
        <Separator />

        {/* Rows per page */}
        <div className="py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium">Table Rows Per Page</p>
              <p className="text-xs text-muted-foreground mt-0.5">Default number of rows in all data tables</p>
            </div>
            <RadioGroup
              value={String(prefs.tableRowsPerPage) as '10' | '20' | '50'}
              onChange={v => setPrefs(p => ({ ...p, tableRowsPerPage: Number(v) as 10 | 20 | 50 }))}
              options={[
                { value: '10', label: '10 rows' },
                { value: '20', label: '20 rows' },
                { value: '50', label: '50 rows' },
              ]}
            />
          </div>
        </div>
        <Separator />

        {/* Late warning toggle */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Late Threshold Warning</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Highlight late arrivals in attendance tables with an amber indicator
              </p>
            </div>
            <Toggle
              checked={prefs.showLateWarning}
              onChange={v => setPrefs(p => ({ ...p, showLateWarning: v }))}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm" onClick={save} className="bg-brand-600 hover:bg-brand-700 text-white gap-1.5 text-xs" disabled={saving}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Preferences</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'notifications' | 'display'

const TABS: { value: Tab; label: string; icon: typeof User }[] = [
  { value: 'profile',       label: 'My Profile',          icon: User },
  { value: 'notifications', label: 'Notification Rules',  icon: Bell },
  { value: 'display',       label: 'Display Preferences', icon: Monitor },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, notifications and display preferences"
      />

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-52 shrink-0 space-y-1">
          {/* User info card */}
          <Card className="p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold shrink-0">
                {getInitials(user?.fullName ?? 'A')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user?.fullName}</p>
                <p className="text-2xs text-muted-foreground truncate">{user?.departmentName}</p>
              </div>
            </div>
          </Card>

          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                tab === value
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon size={15} className={tab === value ? 'text-brand-600' : ''} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'notifications' && <NotificationRulesTab />}
          {tab === 'display'       && <DisplayPrefsTab />}
        </div>
      </div>
    </div>
  )
}