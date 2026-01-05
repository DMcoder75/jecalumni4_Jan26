import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserCheck, UserX, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Connection {
  id: string
  user_id: string
  connected_user_id: string
  status: string
  created_at: string
  sender?: {
    id: string
    name: string
    first_name: string
    last_name: string
    email: string
    company: string
    batch: string
  }
}

export default function ConnectionsManager() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return
    try {
      // Fetch incoming requests where the current user is the 'connected_user_id'
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          sender:users!connections_user_id_fkey (
            id, first_name, last_name, email, company, batch
          )
        `)
        .eq('connected_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(requestId)
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error
      
      toast.success(status === 'accepted' ? 'Connection approved!' : 'Request ignored')
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Error updating connection:', error)
      toast.error('Failed to update connection')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Connection Requests</h2>
        {requests.length > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {requests.length} New
          </Badge>
        )}
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No pending connection requests</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const sender = req.sender
            const name = sender?.name || `${sender?.first_name || ''} ${sender?.last_name || ''}`.trim() || sender?.email?.split('@')[0] || 'Unknown User'
            
            return (
              <Card key={req.id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sender?.batch ? `Batch ${sender.batch}` : ''} 
                      {sender?.company ? ` • ${sender.company}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(req.id, 'accepted')}
                    disabled={actionLoading === req.id}
                  >
                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10"
                    onClick={() => handleAction(req.id, 'rejected')}
                    disabled={actionLoading === req.id}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Ignore
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
