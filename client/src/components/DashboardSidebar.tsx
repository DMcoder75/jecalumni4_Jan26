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
  MoreVertical,
  ThumbsUp,
  Share2
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
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(2)

      const { data: mentors } = await supabase
        .from('users')
        .select('*')
        .eq('is_mentor', true)
        .limit(3)

      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(2)

      const { data: discussions } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(2)

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

  const SidebarCard = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <Card 
      className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white rounded-xl mb-4"
      onClick={onClick}
    >
      {children}
    </Card>
  )

  const SectionHeader = ({ title, icon: Icon, onAction }: { title: string, icon: any, onAction: () => void }) => (
    <div className="flex items-center justify-between mb-4 px-1">
      <h3 className="font-black text-[#1F1F1F] flex items-center gap-2 uppercase tracking-widest text-[10px]">
        <Icon className="w-4 h-4 text-[#EE7674]" />
        {title}
      </h3>
      <Button variant="ghost" size="sm" onClick={onAction} className="text-[10px] h-auto p-0 font-black text-[#EE7674] uppercase tracking-tighter hover:bg-transparent">
        View All
      </Button>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Upcoming Events */}
      <section>
        <SectionHeader title="Upcoming Events" icon={Calendar} onAction={() => setLocation('/events')} />
        {upcomingEvents.map(event => (
          <SidebarCard key={event.id} onClick={() => setLocation('/events')}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D0D6B5]/30 flex flex-col items-center justify-center text-[#1F1F1F] flex-shrink-0">
                <span className="text-[10px] font-black leading-none">{new Date(event.event_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                <span className="text-sm font-black leading-none">{new Date(event.event_date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-[#1F1F1F] truncate pr-2">{event.title}</p>
                  <MoreVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                  {event.location || 'Online Event'} • {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </SidebarCard>
        ))}
      </section>

      {/* Latest News */}
      <section>
        <SectionHeader title="Latest News" icon={Newspaper} onAction={() => setLocation('/feed')} />
        {latestNews.map(item => (
          <SidebarCard key={item.id} onClick={() => setLocation('/feed')}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#987284]/10 flex items-center justify-center text-[#987284] font-black text-xs flex-shrink-0">
                {item.category?.[0] || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-[#1F1F1F] truncate pr-2">{item.title}</p>
                  <MoreVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">14h ago</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-medium truncate mb-4">
              {item.content}
            </p>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-400">
                  <ThumbsUp className="w-3 h-3" />
                  <span className="text-[10px] font-bold">2</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-[10px] font-bold">1</span>
                </div>
              </div>
              <Share2 className="w-3 h-3 text-gray-400" />
            </div>
          </SidebarCard>
        ))}
      </section>

      {/* Top Mentors */}
      <section>
        <SectionHeader title="Top Mentors" icon={Star} onAction={() => setLocation('/mentorship')} />
        <div className="space-y-3">
          {topMentors.map(mentor => (
            <div key={mentor.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group" onClick={() => setLocation(`/profile/${mentor.id}`)}>
              <div className="w-10 h-10 rounded-full bg-[#EE7674] flex items-center justify-center text-white font-black text-xs shadow-sm border-2 border-white">
                {mentor.first_name?.[0] || mentor.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1F1F1F] truncate group-hover:text-[#EE7674] transition-colors">{mentor.first_name} {mentor.last_name}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{mentor.company || 'JEC Alumni'}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#EE7674] transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Jobs */}
      <section>
        <SectionHeader title="Latest Jobs" icon={Briefcase} onAction={() => setLocation('/jobs')} />
        {latestJobs.map(job => (
          <SidebarCard key={job.id} onClick={() => setLocation('/jobs')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#9DBF9E]/20 flex items-center justify-center text-[#9DBF9E] flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1F1F1F] truncate">{job.title}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider mt-0.5">{job.company}</p>
              </div>
            </div>
          </SidebarCard>
        ))}
      </section>

      {/* Discussions */}
      <section>
        <SectionHeader title="Discussions" icon={MessageSquare} onAction={() => setLocation('/discussion')} />
        {latestDiscussions.map(post => (
          <SidebarCard key={post.id} onClick={() => setLocation('/discussion')}>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black text-[10px] flex-shrink-0">
                {post.user?.first_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1F1F1F] truncate">{post.user?.first_name} {post.user?.last_name}</p>
                <p className="text-[9px] text-gray-400 font-medium">Just now</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 font-medium truncate italic">
              "{post.content}"
            </p>
          </SidebarCard>
        ))}
      </section>
    </div>
  )
}
