import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Clock3,
  History,
  MessageCircle,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import botImage from '../../Assets/bot.png'
import {
  addAssistantMessage,
  createAssistantConversation,
  deleteAssistantConversation,
  getAssistantConversations,
  getAssistantSettings,
  getAssistantVisitor,
  markAssistantConversationRead,
  setAssistantVisitor,
  subscribeAssistantStore,
} from '../data/assistantStore'
import './BotAssistant.css'

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('fa-AF')
  } catch {
    return ''
  }
}

function BotAssistant() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [settings, setSettings] = useState(() => getAssistantSettings())
  const [conversations, setConversations] = useState(() =>
    getAssistantConversations(),
  )
  const [visitor, setVisitorState] = useState(() => getAssistantVisitor())
  const messageListRef = useRef(null)

  const refreshStore = () => {
    setSettings(getAssistantSettings())
    setConversations(getAssistantConversations())
    setVisitorState(getAssistantVisitor())
  }

  useEffect(() => subscribeAssistantStore(refreshStore), [])

  const activeConversation = useMemo(() => {
    if (!visitor?.activeConversationId) return null
    return (
      conversations.find(
        (conversation) => conversation.id === visitor.activeConversationId,
      ) || null
    )
  }, [conversations, visitor?.activeConversationId])

  const visitorConversations = useMemo(() => {
    if (!visitor?.name) return []
    return conversations.filter((conversation) => {
      if (visitor.visitorId) return conversation.visitorId === visitor.visitorId
      return conversation.visitorName === visitor.name
    })
  }, [conversations, visitor?.name, visitor?.visitorId])

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visitorConversations

    return visitorConversations.filter((conversation) => {
      const text = conversation.messages
        .map((item) => item.text)
        .join(' ')
        .toLowerCase()
      return text.includes(query)
    })
  }, [search, visitorConversations])

  useEffect(() => {
    if (!open || activeTab !== 'chat') return

    requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight
      }
    })

    if (activeConversation?.id) {
      void markAssistantConversationRead(activeConversation.id, 'user')
    }
  }, [open, activeTab, activeConversation?.id, activeConversation?.messages.length])

  useEffect(() => {
    if (!visitor?.name || activeConversation) return
    if (visitorConversations[0]) {
      const nextVisitor = {
        ...visitor,
        activeConversationId: visitorConversations[0].id,
      }
      setAssistantVisitor(nextVisitor)
      setVisitorState(nextVisitor)
    }
  }, [activeConversation, visitor?.name, visitor?.visitorId, visitorConversations])

  if (!settings.enabled) return null

  const startWithName = async (event) => {
    event.preventDefault()
    const cleanName = nameInput.trim()
    if (!cleanName) return

    const conversation = await createAssistantConversation(cleanName)
    if (!conversation) return

    setNameInput('')
    setVisitorState(getAssistantVisitor())
    setActiveTab('chat')
  }

  const sendMessage = async (text) => {
    const cleanText = text.trim()
    if (!cleanText || !activeConversation?.id) return

    await addAssistantMessage(activeConversation.id, {
      sender: 'user',
      senderName: visitor?.name,
      text: cleanText,
    })
    setMessage('')
    setActiveTab('chat')
  }

  const handleNewConversation = async () => {
    if (!visitor?.name) return
    const conversation = await createAssistantConversation(visitor.name)
    if (!conversation) return
    setVisitorState(getAssistantVisitor())
    setActiveTab('chat')
  }

  const chooseConversation = (conversationId) => {
    const nextVisitor = {
      name: visitor?.name || '',
      visitorId: visitor?.visitorId,
      activeConversationId: conversationId,
    }
    setAssistantVisitor(nextVisitor)
    setVisitorState(nextVisitor)
    setActiveTab('chat')
  }

  const removeConversation = async (conversationId) => {
    await deleteAssistantConversation(conversationId)
    const remaining = visitorConversations.filter(
      (conversation) => conversation.id !== conversationId,
    )

    if (visitor?.activeConversationId === conversationId) {
      if (remaining[0]) {
        chooseConversation(remaining[0].id)
      } else {
        const replacement = await createAssistantConversation(visitor?.name)
        if (replacement) chooseConversation(replacement.id)
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className={`alimi-bot-launcher ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'بستن دستیار هوشمند' : 'باز کردن دستیار هوشمند'}
      >
        {open ? <X size={22} /> : <img src={botImage} alt={settings.title} />}
      </button>

      {open && (
        <section className="alimi-bot-window" dir="rtl">
          <header className="alimi-bot-header">
            <div className="alimi-bot-header-profile">
              <span className="alimi-bot-header-avatar">
                <img src={botImage} alt="" />
              </span>

              <div>
                <strong>{settings.title}</strong>
                <small>
                  <i />
                  {settings.statusText}
                </small>
              </div>
            </div>

            <div className="alimi-bot-header-actions">
              {visitor?.name && (
                <button
                  type="button"
                  onClick={handleNewConversation}
                  aria-label="گفتگوی جدید"
                  title="گفتگوی جدید"
                >
                  <Plus size={18} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          {!visitor?.name ? (
            <div className="alimi-bot-name-step">
              <span className="alimi-bot-name-icon">
                <UserRound size={28} />
              </span>
              <h3>{settings.namePromptTitle}</h3>
              <p>{settings.namePromptText}</p>

              <form onSubmit={startWithName}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder={settings.namePlaceholder}
                  maxLength={60}
                />
                <button type="submit" disabled={!nameInput.trim()}>
                  شروع گفتگو
                </button>
              </form>
            </div>
          ) : (
            <>
              <nav className="alimi-bot-tabs alimi-bot-tabs-two">
                <button
                  type="button"
                  className={activeTab === 'chat' ? 'is-active' : ''}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageCircle size={15} />
                  چت
                </button>

                <button
                  type="button"
                  className={activeTab === 'history' ? 'is-active' : ''}
                  onClick={() => setActiveTab('history')}
                >
                  <History size={15} />
                  تاریخچه
                </button>
              </nav>

              <div className="alimi-bot-content">
                {activeTab === 'chat' && (
                  <main className="alimi-bot-chat">
                    <div className="alimi-bot-visitor-bar">
                      <span>گفتگو با نام</span>
                      <strong>{visitor.name}</strong>
                    </div>

                    <div className="alimi-bot-messages" ref={messageListRef}>
                      <div className="alimi-bot-chat-date">
                        <Clock3 size={12} />
                        امروز
                      </div>

                      {activeConversation?.messages.map((item) => {
                        const isUser = item.sender === 'user'
                        return (
                          <div
                            key={item.id}
                            className={`alimi-bot-message-row ${
                              isUser ? 'is-user' : 'is-assistant'
                            }`}
                          >
                            {!isUser && (
                              <span className="alimi-bot-message-avatar">
                                <img src={botImage} alt="" />
                              </span>
                            )}

                            <div>
                              <small className="alimi-bot-message-name">
                                {item.senderName ||
                                  (isUser ? visitor.name : settings.adminName)}
                              </small>
                              <div className="alimi-bot-message-bubble">
                                {item.text}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <form
                      className="alimi-bot-composer"
                      onSubmit={(event) => {
                        event.preventDefault()
                        sendMessage(message)
                      }}
                    >
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            sendMessage(message)
                          }
                        }}
                        placeholder={settings.messagePlaceholder}
                        rows={1}
                      />

                      <button
                        type="submit"
                        disabled={!message.trim() || !activeConversation}
                        aria-label="ارسال پیام"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </main>
                )}

                {activeTab === 'history' && (
                  <div className="alimi-bot-panel">
                    <div className="alimi-bot-panel-title">
                      <strong>تاریخچه گفتگوها</strong>
                      <small>{visitorConversations.length} گفتگو ذخیره شده است.</small>
                    </div>

                    <label className="alimi-bot-search">
                      <Search size={16} />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="جستجوی گفتگو..."
                      />
                    </label>

                    <div className="alimi-bot-history-list">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={
                            conversation.id === visitor.activeConversationId
                              ? 'alimi-bot-history-item is-active'
                              : 'alimi-bot-history-item'
                          }
                        >
                          <button
                            type="button"
                            className="alimi-bot-history-main"
                            onClick={() => chooseConversation(conversation.id)}
                          >
                            <MessageCircle size={16} />
                            <span>
                              <strong>
                                {conversation.messages
                                  .filter((item) => !item.system)
                                  .at(-1)?.text?.slice(0, 34) || 'گفتگوی جدید'}
                              </strong>
                              <small>{formatDate(conversation.updatedAt)}</small>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="alimi-bot-history-delete"
                            onClick={() => removeConversation(conversation.id)}
                            aria-label="حذف گفتگو"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </>
  )
}

export default BotAssistant
