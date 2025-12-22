import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Users, Calendar, MessageSquare, Plus, UserCheck } from 'lucide-react'

interface Batch {
  id: string
  batch_year: string
  total_members: number
  coordinator_id: string
  created_at: string
}

interface BatchEvent {
  id: string
  batch_id: string
  title: string
  event_date: string
  location: string
  description: string
  registrations_count: number
}

export default function BatchReunion() {
  const { user } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [batchMembers, setBatchMembers] = useState<any[]>([])
  const [batchEvents, setBatchEvents] = useState<BatchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false)
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false)

  const [batchFormData, setBatchFormData] = useState({
    batch_year: new Date().getFullYear().toString(),
  })

  const [eventFormData, setEventFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    description: '',
  })

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchDetails()
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('batch_year', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatchDetails = async () => {
    if (!selectedBatch) return

    try {
      // Fetch batch members
      const { data: members } = await supabase
        .from('users')
        .select('*')
        .eq('batch', selectedBatch.batch_year)

      // Fetch batch events
      const { data: events } = await supabase
        .from('batch_events')
        .select('*')
        .eq('batch_id', selectedBatch.id)
        .order('event_date', { ascending: false })

      setBatchMembers(members || [])
      setBatchEvents(events || [])
    } catch (error) {
      console.error('Error fetching batch details:', error)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)
    try {
      const { error } = await supabase.from('batches').insert({
        batch_year: batchFormData.batch_year,
        coordinator_id: user.id,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setBatchFormData({ batch_year: new Date().getFullYear().toString() })
      setShowCreateBatchDialog(false)
      fetchBatches()
    } catch (error) {
      console.error('Error creating batch:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return

    setCreating(true)
    try {
      const { error } = await supabase.from('batch_events').insert({
        batch_id: selectedBatch.id,
        title: eventFormData.title,
        event_date: eventFormData.event_date,
        location: eventFormData.location,
        description: eventFormData.description,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setEventFormData({ title: '', event_date: '', location: '', description: '' })
      setShowCreateEventDialog(false)
      fetchBatchDetails()
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Batch Reunion Coordinator</h1>
            <p className="text-lg text-muted-foreground">
              Organize and manage alumni batch reunions and events
            </p>
          </div>
          {user && (
            <Dialog open={showCreateBatchDialog} onOpenChange={setShowCreateBatchDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch_year">Batch Year</Label>
                    <Input
                      id="batch_year"
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={batchFormData.batch_year}
                      onChange={(e) =>
                        setBatchFormData({ ...batchFormData, batch_year: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Batch'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateBatchDialog(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {batches.map((batch) => (
            <Card
              key={batch.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedBatch?.id === batch.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedBatch(batch)}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Batch {batch.batch_year}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Users className="w-4 h-4" />
                <span>{batch.total_members} members</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedBatch(batch)}
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* Batch Details */}
        {selectedBatch && (
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="members">
                <Users className="w-4 h-4 mr-2" />
                Members ({batchMembers.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events ({batchEvents.length})
              </TabsTrigger>
              <TabsTrigger value="messaging">
                <MessageSquare className="w-4 h-4 mr-2" />
                Group Chat
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Batch {selectedBatch.batch_year} Members
              </h2>
              {batchMembers.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No members in this batch yet</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batchMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{member.name}</h4>
                          <p className="text-sm text-primary font-semibold">
                            {member.designation || 'Professional'}
                          </p>
                        </div>
                        {member.email_verified && (
                          <UserCheck className="w-5 h-5 text-green-500" />
                        )}
                      </div>

                      {member.company && (
                        <p className="text-sm text-muted-foreground mb-2">{member.company}</p>
                      )}

                      {member.location && (
                        <p className="text-xs text-muted-foreground">{member.location}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Reunion Events</h2>
                {user?.id === selectedBatch.coordinator_id && (
                  <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Reunion Event</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Event Title</Label>
                          <Input
                            id="title"
                            placeholder="e.g., Batch 2020 Reunion Dinner"
                            value={eventFormData.title}
                            onChange={(e) =>
                              setEventFormData({ ...eventFormData, title: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="event_date">Date & Time</Label>
                            <Input
                              id="event_date"
                              type="datetime-local"
                              value={eventFormData.event_date}
                              onChange={(e) =>
                                setEventFormData({
                                  ...eventFormData,
                                  event_date: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="e.g., JEC Campus, Jabalpur"
                              value={eventFormData.location}
                              onChange={(e) =>
                                setEventFormData({
                                  ...eventFormData,
                                  location: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the reunion event..."
                            value={eventFormData.description}
                            onChange={(e) =>
                              setEventFormData({
                                ...eventFormData,
                                description: e.target.value,
                              })
                            }
                            className="min-h-24"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            disabled={creating}
                          >
                            {creating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create Event'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateEventDialog(false)}
                            disabled={creating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {batchEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reunion events scheduled yet</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {batchEvents.map((event) => (
                    <Card key={event.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.event_date)}
                            </span>
                            {event.location && (
                              <span>{event.location}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {event.registrations_count} registered
                        </Badge>
                      </div>

                      {event.description && (
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                      )}

                      <Button variant="outline" className="w-full">
                        View & RSVP
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Messaging Tab */}
            <TabsContent value="messaging" className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Batch {selectedBatch.batch_year} Group Chat
              </h2>
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Group messaging coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Connect with your batch mates in real-time
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
