import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Star,
  ChevronRight,
  Clock,
  Newspaper
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

  const SectionWrapper = ({ title, icon: Icon, path, children, isEmpty }: { title: string, icon: any, path: string, children: React.ReactNode, isEmpty?: boolean }) => (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="p-1.5 bg-[#EE7674]/10 rounded-lg">
          <Icon className="w-4 h-4 text-[#EE7674]" />
        </div>
        <h3 className="text-base font-black text-[#1F1F1F] tracking-tight">
          {title}
        </h3>
      </div>
      <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        {isEmpty ? (
          <div className="p-8 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No entries found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {children}
            </div>
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocation(path);
                }} 
                className="text-[11px] font-black text-[#EE7674] uppercase tracking-widest hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                View All
              </button>
            </div>
          </>
        )}
      </Card>
    </section>
  )

  return (
    <div className="space-y-2">
      {/* Upcoming Events */}
      <SectionWrapper title="Upcoming Events" icon={Calendar} path="/events" isEmpty={upcomingEvents.length === 0}>
        {upcomingEvents.map(event => (
          <div 
            key={event.id} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
            onClick={() => setLocation('/events')}
          >
            <div className="w-11 h-11 rounded-full bg-[#D0D6B5]/40 flex flex-col items-center justify-center text-[#1F1F1F] flex-shrink-0 border border-gray-200">
              <span className="text-[9px] font-black leading-none">{new Date(event.event_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
              <span className="text-sm font-black leading-none">{new Date(event.event_date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1F1F1F] truncate">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#EE7674]" /> {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className="text-gray-300">•</span>
                <p className="text-[10px] text-gray-500 font-medium truncate">
                  {event.location || 'Online'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </SectionWrapper>

      {/* Latest News */}
      <SectionWrapper title="Latest News" icon={Newspaper} path="/feed" isEmpty={latestNews.length === 0}>
        {latestNews.map(item => (
          <div 
            key={item.id} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/feed')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#987284]/10 flex items-center justify-center text-[#987284] font-black text-[10px] flex-shrink-0">
                {item.category?.[0] || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1F1F1F] truncate">{item.title}</p>
                <p className="text-[9px] text-[#EE7674] font-bold uppercase tracking-tighter">{formatDate(item.created_at)}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              {item.content}
            </p>
          </div>
        ))}
      </SectionWrapper>

      {/* Top Mentors */}
      <SectionWrapper title="Top Mentors" icon={Star} path="/mentorship" isEmpty={topMentors.length === 0}>
        {topMentors.map(mentor => (
          <div 
            key={mentor.id} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
            onClick={() => setLocation(`/profile/${mentor.id}`)}
          >
            <div className="w-10 h-10 rounded-full bg-[#EE7674] flex items-center justify-center text-white font-black text-xs shadow-sm border-2 border-white flex-shrink-0">
              {mentor.first_name?.[0] || mentor.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1F1F1F] truncate">{mentor.first_name} {mentor.last_name}</p>
              <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{mentor.company || 'JEC Alumni'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </SectionWrapper>

      {/* Latest Jobs */}
      <SectionWrapper title="Latest Jobs" icon={Briefcase} path="/jobs" isEmpty={latestJobs.length === 0}>
        {latestJobs.map(job => (
          <div 
            key={job.id} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
            onClick={() => setLocation('/jobs')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#9DBF9E]/20 flex items-center justify-center text-[#9DBF9E] flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1F1F1F] truncate">{job.title}</p>
              <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider mt-0.5">{job.company}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </SectionWrapper>

      {/* Discussions */}
      <SectionWrapper title="Discussions" icon={MessageSquare} path="/discussion" isEmpty={latestDiscussions.length === 0}>
        {latestDiscussions.map(post => (
          <div 
            key={post.id} 
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setLocation('/discussion')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black text-[10px] flex-shrink-0">
                {post.user?.first_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1F1F1F] truncate">{post.user?.first_name} {post.user?.last_name}</p>
                <p className="text-[9px] text-[#EE7674] font-bold">Just now</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate italic">
              "{post.content}"
            </p>
          </div>
        ))}
      </SectionWrapper>
    </div>
  )
}
