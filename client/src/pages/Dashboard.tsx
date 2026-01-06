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
import DashboardSidebar from '@/components/DashboardSidebar'
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
      refreshUserData()
    }
  }, [user])

  const refreshUserData = async () => {
    await refreshUser()
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const { count: connCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const { count: mentCount } = await supabase
        .from('mentorships')
        .select('*', { count: 'exact', head: true })
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .eq('status', 'active')

      const { count: appCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('applicant_id', user.id)

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
    } catch (error) {
      console.error('Error applying for mentor:', error)
      toast.error('Failed to submit mentor application')
    } finally {
      setApplyingMentor(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                <p className="text-sm text-muted-foreground">Job Apps</p>
              </Card>
              <Card className="p-6 text-center">
                <p className="text-3xl font-bold text-primary mb-2">{stats.eventsAttended}</p>
                <p className="text-sm text-muted-foreground">Events</p>
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
                      <Label htmlFor="phone">Phone Number</Label>
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
                        value={formData.linkedin_url || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, linkedin_url: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      value={formData.skills || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      placeholder="React, Node.js, Project Management..."
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
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <UserIcon className="w-5 h-5" />
                      <div>
                        <p className="text-xs font-medium uppercase">Full Name</p>
                        <p className="text-foreground font-medium">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                      <div>
                        <p className="text-xs font-medium uppercase">Email Address</p>
                        <p className="text-foreground font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Briefcase className="w-5 h-5" />
                      <div>
                        <p className="text-xs font-medium uppercase">Current Role</p>
                        <p className="text-foreground font-medium">
                          {user.designation} at {user.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <div>
                        <p className="text-xs font-medium uppercase">Location</p>
                        <p className="text-foreground font-medium">{user.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills?.split(',').map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Bio
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {user.bio || 'No bio provided yet.'}
                      </p>
                    </div>

                    {user.linkedin_url && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <LinkIcon className="w-5 h-5" />
                        <a
                          href={user.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <DashboardSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
