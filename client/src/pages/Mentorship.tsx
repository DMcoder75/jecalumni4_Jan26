import { useEffect, useState } from 'react'
import { supabase, type User, type Mentorship } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Users, Star, Plus } from 'lucide-react'

export default function Mentorship() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState<User[]>([])
  const [myMentorships, setMyMentorships] = useState<Mentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)

  const [requestData, setRequestData] = useState({
    expertise: '',
    message: '',
  })

  useEffect(() => {
    fetchMentors()
    if (user) {
      fetchMyMentorships()
    }
  }, [user])

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_mentor', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMentors(data || [])
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyMentorships = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)

      if (error) throw error
      setMyMentorships(data || [])
    } catch (error) {
      console.error('Error fetching mentorships:', error)
    }
  }

  const handleRequestMentorship = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMentorId) return

    setRequesting(true)
    try {
      const { error } = await supabase.from('mentorships').insert({
        mentor_id: selectedMentorId,
        mentee_id: user.id,
        expertise: requestData.expertise,
        status: 'pending',
      })

      if (error) throw error

      setRequestData({ expertise: '', message: '' })
      setShowRequestDialog(false)
      setSelectedMentorId(null)
      fetchMyMentorships()
    } catch (error) {
      console.error('Error requesting mentorship:', error)
    } finally {
      setRequesting(false)
    }
  }

  const handleAcceptMentorship = async (mentorshipId: string) => {
    try {
      const { error } = await supabase
        .from('mentorships')
        .update({ status: 'active' })
        .eq('id', mentorshipId)

      if (error) throw error
      fetchMyMentorships()
    } catch (error) {
      console.error('Error accepting mentorship:', error)
    }
  }

  const isMentor = user?.is_mentor || false

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mentorship Program</h1>
          <p className="text-lg text-muted-foreground">
            Learn from experienced alumni mentors or become a mentor yourself
          </p>
        </div>

        {/* My Mentorships */}
        {user && myMentorships.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">My Mentorships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myMentorships.map((mentorship) => (
                <Card key={mentorship.id} className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {mentorship.mentor_id === user.id ? 'Mentee' : 'Mentor'} Relationship
                      </p>
                      <Badge
                        className={
                          mentorship.status === 'active'
                            ? 'bg-green-500/10 text-green-700'
                            : 'bg-yellow-500/10 text-yellow-700'
                        }
                      >
                        {mentorship.status}
                      </Badge>
                    </div>
                  </div>

                  {mentorship.expertise && (
                    <p className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Expertise:</span> {mentorship.expertise}
                    </p>
                  )}

                  {mentorship.status === 'pending' && mentorship.mentor_id === user.id && (
                    <Button
                      onClick={() => handleAcceptMentorship(mentorship.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Accept Mentorship
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mentors List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Available Mentors</h2>
            {isMentor && (
              <Badge className="bg-primary/10 text-primary">You are a mentor</Badge>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : mentors.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No mentors available yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for mentors in your field
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {mentor.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{mentor.name}</h3>
                      <p className="text-sm text-primary font-semibold">
                        {mentor.designation || 'Professional'}
                      </p>
                    </div>
                  </div>

                  {mentor.company && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{mentor.company}</span>
                    </p>
                  )}

                  {mentor.mentor_expertise && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Expertise
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.mentor_expertise
                          .split(',')
                          .slice(0, 3)
                          .map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}

                  {user && user.id !== mentor.id && (
                    <Dialog open={showRequestDialog && selectedMentorId === mentor.id} onOpenChange={(open) => {
                      if (!open) setSelectedMentorId(null)
                      setShowRequestDialog(open)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => setSelectedMentorId(mentor.id)}
                        >
                          Request Mentorship
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Mentorship from {mentor.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRequestMentorship} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="expertise">Area of Expertise Needed</Label>
                            <Input
                              id="expertise"
                              placeholder="e.g., Career transition, Leadership skills"
                              value={requestData.expertise}
                              onChange={(e) =>
                                setRequestData({
                                  ...requestData,
                                  expertise: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Message (optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Tell the mentor why you'd like to work with them..."
                              value={requestData.message}
                              onChange={(e) =>
                                setRequestData({
                                  ...requestData,
                                  message: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              className="flex-1 bg-primary hover:bg-primary/90"
                              disabled={requesting}
                            >
                              {requesting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                'Send Request'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowRequestDialog(false)
                                setSelectedMentorId(null)
                              }}
                              disabled={requesting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
