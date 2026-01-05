import { useEffect, useState } from 'react'
import { useRoute, useLocation } from 'wouter'
import { supabase, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MapPin, Briefcase, Mail, Link as LinkIcon, ArrowLeft, MessageSquare, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileView() {
  const [, params] = useRoute('/profile/:id')
  const [, setLocation] = useLocation()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchUserProfile(params.id)
    }
  }, [params?.id])

  const fetchUserProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Profile not found')
      setLocation('/directory')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!currentUser || !user) return
    setConnecting(true)
    try {
      const { error } = await supabase
        .from('connections')
        .insert([
          { user_id: currentUser.id, connected_user_id: user.id, status: 'pending' }
        ])
      
      if (error) throw error
      toast.success('Connection request sent!')
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Connection request already sent')
      } else {
        console.error('Error connecting:', error)
        toast.error('Failed to send connection request')
      }
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/directory')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>

        <Card className="p-8 border-2 border-[#D0D6B5]">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 bg-[#EE7674]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#EE7674] font-bold text-4xl">
                {name.charAt(0)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{name}</h1>
                  {user.batch && (
                    <p className="text-lg text-muted-foreground">Batch of {user.batch}</p>
                  )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    onClick={handleConnect} 
                    disabled={connecting}
                    className="flex-1 md:flex-none bg-primary hover:bg-primary/90"
                  >
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    Connect
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation(`/messages?to=${user.id}`)}
                    className="flex-1 md:flex-none"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {user.designation && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider">Designation</p>
                      <p className="text-foreground">{user.designation}</p>
                    </div>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider">Company</p>
                      <p className="text-foreground">{user.company}</p>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider">Location</p>
                      <p className="text-foreground">{user.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider">Email</p>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}

              {user.skills && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.split(',').map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.linkedin_url && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Professional Links</h2>
                  <a 
                    href={user.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
