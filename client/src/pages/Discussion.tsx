import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Loader2, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Send, 
  MoreVertical,
  User as UserIcon,
  Clock,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  user_id: string
  content: string
  created_at: string
  user: {
    first_name: string
    last_name: string
    name: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    first_name: string
    last_name: string
    name: string
  }
}

export default function Discussion() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({})
  const [commenting, setCommenting] = useState<Record<string, boolean>>({})
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [user])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch likes and comments count for each post
      const postsWithCounts = await Promise.all((data || []).map(async (post) => {
        const { count: likesCount } = await supabase
          .from('discussion_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        const { count: commentsCount } = await supabase
          .from('discussion_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        let isLiked = false
        if (user) {
          const { data: likeData } = await supabase
            .from('discussion_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single()
          isLiked = !!likeData
        }

        return {
          ...post,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: isLiked,
          user: post.user || { first_name: 'Unknown', last_name: 'User', name: 'Unknown User' }
        }
      }))

      setPosts(postsWithCounts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPostContent.trim()) return

    setPosting(true)
    try {
      const { error } = await supabase.from('discussion_posts').insert({
        user_id: user.id,
        content: newPostContent.trim()
      })

      if (error) throw error

      setNewPostContent('')
      toast.success('Post shared successfully!')
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to share post')
    } finally {
      setPosting(false)
    }
  }

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!user) return

    try {
      if (isLiked) {
        await supabase
          .from('discussion_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('discussion_likes')
          .insert({ post_id: postId, user_id: user.id })
      }
      
      // Update local state for immediate feedback
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: !isLiked,
            likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
          }
        }
        return p
      }))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const toggleComments = async (postId: string) => {
    const isExpanded = !expandedComments[postId]
    setExpandedComments({ ...expandedComments, [postId]: isExpanded })

    if (isExpanded && !comments[postId]) {
      fetchComments(postId)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_comments')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments({ ...comments, [postId]: data || [] })
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = newCommentContent[postId]
    if (!user || !content?.trim()) return

    setCommenting({ ...commenting, [postId]: true })
    try {
      const { error } = await supabase.from('discussion_comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      })

      if (error) throw error

      setNewCommentContent({ ...newCommentContent, [postId]: '' })
      fetchComments(postId)
      
      // Update comment count in posts list
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 }
        }
        return p
      }))
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setCommenting({ ...commenting, [postId]: false })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const { error } = await supabase.from('discussion_posts').delete().eq('id', postId)
      if (error) throw error
      toast.success('Post deleted')
      setPosts(posts.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleUpdatePost = async (postId: string) => {
    if (!editPostContent.trim()) return
    try {
      const { error } = await supabase
        .from('discussion_posts')
        .update({ content: editPostContent.trim() })
        .eq('id', postId)
      
      if (error) throw error
      toast.success('Post updated')
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editPostContent.trim() } : p))
      setEditingPostId(null)
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      const { error } = await supabase.from('discussion_comments').delete().eq('id', commentId)
      if (error) throw error
      toast.success('Comment deleted')
      setComments({
        ...comments,
        [postId]: comments[postId].filter(c => c.id !== commentId)
      })
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count - 1 } : p))
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleUpdateComment = async (postId: string, commentId: string) => {
    if (!editCommentContent.trim()) return
    try {
      const { error } = await supabase
        .from('discussion_comments')
        .update({ content: editCommentContent.trim() })
        .eq('id', commentId)
      
      if (error) throw error
      toast.success('Comment updated')
      setComments({
        ...comments,
        [postId]: comments[postId].map(c => c.id === commentId ? { ...c, content: editCommentContent.trim() } : c)
      })
      setEditingCommentId(null)
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleShare = (post: Post) => {
    const shareUrl = window.location.href
    const shareText = `Check out this discussion on JEC Alumni: "${post.content.substring(0, 50)}..."`
    
    if (navigator.share) {
      navigator.share({
        title: 'JEC Alumni Discussion',
        text: shareText,
        url: shareUrl,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast.success('Link copied to clipboard!')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discussion Forum</h1>
          <p className="text-lg text-muted-foreground">
            Connect, share, and engage with your fellow alumni
          </p>
        </div>

        {/* Create Post */}
        {user && (
          <Card className="p-6 mb-8 shadow-md">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
              <form onSubmit={handleCreatePost} className="flex-1 space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px] resize-none border-none focus-visible:ring-0 text-lg p-0"
                />
                <div className="flex justify-end border-t pt-4">
                  <Button 
                    type="submit" 
                    disabled={posting || !newPostContent.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {posting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Post Discussion
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No discussions yet</h3>
            <p className="text-muted-foreground">Start a conversation with the community!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {post.user.name?.charAt(0) || post.user.first_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {post.user.name || `${post.user.first_name} ${post.user.last_name}`}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTimeAgo(post.created_at)}
                        </p>
                      </div>
                    </div>
                    {user && user.id === post.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingPostId(post.id)
                            setEditPostContent(post.content)
                          }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Post Content */}
                  {editingPostId === post.id ? (
                    <div className="space-y-4 mb-6">
                      <Textarea 
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingPostId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdatePost(post.id)}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-foreground mb-6 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`gap-2 ${post.is_liked ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => handleLikePost(post.id, post.is_liked)}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-muted-foreground"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-muted-foreground"
                      onClick={() => handleShare(post)}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[post.id] && (
                  <div className="bg-secondary/30 border-t p-6 space-y-4">
                    {/* Comment Input */}
                    {user && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center flex-shrink-0 border">
                          <span className="text-xs font-bold text-primary">{user.name?.charAt(0) || '?'}</span>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newCommentContent[post.id] || ''}
                            onChange={(e) => setNewCommentContent({ ...newCommentContent, [post.id]: e.target.value })}
                            className="bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <Button 
                            size="icon" 
                            disabled={commenting[post.id] || !newCommentContent[post.id]?.trim()}
                            onClick={() => handleAddComment(post.id)}
                          >
                            {commenting[post.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4 mt-4">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {comment.user.name?.charAt(0) || comment.user.first_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1 bg-background p-3 rounded-lg border shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold">
                                {comment.user.name || `${comment.user.first_name} ${comment.user.last_name}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                                {user && user.id === comment.user_id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setEditingCommentId(comment.id)
                                        setEditCommentContent(comment.content)
                                      }}>
                                        <Edit2 className="mr-2 h-3 w-3" />
                                        <span className="text-xs">Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                      >
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        <span className="text-xs">Delete</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="space-y-2 mt-2">
                                <Input 
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  className="text-sm"
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" size="xs" className="h-7 text-[10px]" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                  <Button size="xs" className="h-7 text-[10px]" onClick={() => handleUpdateComment(post.id, comment.id)}>Save</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-foreground">{comment.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {comments[post.id]?.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-2">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
