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
  const [actionLoading, setActionLoading] = useState<number | null>(null)
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
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (user && user.isAdmin) {
      setIsAdmin(true)
      fetchAdminData()
    } else {
      setIsAdmin(false)
    }
    setLoading(false)
  }

  const fetchAdminData = async () => {
    try {
      // Fetch all users from our API
      const token = localStorage.getItem('session_token')
      const userResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const userData = await userResponse.json()
      setAllUsers(userData)

      // Fetch other stats from Supabase (if still used for content)
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
        totalUsers: userData.length || 0,
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
    }
  }

  const handleApprove = async (userId: number) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem('session_token')
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId }),
      })
      if (!response.ok) throw new Error('Failed to approve user')
      toast.success('User approved and credentials sent!')
      fetchAdminData()
    } catch (error) {
      toast.error('Error approving user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId: number) => {
    if (!confirm('Are you sure you want to reset this user\'s password? A new one will be sent to their email.')) return
    
    setActionLoading(userId)
    try {
      const token = localStorage.getItem('session_token')
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId }),
      })
      if (!response.ok) throw new Error('Failed to reset password')
      toast.success('Password reset and sent to user!')
    } catch (error) {
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
    } catch (error) {
      console.error('Error featuring content:', error)
    }
  }

  const handleDeleteContent = async (contentId: string, table: string) => {
    try {
      await supabase.from(table).delete().eq('id', contentId)
      fetchAdminData()
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Error deleting content:', error)
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
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingUsers = filteredUsers.filter(u => !u.emailVerified)
  const activeUsers = filteredUsers.filter(u => u.emailVerified)

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
                        <h3 className="text-lg font-bold">{u.firstName} {u.lastName}</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{u.email}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg text-sm italic">"{u.description}"</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleApprove(u.id)}
                        disabled={actionLoading === u.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
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

          {/* Active Users */}
          <TabsContent value="active-users" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Active User Directory</h2>
            <Card className="overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="p-4 font-semibold text-sm">Name</th>
                    <th className="p-4 font-semibold text-sm">Email</th>
                    <th className="p-4 font-semibold text-sm">Role</th>
                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="p-4 text-sm font-medium">{u.firstName} {u.lastName}</td>
                      <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="p-4"><Badge variant="secondary">{u.role}</Badge></td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResetPassword(u.id)}
                          disabled={actionLoading === u.id}
                          className="text-primary hover:bg-primary/10"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                          Reset Password
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="content" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">News & Stories</h2>
            {news.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedContent({ ...item, table: 'news' }); setShowDetailDialog(true); }}>View Details</Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleFeatureContent(item.id, 'news')}><Eye className="w-4 h-4 mr-2" />Feature</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteContent(item.id, 'news')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Jobs */}
          <TabsContent value="jobs" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Job Listings</h2>
            {jobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                    <p className="text-sm text-primary font-semibold">{job.company}</p>
                  </div>
                  <Badge variant="secondary">{job.job_type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteContent(job.id, 'jobs')}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedContent?.title}</DialogTitle></DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div><p className="text-sm text-muted-foreground mb-2">Content</p><p className="text-foreground">{selectedContent.content}</p></div>
              <div className="flex gap-2 pt-4">
                {!selectedContent.featured && <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleFeatureContent(selectedContent.id, selectedContent.table)}><Eye className="w-4 h-4 mr-2" />Feature Content</Button>}
                <Button className="flex-1" variant="destructive" onClick={() => handleDeleteContent(selectedContent.id, selectedContent.table)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
