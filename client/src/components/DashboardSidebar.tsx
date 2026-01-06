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
  Clock,
  Newspaper,
  MapPin
} from 'lucide-react'
import { useLocation } from 'wouter'

export default function DashboardSidebar() {
  const [, setLocation] = useLocation()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [topMentors, setTopMentors] = useState<any[]>([])
  const [latestJobs, setLatestJobs] = useState<any[]>([])
  const [latestDiscussions, setLatestDiscussions] = useState<any[]>([])
  const [latestNews, setLatestNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSidebarData()
  }, [])

  const fetchSidebarData = async () => {
    try {
      // Fetch upcoming events - remove status filter to ensure all upcoming show
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3)

      // Fetch top mentors
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

      // Fetch latest news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      setUpcomingEvents(events || [])
      setTopMentors(mentors || [])
      setLatestJobs(jobs || [])
      setLatestDiscussions(discussions || [])
      setLatestNews(newsData || [])
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
      {/* Upcoming Events - Branded with #D0D6B5 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-tighter text-sm">
            <Calendar className="w-4 h-4 text-[#D0D6B5]" />
            Upcoming Events
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/events')} className="text-[10px] h-6 px-2 font-bold text-muted-foreground hover:text-primary">
            VIEW ALL
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <Card className="p-4 border-2 border-dashed border-[#D0D6B5]/30 bg-transparent text-center">
              <p className="text-xs text-muted-foreground italic">No upcoming events scheduled</p>
            </Card>
          ) : (
            upcomingEvents.map(event => (
              <Card key={event.id} className="p-3 border-2 border-[#D0D6B5]/20 hover:border-[#D0D6B5] transition-all cursor-pointer group" onClick={() => setLocation('/events')}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-primary transition-colors">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D0D6B5]" /> {formatDate(event.event_date)}
                      </p>
                      {event.location && (
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#D0D6B5]" /> {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-[#D0D6B5] text-[#1F1F1F] text-[9px] font-black px-1.5 h-4 border-none">
                    {event.event_type?.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Latest News - Branded with #EE7674 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-tighter text-sm">
            <Newspaper className="w-4 h-4 text-[#EE7674]" />
            Latest News
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/feed')} className="text-[10px] h-6 px-2 font-bold text-muted-foreground hover:text-primary">
            READ FEED
          </Button>
        </div>
        <div className="space-y-3">
          {latestNews.map(item => (
            <Card key={item.id} className="p-3 border-2 border-[#EE7674]/20 hover:border-[#EE7674] transition-all cursor-pointer group" onClick={() => setLocation('/feed')}>
              <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-[10px] font-bold text-muted-foreground mt-1 line-clamp-1">{item.content}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-[9px] font-bold border-[#EE7674]/30 text-[#EE7674]">
                  {item.category || 'General'}
                </Badge>
                <span className="text-[9px] font-bold text-muted-foreground">{formatDate(item.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Mentors - Branded with #987284 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-tighter text-sm">
            <Star className="w-4 h-4 text-[#987284]" />
            Top Mentors
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/mentorship')} className="text-[10px] h-6 px-2 font-bold text-muted-foreground hover:text-primary">
            EXPLORE
          </Button>
        </div>
        <div className="space-y-2">
          {topMentors.map(mentor => (
            <div key={mentor.id} className="flex items-center gap-3 p-2 rounded-xl border-2 border-transparent hover:border-[#987284]/20 hover:bg-[#987284]/5 transition-all cursor-pointer group" onClick={() => setLocation(`/profile/${mentor.id}`)}>
              <div className="w-9 h-9 rounded-full bg-[#987284] flex items-center justify-center text-white font-black text-xs shadow-sm">
                {mentor.first_name?.[0] || mentor.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-[#987284] transition-colors">{mentor.first_name} {mentor.last_name}</p>
                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-wider">{mentor.company || 'JEC Alumni'}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-[#987284] transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Jobs - Branded with #9DBF9E */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-tighter text-sm">
            <Briefcase className="w-4 h-4 text-[#9DBF9E]" />
            Latest Jobs
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/jobs')} className="text-[10px] h-6 px-2 font-bold text-muted-foreground hover:text-primary">
            BROWSE
          </Button>
        </div>
        <div className="space-y-3">
          {latestJobs.map(job => (
            <Card key={job.id} className="p-3 border-2 border-[#9DBF9E]/20 hover:border-[#9DBF9E] transition-all cursor-pointer group" onClick={() => setLocation('/jobs')}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-primary transition-colors">{job.title}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">{job.company}</p>
                </div>
                <Badge className="bg-[#9DBF9E]/10 text-[#9DBF9E] text-[9px] font-black px-1.5 h-4 border-none">
                  {job.job_type?.toUpperCase()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Discussions - Branded with #1F1F1F */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-tighter text-sm">
            <MessageSquare className="w-4 h-4 text-[#1F1F1F]" />
            Discussions
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/discussion')} className="text-[10px] h-6 px-2 font-bold text-muted-foreground hover:text-primary">
            JOIN
          </Button>
        </div>
        <div className="space-y-3">
          {latestDiscussions.map(post => (
            <div key={post.id} className="p-3 rounded-xl bg-[#1F1F1F] text-white hover:bg-[#1F1F1F]/90 transition-all cursor-pointer group" onClick={() => setLocation('/discussion')}>
              <p className="text-xs font-medium line-clamp-2 italic leading-relaxed opacity-90">"{post.content}"</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">— {post.user?.first_name || 'Alumni'}</p>
                <ChevronRight className="w-3 h-3 opacity-50 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
