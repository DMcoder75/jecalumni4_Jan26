import { useEffect, useState } from 'react'
import { supabase, type News, type SuccessStory } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Newspaper, Star, Plus, Eye } from 'lucide-react'

export default function Feed() {
  const { user } = useAuth()
  const [news, setNews] = useState<News[]>([])
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [postType, setPostType] = useState<'news' | 'story'>('news')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      // Fetch news
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (newsError) throw newsError

      // Fetch stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      setNews(newsData || [])
      setStories(storiesData || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setPosting(true)
    try {
      const table = postType === 'news' ? 'news' : 'success_stories'

      const insertData: any = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        featured: false,
      }

      if (postType === 'news') {
        insertData.created_by = user.id
      } else {
        insertData.author_id = user.id
      }

      const { error } = await supabase.from(table).insert(insertData)

      if (error) throw error

      setFormData({ title: '', content: '', category: '' })
      setShowPostDialog(false)
      fetchContent()
    } catch (error) {
      console.error('Error posting content:', error)
    } finally {
      setPosting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Alumni Feed</h1>
            <p className="text-lg text-muted-foreground">
              News, announcements, and success stories from our alumni community
            </p>
          </div>
          {user && (
            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Share with the Alumni Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={postType === 'news' ? 'default' : 'outline'}
                      onClick={() => setPostType('news')}
                      className={postType === 'news' ? 'bg-primary' : ''}
                    >
                      <Newspaper className="w-4 h-4 mr-2" />
                      News
                    </Button>
                    <Button
                      type="button"
                      variant={postType === 'story' ? 'default' : 'outline'}
                      onClick={() => setPostType('story')}
                      className={postType === 'story' ? 'bg-primary' : ''}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Success Story
                    </Button>
                  </div>

                  <form onSubmit={handlePostContent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter a title..."
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Career, Technology, Leadership"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Share your thoughts, achievements, or news..."
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="min-h-32"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={posting}
                      >
                        {posting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          'Post'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPostDialog(false)}
                        disabled={posting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="news">
                <Newspaper className="w-4 h-4 mr-2" />
                News & Announcements
              </TabsTrigger>
              <TabsTrigger value="stories">
                <Star className="w-4 h-4 mr-2" />
                Success Stories
              </TabsTrigger>
            </TabsList>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              {news.length === 0 ? (
                <Card className="p-12 text-center">
                  <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No news yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to share news with the alumni community
                  </p>
                </Card>
              ) : (
                news.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {item.title}
                        </h3>
                        {item.category && (
                          <Badge variant="secondary" className="mb-3">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      {item.featured && (
                        <Badge className="bg-accent text-accent-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {item.content}
                    </p>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{formatDate(item.created_at)}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views_count}
                        </span>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Stories Tab */}
            <TabsContent value="stories" className="space-y-6">
              {stories.length === 0 ? (
                <Card className="p-12 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No success stories yet
                  </h3>
                  <p className="text-muted-foreground">
                    Share your success story and inspire other alumni
                  </p>
                </Card>
              ) : (
                stories.map((story) => (
                  <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {story.title}
                        </h3>
                        {story.category && (
                          <Badge variant="secondary" className="mb-3">
                            {story.category}
                          </Badge>
                        )}
                      </div>
                      {story.featured && (
                        <Badge className="bg-accent text-accent-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {story.content}
                    </p>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{formatDate(story.created_at)}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {story.views_count}
                        </span>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
