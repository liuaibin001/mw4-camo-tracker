import { useState } from 'react'
import {
  BookOpen,
  ChevronRight,
  Crosshair,
  Grid2X2,
  Menu,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { AccountDialog } from './account-dialog'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { useTracker } from '@/lib/tracker-context'

export function Layout({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState(false),
    [menu, setMenu] = useState(false)
  const { session } = useTracker(),
    path = useLocation({ select: (l) => l.pathname })
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="CamoField home">
            <span className="brand-mark">
              <Crosshair size={21} />
            </span>
            <span>
              Camo<span className="brand-light">Field</span>
              <span className="brand-edition">MW4</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link to="/" data-active={path === '/'}>
              Tracker
            </Link>
            <a href="/guides/camo-challenges" data-active={path.includes('/guides')}>
              Field guide
            </a>
            <a href="/guides/not-tracking">Tracking fixes</a>
            <a href="/sources" data-active={path === '/sources'}>
              Data & sources
            </a>
          </nav>
          <div className="header-actions">
            <span className="header-free">
              <span className="status-dot" />
              Free to use
            </span>
            <Button variant="outline" onClick={() => setAccount(true)} className="account-trigger">
              <UserRound size={15} />
              <span>{session.data?.user.name || 'Sync progress'}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={19} />
            </Button>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <a href="/" className="brand footer-brand">
              <Crosshair size={18} />
              CamoField
            </a>
            <p>A clearer route through the camo grind.</p>
            <p className="disclaimer">
              Independent fan tool. Not affiliated with Activision. Call of Duty and Modern Warfare
              are Activision trademarks.
            </p>
          </div>
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/sources">Sources & corrections</a>
            <a href="/changelog">Changelog</a>
            <a href="/guides/spreadsheet">Spreadsheet & backups</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <span className="footer-year">© 2026 CamoField</span>
        </div>
      </footer>
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        <a href="/" data-active={path === '/'}>
          <Grid2X2 size={19} />
          Tracker
        </a>
        <a href="/guides/camo-challenges" data-active={path.includes('/guides')}>
          <BookOpen size={19} />
          Guides
        </a>
        <a href="/sources" data-active={path === '/sources'}>
          <ShieldCheck size={19} />
          Sources
        </a>
        <button onClick={() => setAccount(true)}>
          <UserRound size={19} />
          Account
        </button>
      </nav>
      <AccountDialog open={account} onOpenChange={setAccount} />
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent>
          <DialogTitle>Navigate CamoField</DialogTitle>
          <nav className="menu-links" aria-label="Expanded navigation">
            {[
              ['/', 'Camo tracker'],
              ['/guides/camo-challenges', 'Camo challenge guide'],
              ['/guides/mastery-camos', 'Mastery routes'],
              ['/guides/not-tracking', 'Tracking fixes'],
              ['/guides/spreadsheet', 'Spreadsheet & backups'],
              ['/sources', 'Data & sources'],
            ].map(([href, label]) => (
              <a key={href} href={href}>
                {label}
                <ChevronRight size={16} />
              </a>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  )
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">MW4</a>
      {items.map((item, i) => (
        <span key={i}>
          <ChevronRight size={12} />
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
