import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Loader2, 
  BarChart3, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Eye, 
  RefreshCw, 
  UserPlus,
  Search,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { sendUserCredentials } from '@/lib/email'

interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalEvents: number
  totalNews: number
  pendingContent: number
  reportedUsers: number
}

export default function AdminPortal() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalNews: 0,
    pendingContent: 0,
    reportedUsers: 0,
  })
  const [mentorApplications, setMentorApplications] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    } else {
      const timer = setTimeout(() => {
        if (!user) setLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (user && user.is_admin) {
      setIsAdmin(true)
      fetchAdminData()
    } else {
      setIsAdmin(false)
    }
    setLoading(false)
  }

  const fetchAdminData = async () => {
    try {
      // Fetch all users directly from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userError) throw userError
      setAllUsers(userData || [])

      // Fetch other stats from Supabase
      const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
      const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })
      const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true })

      const { data: pendingNews } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      setStats({
        totalUsers: userData?.length || 0,
        totalJobs: jobsCount || 0,
        totalEvents: eventsCount || 0,
        totalNews: newsCount || 0,
        pendingContent: pendingNews?.length || 0,
        reportedUsers: 0,
      })

      setNews(pendingNews || [])
      setJobs(jobsData || [])
      setEvents(eventsData || [])

      // Fetch mentor applications
      const { data: mentorApps } = await supabase
        .from('users')
        .select('*')
        .eq('mentor_status', 'pending')
        .order('mentor_application_date', { ascending: false })
      
      setMentorApplications(mentorApps || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to fetch admin data')
    }
  }

  const handleApprove = async (userId: string, userEmail: string, userName: string) => {
    setActionLoading(userId)
    try {
      const generatedPassword = Math.random().toString(36).slice(-10);
      const { error } = await supabase
        .from('users')
        .update({ 
          email_verified: true,
          password_hash: generatedPassword 
        })
        .eq('id', userId)
      
      if (error) throw error
      await sendUserCredentials(userEmail, userName, generatedPassword, true)
      toast.success('User approved and credentials emailed!')
      fetchAdminData()
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Error approving user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveMentor = async (userId: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_mentor: true,
          mentor_status: 'approved'
        })
        .eq('id', userId)
      
      if (error) throw error
      toast.success('Mentor application approved!')
      fetchAdminData()
    } catch (error) {
      console.error('Error approving mentor:', error)
      toast.error('Error approving mentor')
    } finally {
      setActionLoading(null)
    }
  }

  const handleNominateMentor = async (userId: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_mentor: true, mentor_status: 'approved' })
        .eq('id', userId)
      
      if (error) throw error
      toast.success('User nominated as mentor!')
      fetchAdminData()
    } catch (error) {
      console.error('Error nominating mentor:', error)
      toast.error('Error nominating mentor')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId: string, userEmail: string, userName: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return
    
    setActionLoading(userId)
    try {
      const newPassword = Math.random().toString(36).slice(-10);
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPassword })
        .eq('id', userId)
      
      if (error) throw error
      await sendUserCredentials(userEmail, userName, newPassword, false)
      toast.success('Password reset and new credentials emailed!')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Error resetting password')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    setActionLoading(eventId)
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      toast.success('Event deleted successfully')
      fetchAdminData()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setActionLoading(null)
    }
  }

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date)
    const now = new Date()
    if (eventDate < now) return 'past'
    if (eventDate.toDateString() === now.toDateString()) return 'active'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have administrator privileges to access this portal.
          </p>
          <Button onClick={() => window.location.href = '/'}>Return Home</Button>
        </Card>
      </div>
    )
  }

  const filteredUsers = allUsers.filter(u => 
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingUsers = filteredUsers.filter(u => !u.email_verified)
  const activeUsers = filteredUsers.filter(u => u.email_verified)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Portal</h1>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-[#987284]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#987284] mb-1 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-black text-[#1F1F1F]">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-[#987284]" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-[#EE7674]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#EE7674] mb-1 uppercase tracking-wider">Pending Requests</p>
                <p className="text-3xl font-black text-[#1F1F1F]">{pendingUsers.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-[#EE7674]" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-[#9DBF9E]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#9DBF9E] mb-1 uppercase tracking-wider">Active Jobs</p>
                <p className="text-3xl font-black text-[#1F1F1F]">{stats.totalJobs}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#9DBF9E]" />
            </div>
          </Card>
          <Card className="p-6 border-2 border-[#D0D6B5]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#D0D6B5] mb-1 uppercase tracking-wider">Total Events</p>
                <p className="text-3xl font-black text-[#1F1F1F]">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#D0D6B5]" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="requests">Signup Requests</TabsTrigger>
            <TabsTrigger value="mentor-apps">Mentor Apps</TabsTrigger>
            <TabsTrigger value="active-users">Active Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Signup Requests */}
          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pending Signup Requests</h2>
            {pendingUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              pendingUsers.map((u) => (
                <Card key={u.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{u.first_name} {u.last_name}</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {u.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Requested on {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleApprove(u.id, u.email, `${u.first_name} ${u.last_name}`)}
                        disabled={actionLoading === u.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Mentor Applications */}
          <TabsContent value="mentor-apps" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pending Mentor Applications</h2>
            {mentorApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending mentor applications</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {mentorApplications.map((app) => (
                  <Card key={app.id} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-bold">{app.first_name} {app.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        <p className="text-sm">Batch: {app.batch} | Company: {app.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveMentor(app.id)}
                          disabled={actionLoading === app.id}
                        >
                          {actionLoading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Mentor'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Users */}
          <TabsContent value="active-users" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Active Alumni</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUsers.map((u) => (
                <Card key={u.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{u.first_name} {u.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="flex gap-2 mt-2">
                        {u.is_admin && <Badge className="bg-primary">Admin</Badge>}
                        {u.is_mentor && <Badge variant="outline">Mentor</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!u.is_mentor && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary border-primary hover:bg-primary/10"
                          onClick={() => handleNominateMentor(u.id)}
                          disabled={actionLoading === u.id}
                        >
                          Make Mentor
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetPassword(u.id, u.email, `${u.first_name} ${u.last_name}`)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Event Management</h2>
            <div className="grid grid-cols-1 gap-4">
              {events.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No events found</p>
                </Card>
              ) : (
                events.map((event) => {
                  const status = getEventStatus(event.event_date)
                  return (
                    <Card key={event.id} className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold">{event.title}</h3>
                            <Badge 
                              variant={status === 'active' ? 'default' : 'outline'}
                              className={status === 'active' ? 'bg-green-600' : status === 'past' ? 'bg-gray-200' : 'bg-blue-50'}
                            >
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.event_date).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location || 'No location'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.registrations_count || 0} Registered
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2 mt-2">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={actionLoading === event.id}
                          >
                            {actionLoading === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="content" className="p-12 text-center">
            <p className="text-muted-foreground">Content management coming soon...</p>
          </TabsContent>
          <TabsContent value="jobs" className="p-12 text-center">
            <p className="text-muted-foreground">Job management coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
