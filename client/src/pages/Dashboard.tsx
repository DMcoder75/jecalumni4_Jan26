import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, User as UserIcon, Mail, Briefcase, MapPin, Link as LinkIcon, Edit2, Save, X } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { user, signOut, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    connections: 0,
    mentorships: 0,
    jobApplications: 0,
    eventsAttended: 0,
  })

  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    batch: user?.batch || '',
    company: user?.company || '',
    designation: user?.designation || '',
    location: user?.location || '',
    skills: user?.skills || '',
    bio: user?.bio || '',
    linkedin_url: user?.linkedin_url || '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    if (user) {
      fetchStats()
      setFormData({
        name: user.name,
        batch: user.batch,
        company: user.company,
        designation: user.designation,
        location: user.location,
        skills: user.skills,
        bio: user.bio,
        linkedin_url: user.linkedin_url,
        phone: user.phone,
      })
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      // Fetch connections count
      const { count: connCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      // Fetch mentorships count
      const { count: mentCount } = await supabase
        .from('mentorships')
        .select('*', { count: 'exact', head: true })
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .eq('status', 'active')

      // Fetch job applications count
      const { count: appCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('applicant_id', user.id)

      // Fetch events attended count
      const { count: eventCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'attended')

      setStats({
        connections: connCount || 0,
        mentorships: mentCount || 0,
        jobApplications: appCount || 0,
        eventsAttended: eventCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setLocation('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your profile and view your activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.connections}</p>
            <p className="text-sm text-muted-foreground">Connections</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.mentorships}</p>
            <p className="text-sm text-muted-foreground">Mentorships</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.jobApplications}</p>
            <p className="text-sm text-muted-foreground">Job Applications</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">{stats.eventsAttended}</p>
            <p className="text-sm text-muted-foreground">Events Attended</p>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={() => setEditing(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch">Batch Year</Label>
                  <Input
                    id="batch"
                    value={formData.batch || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, batch: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Job Title</Label>
                  <Input
                    id="designation"
                    value={formData.designation || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="min-h-32"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="text-lg font-semibold text-foreground">{user.email}</p>
                </div>

                {user.batch && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Batch Year</p>
                    <p className="text-lg font-semibold text-foreground">{user.batch}</p>
                  </div>
                )}

                {user.company && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Company
                    </p>
                    <p className="text-lg font-semibold text-foreground">{user.company}</p>
                  </div>
                )}

                {user.designation && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Job Title</p>
                    <p className="text-lg font-semibold text-foreground">
                      {user.designation}
                    </p>
                  </div>
                )}

                {user.location && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </p>
                    <p className="text-lg font-semibold text-foreground">{user.location}</p>
                  </div>
                )}

                {user.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-lg font-semibold text-foreground">{user.phone}</p>
                  </div>
                )}

                {user.linkedin_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      LinkedIn
                    </p>
                    <a
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>

              {user.skills && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.split(',').map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bio</p>
                  <p className="text-foreground">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Sign Out Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
