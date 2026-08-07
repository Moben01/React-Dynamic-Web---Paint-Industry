import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  Clock3,
  History,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import botImage from '../../Assets/bot.png'
import './BotAssistant.css'

const suggestedQuestions = [
  'برای دیوارهای داخلی کدام رنگ مناسب است؟',
  'برای نمای بیرونی چه محصولی پیشنهاد می‌کنید؟',
  'تفاوت رنگ پلاستیک و روغنی چیست؟',
  'برای جلوگیری از رطوبت چه رنگی مناسب است؟',
  'چگونه مقدار رنگ مورد نیاز را محاسبه کنم؟',
]

const defaultConversation = {
  id: 'welcome',
  title: 'مشوره انتخاب رنگ',
  updatedAt: Date.now(),
  messages: [
    {
      id: 'welcome-1',
      role: 'assistant',
      text:
        'سلام! من دستیار هوشمند شرکت رنگ‌سازی علیمی هستم. درباره محصولات، انتخاب رنگ یا پروژه‌تان سوال کنید.',
    },
  ],
}

function createConversation() {
  const now = Date.now()

  return {
    id: `conversation-${now}`,
    title: 'گفتگوی جدید',
    updatedAt: now,
    messages: [
      {
        id: `assistant-${now}`,
        role: 'assistant',
        text:
          'گفتگوی تازه آغاز شد. درباره نوع سطح، محل استفاده یا رنگ مورد نظر خود بنویسید.',
      },
    ],
  }
}

function createAssistantReply(question) {
  const normalized = question.trim()

  if (
    normalized.includes('نمای بیرونی') ||
    normalized.includes('بیرونی') ||
    normalized.includes('آفتاب')
  ) {
    return 'برای نمای بیرونی، رنگ اکریلیک مقاوم در برابر آفتاب و باران مناسب است. سطح باید پیش از اجرا تمیز و با پرایمر آماده شود.'
  }

  if (
    normalized.includes('رطوبت') ||
    normalized.includes('ضد آب') ||
    normalized.includes('آب')
  ) {
    return 'برای بخش‌های مرطوب، پوشش ضد آب بام و دیوار پیشنهاد می‌شود. ابتدا منبع رطوبت را برطرف و سپس پوشش را در چند لایه اجرا کنید.'
  }

  if (
    normalized.includes('پلاستیک') ||
    normalized.includes('روغنی') ||
    normalized.includes('داخلی')
  ) {
    return 'رنگ پلاستیک برای دیوارهای داخلی و نمای مات مناسب است. رنگ روغنی شست‌وشوپذیرتر است و برای دروازه، پنجره و قسمت‌های پرتماس بهتر عمل می‌کند.'
  }

  if (
    normalized.includes('محاسبه') ||
    normalized.includes('مقدار') ||
    normalized.includes('متر')
  ) {
    return 'مساحت دیوارها را محاسبه کنید، مساحت دروازه و پنجره را کم کرده و نتیجه را بر میزان پوشش‌دهی محصول تقسیم کنید. برای دو دست رنگ، مقدار را تقریباً دو برابر بگیرید.'
  }

  return 'برای پیشنهاد دقیق‌تر، نوع سطح، محل استفاده، مساحت تقریبی و شرایط محیطی پروژه را بنویسید.'
}

function BotAssistant() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('alimi-bot-conversations')
      return saved ? JSON.parse(saved) : [defaultConversation]
    } catch {
      return [defaultConversation]
    }
  })

  const [activeConversationId, setActiveConversationId] = useState(
    () => conversations[0]?.id || defaultConversation.id,
  )

  const messageListRef = useRef(null)

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) || conversations[0],
    [activeConversationId, conversations],
  )

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return conversations

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(query),
    )
  }, [conversations, search])

  useEffect(() => {
    localStorage.setItem(
      'alimi-bot-conversations',
      JSON.stringify(conversations),
    )
  }, [conversations])

  useEffect(() => {
    if (!open || activeTab !== 'chat') return

    requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop =
          messageListRef.current.scrollHeight
      }
    })
  }, [open, activeTab, activeConversation?.messages])

  const addMessage = (text) => {
    const cleanText = text.trim()

    if (!cleanText || !activeConversation) return

    const now = Date.now()

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation

        return {
          ...conversation,
          title:
            conversation.title === 'گفتگوی جدید'
              ? cleanText.slice(0, 34)
              : conversation.title,
          updatedAt: now,
          messages: [
            ...conversation.messages,
            {
              id: `user-${now}`,
              role: 'user',
              text: cleanText,
            },
            {
              id: `assistant-${now + 1}`,
              role: 'assistant',
              text: createAssistantReply(cleanText),
            },
          ],
        }
      }),
    )

    setMessage('')
    setActiveTab('chat')
  }

  const handleNewConversation = () => {
    const conversation = createConversation()
    setConversations((current) => [conversation, ...current])
    setActiveConversationId(conversation.id)
    setActiveTab('chat')
  }

  const deleteConversation = (conversationId) => {
    setConversations((current) => {
      const remaining = current.filter(
        (conversation) => conversation.id !== conversationId,
      )

      if (remaining.length) {
        if (conversationId === activeConversationId) {
          setActiveConversationId(remaining[0].id)
        }
        return remaining
      }

      const replacement = createConversation()
      setActiveConversationId(replacement.id)
      return [replacement]
    })
  }

  return (
    <>
      <button
        type="button"
        className={`alimi-bot-launcher ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'بستن دستیار هوشمند' : 'باز کردن دستیار هوشمند'}
      >
        {open ? (
          <X size={22} />
        ) : (
          <img src={botImage} alt="دستیار هوشمند علیمی" />
        )}
      </button>

      {open && (
        <section className="alimi-bot-window">
          <header className="alimi-bot-header">
            <div className="alimi-bot-header-profile">
              <span className="alimi-bot-header-avatar">
                <img src={botImage} alt="" />
              </span>

              <div>
                <strong>دستیار هوشمند علیمی</strong>
                <small>
                  <i />
                  آماده پاسخ‌گویی
                </small>
              </div>
            </div>

            <div className="alimi-bot-header-actions">
              <button
                type="button"
                onClick={handleNewConversation}
                aria-label="گفتگوی جدید"
              >
                <Plus size={18} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          <nav className="alimi-bot-tabs">
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
              className={activeTab === 'suggestions' ? 'is-active' : ''}
              onClick={() => setActiveTab('suggestions')}
            >
              <Sparkles size={15} />
              سوال‌ها
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
                <div className="alimi-bot-messages" ref={messageListRef}>
                  <div className="alimi-bot-chat-date">
                    <Clock3 size={12} />
                    امروز
                  </div>

                  {activeConversation?.messages.map((item) => (
                    <div
                      key={item.id}
                      className={`alimi-bot-message-row is-${item.role}`}
                    >
                      {item.role === 'assistant' && (
                        <span className="alimi-bot-message-avatar">
                          <img src={botImage} alt="" />
                        </span>
                      )}

                      <div className="alimi-bot-message-bubble">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  className="alimi-bot-composer"
                  onSubmit={(event) => {
                    event.preventDefault()
                    addMessage(message)
                  }}
                >
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        addMessage(message)
                      }
                    }}
                    placeholder="پیام خود را بنویسید..."
                    rows={1}
                  />

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    aria-label="ارسال پیام"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </main>
            )}

            {activeTab === 'suggestions' && (
              <div className="alimi-bot-panel">
                <div className="alimi-bot-panel-title">
                  <strong>سوال‌های پیشنهادی</strong>
                  <small>یکی از سوال‌ها را انتخاب کنید.</small>
                </div>

                <div className="alimi-bot-suggestion-list">
                  {suggestedQuestions.map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => addMessage(question)}
                    >
                      <span>{question}</span>
                      <ChevronLeft size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="alimi-bot-panel">
                <div className="alimi-bot-panel-title">
                  <strong>تاریخچه گفتگوها</strong>
                  <small>{conversations.length} گفتگو ذخیره شده است.</small>
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
                        conversation.id === activeConversationId
                          ? 'alimi-bot-history-item is-active'
                          : 'alimi-bot-history-item'
                      }
                    >
                      <button
                        type="button"
                        className="alimi-bot-history-main"
                        onClick={() => {
                          setActiveConversationId(conversation.id)
                          setActiveTab('chat')
                        }}
                      >
                        <MessageCircle size={16} />

                        <span>
                          <strong>{conversation.title}</strong>
                          <small>
                            {new Date(
                              conversation.updatedAt,
                            ).toLocaleDateString('fa-AF')}
                          </small>
                        </span>
                      </button>

                      <button
                        type="button"
                        className="alimi-bot-history-delete"
                        onClick={() =>
                          deleteConversation(conversation.id)
                        }
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
        </section>
      )}
    </>
  )
}

export default BotAssistant