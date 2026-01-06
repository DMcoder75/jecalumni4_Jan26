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
import { Loader2, User as UserIcon, Mail, Briefcase, MapPin, Link as LinkIcon, Edit2, Save, X, LogOut, Settings } from 'lucide-react'
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
    <div className="min-h-screen bg-white py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-9 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b-2 border-[#D0D6B5]/30">
              <div>
                <h1 className="text-5xl font-black text-[#1F1F1F] tracking-tighter mb-2">My Dashboard</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-lg text-[#4A4A4A] font-medium">Welcome back, <span className="text-[#EE7674] font-bold">{user.name}</span></p>
                  {user.is_mentor ? (
                    <Badge className="bg-[#987284] text-white px-3 py-1 text-xs font-black uppercase tracking-widest">Mentor</Badge>
                  ) : user.mentor_status === 'pending' ? (
                    <Badge variant="outline" className="text-[#987284] border-[#987284] font-bold">Mentor request pending</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-[#987284]/10 hover:bg-[#987284]/20 text-[#987284] border-[#987284] font-bold h-8"
                      onClick={handleBecomeMentor}
                      disabled={applyingMentor}
                    >
                      {applyingMentor ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                      Become a Mentor
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setLocation('/profile-setup')} className="border-2 border-[#1F1F1F] text-[#1F1F1F] font-black hover:bg-[#1F1F1F]/5">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="border-2 border-[#EE7674] text-[#EE7674] font-black hover:bg-[#EE7674]/5">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-8 text-center border-2 border-[#D0D6B5] shadow-none hover:shadow-xl transition-all">
                <p className="text-4xl font-black text-[#EE7674] mb-1">{stats.connections}</p>
                <p className="text-xs font-black text-[#1F1F1F] uppercase tracking-widest">Connections</p>
              </Card>
              <Card className="p-8 text-center border-2 border-[#D0D6B5] shadow-none hover:shadow-xl transition-all">
                <p className="text-4xl font-black text-[#987284] mb-1">{stats.mentorships}</p>
                <p className="text-xs font-black text-[#1F1F1F] uppercase tracking-widest">Mentorships</p>
              </Card>
              <Card className="p-8 text-center border-2 border-[#D0D6B5] shadow-none hover:shadow-xl transition-all">
                <p className="text-4xl font-black text-[#9DBF9E] mb-1">{stats.jobApplications}</p>
                <p className="text-xs font-black text-[#1F1F1F] uppercase tracking-widest">Job Apps</p>
              </Card>
              <Card className="p-8 text-center border-2 border-[#D0D6B5] shadow-none hover:shadow-xl transition-all">
                <p className="text-4xl font-black text-[#1F1F1F] mb-1">{stats.eventsAttended}</p>
                <p className="text-xs font-black text-[#1F1F1F] uppercase tracking-widest">Events</p>
              </Card>
            </div>

            {/* Connections Section */}
            <div className="space-y-10">
              <ConnectionsManager />
              <MyConnections />
            </div>

            {/* Profile Section */}
            <Card className="p-10 border-2 border-[#1F1F1F] shadow-none">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#1F1F1F] tracking-tight">Profile Information</h2>
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-[#1F1F1F] text-white font-black px-6"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditing(false)}
                    variant="outline"
                    className="border-2 border-[#EE7674] text-[#EE7674] font-black"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Full Name</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold"
                        value={formData.name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Email</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold opacity-50"
                        value={user.email}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Batch Year</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold"
                        value={formData.batch || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, batch: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Company</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold"
                        value={formData.company || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Job Title</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold"
                        value={formData.designation || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, designation: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Location</Label>
                      <Input
                        className="border-2 border-[#D0D6B5] font-bold"
                        value={formData.location || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Skills (comma separated)</Label>
                    <Input
                      className="border-2 border-[#D0D6B5] font-bold"
                      value={formData.skills || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      placeholder="React, Node.js, Project Management..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Bio</Label>
                    <Textarea
                      className="border-2 border-[#D0D6B5] font-bold min-h-[120px]"
                      value={formData.bio || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-[#EE7674] hover:bg-[#EE7674]/90 text-white font-black py-6 text-lg shadow-lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#EE7674]/10 rounded-xl">
                        <UserIcon className="w-6 h-6 text-[#EE7674]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Full Name</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#987284]/10 rounded-xl">
                        <Mail className="w-6 h-6 text-[#987284]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Address</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#9DBF9E]/10 rounded-xl">
                        <Briefcase className="w-6 h-6 text-[#9DBF9E]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Role</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">
                          {user.designation || 'Alumni'} at {user.company || 'JEC'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#D0D6B5]/20 rounded-xl">
                        <MapPin className="w-6 h-6 text-[#1F1F1F]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                        <p className="text-xl font-bold text-[#1F1F1F]">{user.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Skills & Expertise
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills ? user.skills.split(',').map((skill, index) => (
                          <Badge key={index} className="bg-[#F9B5AC]/20 text-[#EE7674] border-none font-bold px-3 py-1">
                            {skill.trim()}
                          </Badge>
                        )) : <p className="text-sm text-muted-foreground italic">No skills added yet</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Professional Bio
                      </p>
                      <p className="text-base text-[#4A4A4A] font-medium leading-relaxed">
                        {user.bio || 'No bio provided yet. Tell the community about yourself!'}
                      </p>
                    </div>

                    {user.linkedin_url && (
                      <div className="pt-4">
                        <a
                          href={user.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#EE7674] font-black hover:underline"
                        >
                          <LinkIcon className="w-5 h-5" />
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Reduced width and improved styling */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <DashboardSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
