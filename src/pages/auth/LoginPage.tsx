import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const schema = z.object({
  email:      z.string().email('Enter a valid email address'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { loginMutation } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = (data: FormData) => loginMutation.mutate(data)

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col bg-brand-800 p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-700 opacity-40 pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-72 h-72 rounded-full bg-brand-900 opacity-60 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-brand-900" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">SMAP</p>
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative mt-auto">
          <h2 className="text-white text-3xl font-semibold leading-snug">
            Smart Monitoring<br />&amp; Analytics<br />Platform
          </h2>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Department-level attendance and access management for your team.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Live Monitoring', 'Attendance Tracking', 'Analytics', 'Face Recognition'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <p className="font-bold text-text-primary">SMAP Admin</p>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to your Admin portal</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-text-primary">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                className={cn(errors.email && 'border-red-400 focus-visible:ring-red-400')}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn('pr-10', errors.password && 'border-red-400 focus-visible:ring-red-400')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-border accent-brand-600"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white h-10"
            >
              {loginMutation.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in…</>
              ) : 'Sign in'}
            </Button>
          </form>

          <p className="text-xs text-text-secondary mt-6 text-center">
            Admin portal only. Super Admins should use the{' '}
            <span className="text-brand-600 font-medium">Super Admin portal</span>.
          </p>
        </div>
      </div>
    </div>
  )
}