import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, MessageSquare, Shield } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navigation() {
  const [, setLocation] = useLocation()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Directory', href: '/directory' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Events', href: '/events' },
    { label: 'Mentorship', href: '/mentorship' },
    { label: 'Discussion', href: '/discussion' },
    { label: 'Feed', href: '/feed' },
  ]

  const handleSignOut = async () => {
    await signOut()
    setLocation('/auth')
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#EE7674] border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#EE7674] font-bold text-sm">JEC</span>
            </div>
            <span className="hidden sm:inline text-white">JEC MCA</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => setLocation(link.href)}
                className="text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                    <span className="text-sm font-medium">Hi {user.first_name || user.name?.split(' ')[0] || 'User'}</span>
                    <UserIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/profile-setup')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {user.is_admin && (
                    <DropdownMenuItem onClick={() => setLocation('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/auth')}
                  className="text-sm font-medium text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation('/auth')}
                  className="bg-white text-[#EE7674] hover:bg-white/90"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setLocation(link.href)
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Hi {user.first_name || user.name?.split(' ')[0] || 'User'}
                </p>
                <button
                  onClick={() => { setLocation('/dashboard'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setLocation('/messages'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Messages
                </button>
                <button
                  onClick={() => { setLocation('/profile-setup'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Profile
                </button>
                {user.is_admin && (
                  <button
                    onClick={() => { setLocation('/admin'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Admin Portal
                  </button>
                )}
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setLocation('/auth')
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
