import { useState } from 'react'
import { Cloud, Download, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { authClient } from '@/lib/auth-client'
import { useTracker } from '@/lib/tracker-context'
import { downloadFile } from '@/lib/download'

export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { session, sync, syncState, entries, guestAvailable, bringGuest } = useTracker()
  const [signup, setSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const args = { email: String(data.get('email')), password: String(data.get('password')) }
      const result = signup
        ? await authClient.signUp.email({ ...args, name: String(data.get('name')) })
        : await authClient.signIn.email(args)
      if (result.error) setError(result.error.message || 'Unable to sign in. Please try again.')
      else {
        toast.success(
          signup
            ? 'Account created. Your cloud checklist is ready.'
            : 'Signed in. Loading your cloud checklist.',
        )
        await session.refetch()
      }
    } catch {
      setError('Connection failed. Your device checklist is still safe.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="account-dialog">
        <DialogHeader>
          <div className="dialog-symbol">
            <Cloud size={21} />
          </div>
          <DialogTitle>
            {session.data
              ? 'Your field account'
              : signup
                ? 'Take your progress with you'
                : 'Continue your grind'}
          </DialogTitle>
          <DialogDescription>
            {session.data
              ? 'Your account checklist syncs across devices.'
              : 'Free cloud sync. Your Activision account is never needed.'}
          </DialogDescription>
        </DialogHeader>
        {session.data ? (
          <div className="account-body">
            <div className="account-identity">
              <strong>{session.data.user.name}</strong>
              <span>{session.data.user.email}</span>
            </div>
            <div className="notice">
              <ShieldCheck size={16} />
              <span>
                Guest and account checklists stay separate. Export a backup whenever you need one.
              </span>
            </div>
            {guestAvailable && (
              <Button variant="outline" onClick={bringGuest}>
                Merge this device’s guest checklist
              </Button>
            )}
            <Button onClick={() => void sync()} disabled={syncState === 'syncing'}>
              <RefreshCw size={15} /> {syncState === 'syncing' ? 'Syncing…' : 'Sync now'}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadFile(
                  JSON.stringify({ version: 1, entries }, null, 2),
                  'camofield-backup.json',
                  'application/json',
                )
              }
            >
              <Download size={15} /> Export a backup
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await authClient.signOut()
                await session.refetch()
                toast.success('Signed out. Your guest checklist is now active.')
              }}
            >
              <LogOut size={15} /> Sign out
            </Button>
            <details className="account-security">
              <summary>Account settings</summary>
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  setBusy(true)
                  setError('')
                  const data = new FormData(event.currentTarget)
                  try {
                    const result = await authClient.changePassword({
                      currentPassword: String(data.get('current')),
                      newPassword: String(data.get('new')),
                      revokeOtherSessions: true,
                    })
                    if (result.error) setError(result.error.message || 'Could not update password.')
                    else {
                      toast.success('Password updated. Other sessions have been revoked.')
                      event.currentTarget?.reset()
                    }
                  } catch {
                    setError('Unable to update password.')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <label>
                  Current password
                  <input name="current" type="password" autoComplete="current-password" required />
                </label>
                <label>
                  New password
                  <input
                    name="new"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
                <Button variant="outline" type="submit" disabled={busy}>
                  Update password
                </Button>
              </form>
              <Button variant="destructive" onClick={() => setDeleting(!deleting)}>
                <Trash2 size={14} /> Delete account
              </Button>
              {deleting && (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setBusy(true)
                    setError('')
                    const data = new FormData(event.currentTarget)
                    try {
                      const result = await authClient.deleteUser({
                        password: String(data.get('confirm')),
                      })
                      if (result.error)
                        setError(result.error.message || 'Unable to delete account.')
                      else {
                        localStorage.removeItem(
                          `camofield:progress:user:${session.data?.user.id}:v1`,
                        )
                        await session.refetch()
                        setDeleting(false)
                        onOpenChange(false)
                        toast.success('Your account and cloud progress were deleted.')
                      }
                    } catch {
                      setError('Unable to delete account.')
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  <p className="form-error">
                    This permanently deletes your account and cloud progress. Export a backup first.
                  </p>
                  <label>
                    Confirm your password
                    <input
                      name="confirm"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  <Button variant="destructive" type="submit" disabled={busy}>
                    Permanently delete my account
                  </Button>
                </form>
              )}
            </details>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            {signup && (
              <label>
                Display name
                <input
                  name="name"
                  autoComplete="nickname"
                  required
                  minLength={2}
                  maxLength={40}
                  placeholder="Your callsign"
                />
              </label>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={signup ? 'new-password' : 'current-password'}
                required
                minLength={signup ? 12 : 1}
                maxLength={128}
                placeholder={signup ? 'At least 12 characters' : 'Your password'}
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy || session.isPending}>
              {busy ? 'Please wait…' : signup ? 'Create free account' : 'Sign in'}
            </Button>
            {signup && (
              <p className="small muted">
                Save your password in a password manager. Email verification and email password
                recovery are not available yet.
              </p>
            )}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSignup(!signup)
                setError('')
              }}
            >
              {signup ? 'Already have an account? Sign in' : 'New here? Create a free account'}{' '}
              <span aria-hidden="true">→</span>
            </button>
            <p className="small muted">
              Read our <a href="/privacy">privacy policy</a> and <a href="/terms">terms</a>. You can
              use the tracker without an account.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
