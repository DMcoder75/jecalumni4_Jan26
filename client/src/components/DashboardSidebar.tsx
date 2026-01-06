import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Star,
  ChevronRight,
  Clock,
  Newspaper,
  MapPin,
  TrendingUp
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
      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(2)

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
        .limit(2)

      // Fetch latest discussions
      const { data: discussions } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(2)

      // Fetch latest news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2)

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
    <div className="space-y-8">
      {/* Upcoming Events - Branded Block */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Calendar className="w-4 h-4 text-[#EE7674]" />
            Upcoming Events
          </h3>
          <Button variant="link" size="sm" onClick={() => setLocation('/events')} className="text-[10px] h-auto p-0 font-black text-[#EE7674] uppercase tracking-tighter">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="p-4 rounded-xl border-2 border-dashed border-[#D0D6B5] text-center">
              <p className="text-[10px] font-bold text-muted-foreground italic">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <Card key={event.id} className="p-4 border-2 border-[#D0D6B5] shadow-none hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/events')}>
                <div className="flex flex-col gap-2">
                  <Badge className="w-fit bg-[#D0D6B5] text-[#1F1F1F] text-[8px] font-black px-1.5 h-4 border-none uppercase">
                    {event.event_type}
                  </Badge>
                  <p className="text-sm font-black text-[#1F1F1F] leading-tight group-hover:text-[#EE7674] transition-colors">{event.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#EE7674]" /> {formatDate(event.event_date)}
                    </p>
                    {event.location && (
                      <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#EE7674]" /> {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Latest News - Branded Block */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Newspaper className="w-4 h-4 text-[#987284]" />
            Latest News
          </h3>
          <Button variant="link" size="sm" onClick={() => setLocation('/feed')} className="text-[10px] h-auto p-0 font-black text-[#987284] uppercase tracking-tighter">
            Read Feed
          </Button>
        </div>
        <div className="space-y-3">
          {latestNews.map(item => (
            <Card key={item.id} className="p-4 border-2 border-[#987284]/20 hover:border-[#987284] shadow-none transition-all cursor-pointer group" onClick={() => setLocation('/feed')}>
              <p className="text-sm font-black text-[#1F1F1F] leading-tight group-hover:text-[#987284] transition-colors mb-2">{item.title}</p>
              <p className="text-[10px] font-medium text-[#4A4A4A] line-clamp-2 leading-relaxed mb-3">{item.content}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[8px] font-black border-[#987284]/30 text-[#987284] uppercase">
                  {item.category || 'News'}
                </Badge>
                <span className="text-[9px] font-bold text-muted-foreground">{formatDate(item.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Mentors - Branded Block */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Star className="w-4 h-4 text-[#EE7674]" />
            Top Mentors
          </h3>
          <Button variant="link" size="sm" onClick={() => setLocation('/mentorship')} className="text-[10px] h-auto p-0 font-black text-[#EE7674] uppercase tracking-tighter">
            Explore
          </Button>
        </div>
        <div className="bg-[#F9B5AC]/10 rounded-2xl p-4 border-2 border-[#F9B5AC]/30">
          <div className="space-y-4">
            {topMentors.map(mentor => (
              <div key={mentor.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => setLocation(`/profile/${mentor.id}`)}>
                <div className="w-10 h-10 rounded-full bg-[#EE7674] flex items-center justify-center text-white font-black text-xs shadow-md border-2 border-white">
                  {mentor.first_name?.[0] || mentor.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-[#EE7674] transition-colors">{mentor.first_name} {mentor.last_name}</p>
                  <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-widest">{mentor.company || 'JEC Alumni'}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-[#EE7674] opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs - Branded Block */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <Briefcase className="w-4 h-4 text-[#9DBF9E]" />
            Latest Jobs
          </h3>
          <Button variant="link" size="sm" onClick={() => setLocation('/jobs')} className="text-[10px] h-auto p-0 font-black text-[#9DBF9E] uppercase tracking-tighter">
            Browse
          </Button>
        </div>
        <div className="space-y-3">
          {latestJobs.map(job => (
            <Card key={job.id} className="p-4 border-2 border-[#9DBF9E]/30 hover:border-[#9DBF9E] shadow-none transition-all cursor-pointer group" onClick={() => setLocation('/jobs')}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-[#9DBF9E] transition-colors">{job.title}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{job.company}</p>
                </div>
                <TrendingUp className="w-3 h-3 text-[#9DBF9E] opacity-50" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Discussions - Branded Block */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <MessageSquare className="w-4 h-4 text-[#1F1F1F]" />
            Discussions
          </h3>
          <Button variant="link" size="sm" onClick={() => setLocation('/discussion')} className="text-[10px] h-auto p-0 font-black text-[#1F1F1F] uppercase tracking-tighter">
            Join
          </Button>
        </div>
        <div className="space-y-3">
          {latestDiscussions.map(post => (
            <div key={post.id} className="p-4 rounded-2xl bg-[#1F1F1F] text-white hover:bg-[#1F1F1F]/90 transition-all cursor-pointer group" onClick={() => setLocation('/discussion')}>
              <p className="text-[11px] font-medium line-clamp-2 italic leading-relaxed opacity-80 mb-3">"{post.content}"</p>
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#EE7674]">— {post.user?.first_name || 'Alumni'}</p>
                <ChevronRight className="w-3 h-3 text-white opacity-50 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
