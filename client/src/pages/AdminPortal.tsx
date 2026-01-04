import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Calendar
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { sendEmail } from '@/lib/email'

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

  const [news, setNews] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
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
        .eq('featured', false)
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

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
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to fetch admin data')
    }
  }

  const handleApprove = async (userId: string, userEmail: string, userName: string) => {
    setActionLoading(userId)
    try {
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', userId)
      
      if (error) throw error

      // Send approval email via client-side service
      await sendEmail({
        to_email: userEmail,
        to_name: userName,
        subject: 'Account Approved - JEC MCA Alumni',
        message: `Hello ${userName},\n\nYour account has been approved. You can now log in to the JEC MCA Alumni platform.`
      })

      toast.success('User approved and notification sent!')
      fetchAdminData()
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Error approving user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId: string, userEmail: string, userName: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return
    
    setActionLoading(userId)
    try {
      // Generate a simple random password
      const newPassword = Math.random().toString(36).slice(-8)
      
      // Update in Supabase (using password_hash field as plain text for now as per user request)
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPassword })
        .eq('id', userId)
      
      if (error) throw error

      // Send email
      await sendEmail({
        to_email: userEmail,
        to_name: userName,
        subject: 'Password Reset - JEC MCA Alumni',
        message: `Hello ${userName},\n\nYour password has been reset. Your new password is: ${newPassword}`
      })

      toast.success('Password reset and sent to user!')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Error resetting password')
    } finally {
      setActionLoading(null)
    }
  }

  const handleFeatureContent = async (contentId: string, table: string) => {
    try {
      await supabase.from(table).update({ featured: true }).eq('id', contentId)
      fetchAdminData()
      setShowDetailDialog(false)
      toast.success('Content featured!')
    } catch (error) {
      console.error('Error featuring content:', error)
      toast.error('Failed to feature content')
    }
  }

  const handleDeleteContent = async (contentId: string, table: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    try {
      await supabase.from(table).delete().eq('id', contentId)
      fetchAdminData()
      setShowDetailDialog(false)
      toast.success('Content deleted!')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have admin privileges</p>
        </Card>
      </div>
    )
  }

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-foreground">{pendingUsers.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalJobs}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Content</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingContent}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="requests">Signup Requests</TabsTrigger>
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
                      {u.description && (
                        <div className="mt-4 p-3 bg-secondary rounded-lg text-sm italic">
                          "{u.description}"
                        </div>
                      )}
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
                      <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetPassword(u.id, u.email, `${u.first_name} ${u.last_name}`)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="content" className="p-12 text-center">
            <p className="text-muted-foreground">Content management coming soon...</p>
          </TabsContent>
          <TabsContent value="jobs" className="p-12 text-center">
            <p className="text-muted-foreground">Job management coming soon...</p>
          </TabsContent>
          <TabsContent value="events" className="p-12 text-center">
            <p className="text-muted-foreground">Event management coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
