import { useEffect, useState } from 'react'
import { supabase, type Message, type User } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, MessageSquare } from 'lucide-react'

interface Conversation {
  userId: string
  userName: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedUserId && user) {
      fetchMessages()
      fetchUserData()
    }
  }, [selectedUserId, user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      // Fetch all messages for this user
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by conversation
      const convMap = new Map<string, Conversation>()

      for (const msg of data || []) {
        const otherUserId =
          msg.sender_id === user.id ? msg.recipient_id : msg.sender_id

        if (!convMap.has(otherUserId)) {
          // Fetch user data
          const { data: userData } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', otherUserId)
            .single()

          convMap.set(otherUserId, {
            userId: otherUserId,
            userName: userData?.name || 'Unknown',
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: msg.recipient_id === user.id && !msg.is_read ? 1 : 0,
          })
        }
      }

      setConversations(Array.from(convMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedUserId || !user) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('sender_id', selectedUserId)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchUserData = async () => {
    if (!selectedUserId) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', selectedUserId)
        .single()

      if (error) throw error
      setSelectedUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUserId || !user) return

    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: selectedUserId,
        content: messageText,
        is_read: false,
      })

      if (error) throw error

      setMessageText('')
      fetchMessages()
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="p-4 overflow-y-auto">
            <h2 className="font-bold text-foreground mb-4">Conversations</h2>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUserId === conv.userId
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <p className="font-semibold text-foreground text-sm">
                      {conv.userName}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Chat Area */}
          {selectedUserId && selectedUserData ? (
            <Card className="p-4 md:col-span-2 flex flex-col">
              {/* Header */}
              <div className="border-b border-border pb-4 mb-4">
                <h2 className="font-bold text-foreground">
                  {selectedUserData.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedUserData.company || 'Alumni'}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Start a conversation
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-12 md:col-span-2 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
