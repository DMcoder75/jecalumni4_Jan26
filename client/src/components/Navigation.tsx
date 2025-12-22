import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

export default function Navigation() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Directory', href: '/directory' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Events', href: '/events' },
    { label: 'Mentorship', href: '/mentorship' },
    { label: 'Feed', href: '/feed' },
  ]

  const userLinks = [
    { label: 'Messages', href: '/messages' },
    { label: 'Dashboard', href: '/dashboard' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">JEC</span>
            </div>
            <span className="hidden sm:inline">JEC MCA</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => setLocation(link.href)}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {userLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => setLocation(link.href)}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </>
            ) : (
              <Button
                onClick={() => setLocation('/auth')}
                className="bg-primary hover:bg-primary/90"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
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
              <>
                {userLinks.map((link) => (
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
              </>
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
