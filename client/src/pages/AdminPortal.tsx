import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, BarChart3, Users, FileText, AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react'

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
  const [users, setUsers] = useState<any[]>([])
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (adminUser?.is_admin) {
        setIsAdmin(true)
        fetchAdminData()
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })

      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      const { count: newsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })

      // Fetch pending content
      const { data: pendingNews } = await supabase
        .from('news')
        .select('*')
        .eq('featured', false)
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: allJobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalUsers: usersCount || 0,
        totalJobs: jobsCount || 0,
        totalEvents: eventsCount || 0,
        totalNews: newsCount || 0,
        pendingContent: pendingNews?.length || 0,
        reportedUsers: 0,
      })

      setNews(pendingNews || [])
      setJobs(allJobs || [])
      setUsers(allUsers || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    }
  }

  const handleFeatureContent = async (contentId: string, table: string) => {
    try {
      await supabase
        .from(table)
        .update({ featured: true })
        .eq('id', contentId)

      fetchAdminData()
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Error featuring content:', error)
    }
  }

  const handleDeleteContent = async (contentId: string, table: string) => {
    try {
      await supabase
        .from(table)
        .delete()
        .eq('id', contentId)

      fetchAdminData()
      setShowDetailDialog(false)
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', userId)

      fetchAdminData()
    } catch (error) {
      console.error('Error blocking user:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Admin Portal</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="content">Content Moderation</TabsTrigger>
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Content Moderation */}
          <TabsContent value="content" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">News & Stories</h2>
            {news.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending content</p>
              </Card>
            ) : (
              news.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    </div>
                    {item.featured && <Badge className="bg-accent">Featured</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContent({ ...item, table: 'news' })
                        setShowDetailDialog(true)
                      }}
                    >
                      View Details
                    </Button>
                    {!item.featured && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleFeatureContent(item.id, 'news')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Feature
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteContent(item.id, 'news')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Jobs */}
          <TabsContent value="jobs" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">Job Listings</h2>
            {jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No jobs posted</p>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                      <p className="text-sm text-primary font-semibold">{job.company}</p>
                    </div>
                    <Badge variant="secondary">{job.job_type}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteContent(job.id, 'jobs')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">User Management</h2>
            {users.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </Card>
            ) : (
              users.map((u) => (
                <Card key={u.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      {u.company && <p className="text-sm text-foreground">{u.company}</p>}
                    </div>
                    {u.is_blocked && <Badge className="bg-destructive">Blocked</Badge>}
                    {u.is_admin && <Badge className="bg-primary">Admin</Badge>}
                  </div>

                  <div className="flex gap-2">
                    {!u.is_blocked && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBlockUser(u.id)}
                      >
                        Block User
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Content</p>
                <p className="text-foreground">{selectedContent.content}</p>
              </div>

              {selectedContent.category && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Category</p>
                  <Badge variant="secondary">{selectedContent.category}</Badge>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {!selectedContent.featured && (
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() =>
                      handleFeatureContent(selectedContent.id, selectedContent.table)
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Feature Content
                  </Button>
                )}
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() =>
                    handleDeleteContent(selectedContent.id, selectedContent.table)
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
