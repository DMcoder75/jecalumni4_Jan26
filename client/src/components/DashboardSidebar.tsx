import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Star,
  ChevronRight,
  Clock
} from 'lucide-react'
import { useLocation } from 'wouter'

export default function DashboardSidebar() {
  const [, setLocation] = useLocation()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [topMentors, setTopMentors] = useState<any[]>([])
  const [latestJobs, setLatestJobs] = useState<any[]>([])
  const [latestDiscussions, setLatestDiscussions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSidebarData()
  }, [])

  const fetchSidebarData = async () => {
    try {
      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3)

      // Fetch top mentors (based on skills and being a mentor)
      const { data: mentors } = await supabase
        .from('users')
        .select('*')
        .eq('is_mentor', true)
        .limit(3)

      // Fetch latest jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch latest discussions
      const { data: discussions } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      setUpcomingEvents(events || [])
      setTopMentors(mentors || [])
      setLatestJobs(jobs || [])
      setLatestDiscussions(discussions || [])
    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Events
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/events')} className="text-xs h-7 px-2">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No upcoming events</p>
          ) : (
            upcomingEvents.map(event => (
              <Card key={event.id} className="p-3 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLocation('/events')}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {formatDate(event.event_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1 h-4">
                    {event.event_type}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Top Mentors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Top Mentors
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/mentorship')} className="text-xs h-7 px-2">
            Explore
          </Button>
        </div>
        <div className="space-y-3">
          {topMentors.map(mentor => (
            <div key={mentor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLocation(`/profile/${mentor.id}`)}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {mentor.first_name?.[0] || mentor.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mentor.first_name} {mentor.last_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{mentor.company || 'JEC Alumni'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Jobs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            Latest Jobs
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/jobs')} className="text-xs h-7 px-2">
            Browse
          </Button>
        </div>
        <div className="space-y-3">
          {latestJobs.map(job => (
            <div key={job.id} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLocation('/jobs')}>
              <p className="text-sm font-medium truncate">{job.title}</p>
              <p className="text-[10px] text-muted-foreground">{job.company}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Discussions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-500" />
            Discussions
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/discussion')} className="text-xs h-7 px-2">
            Join
          </Button>
        </div>
        <div className="space-y-3">
          {latestDiscussions.map(post => (
            <div key={post.id} className="p-2 rounded-lg border-l-2 border-primary/20 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setLocation('/discussion')}>
              <p className="text-xs line-clamp-2 italic">"{post.content}"</p>
              <p className="text-[10px] text-muted-foreground mt-1">— {post.user?.first_name || 'Alumni'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
