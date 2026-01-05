import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, User as UserIcon, Mail, Briefcase, MapPin, Link as LinkIcon, Edit2, Save, X, LogOut } from 'lucide-react'
import ConnectionsManager from '@/components/ConnectionsManager'
import MyConnections from '@/components/MyConnections'
import { useLocation } from 'wouter'

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const { user, signOut, updateProfile, refreshUser } = useAuth()
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
  const [applyingMentor, setApplyingMentor] = useState(false)

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
      // Proactively refresh user data to get latest mentor status
      refreshUserData()
    }
  }, [user])

  const refreshUserData = async () => {
    await refreshUser()
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Fetch connections count (where user is either sender or recipient)
      const { count: connCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
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

  const handleBecomeMentor = async () => {
    if (!user) return
    setApplyingMentor(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          mentor_status: 'pending',
          mentor_application_date: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      toast.success('Mentor application submitted for admin approval!')
      // Refresh user data would be ideal here, but for now we rely on the next refresh
    } catch (error) {
      console.error('Error applying for mentor:', error)
      toast.error('Failed to submit mentor application')
    } finally {
      setApplyingMentor(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-lg text-muted-foreground">Manage your profile and view your activity</p>
              {user.is_mentor ? (
                <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">Mentor</Badge>
              ) : user.mentor_status === 'pending' ? (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">Mentor request pending</Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary"
                  onClick={handleBecomeMentor}
                  disabled={applyingMentor}
                >
                  {applyingMentor ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Become a Mentor
                </Button>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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

        {/* Connections Section */}
        <div className="space-y-8 mb-8">
          <ConnectionsManager />
          <MyConnections />
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
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{user.name}</h3>
                  <p className="text-lg text-primary font-semibold mb-4">
                    {user.designation || 'Alumni'} {user.company ? `@ ${user.company}` : ''}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.batch && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>Batch of {user.batch}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.linkedin_url && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LinkIcon className="w-4 h-4" />
                        <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user.skills && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.split(',').map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">About Me</h4>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
