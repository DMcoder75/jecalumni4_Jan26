import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, MessageSquare, Users } from 'lucide-react'
import { useLocation } from 'wouter'

interface ConnectionUser {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
  batch: string
  designation: string
}

interface Connection {
  id: string
  user_id: string
  connected_user_id: string
  status: string
  other_user: ConnectionUser
}

export default function MyConnections() {
  const { user } = useAuth()
  const [, setLocation] = useLocation()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchConnections()
    }
  }, [user])

  const fetchConnections = async () => {
    if (!user) return
    try {
      // Fetch connections where user is sender
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          other_user:users!connections_connected_user_id_fkey (
            id, first_name, last_name, email, company, batch, designation
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      // Fetch connections where user is recipient
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          *,
          other_user:users!connections_user_id_fkey (
            id, first_name, last_name, email, company, batch, designation
          )
        `)
        .eq('connected_user_id', user.id)
        .eq('status', 'accepted')

      if (sentError) throw sentError
      if (receivedError) throw receivedError

      setConnections([...(sentData || []), ...(receivedData || [])])
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
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
        <h2 className="text-xl font-bold text-foreground">My Connections</h2>
      </div>

      {connections.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2">
          <p className="text-muted-foreground">You haven't connected with anyone yet.</p>
          <Button 
            variant="link" 
            onClick={() => setLocation('/directory')}
            className="text-primary mt-2"
          >
            Browse Directory
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => {
            const other = conn.other_user
            const name = `${other.first_name || ''} ${other.last_name || ''}`.trim() || other.email.split('@')[0]
            
            return (
              <Card key={conn.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {other.designation ? `${other.designation}` : ''}
                      {other.company ? ` at ${other.company}` : ''}
                    </p>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setLocation(`/messages?to=${other.id}`)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
