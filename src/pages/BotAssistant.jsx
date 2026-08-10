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
  assistantSettingText,
  createAssistantConversation,
  deleteAssistantConversation,
  getAssistantConversations,
  getAssistantSettings,
  getAssistantVisitor,
  markAssistantConversationRead,
  setAssistantVisitor,
  subscribeAssistantStore,
} from '../data/assistantStore'
import { useLanguage } from '../i18n/LanguageContext'
import './BotAssistant.css'

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('fa-AF')
  } catch {
    return ''
  }
}

function extractProductImage(text) {
  const match = String(text || '').match(/عکس محصول:\s*(\S+)/)
  return match?.[1] || ''
}

const botLabels = {
  fa: {
    openAssistant: 'باز کردن دستیار هوشمند',
    closeAssistant: 'بستن دستیار هوشمند',
    close: 'بستن',
    newConversation: 'گفتگوی جدید',
    startConversation: 'شروع گفتگو',
    chat: 'چت',
    history: 'تاریخچه',
    chatWithName: 'گفتگو با نام',
    today: 'امروز',
    sendMessage: 'ارسال پیام',
    historyTitle: 'تاریخچه گفتگوها',
    savedConversations: 'گفتگو ذخیره شده است.',
    searchConversation: 'جستجوی گفتگو...',
    newConversationFallback: 'گفتگوی جدید',
    deleteConversation: 'حذف گفتگو',
    selectedProduct: 'محصول انتخاب‌شده',
    productImageReady: 'عکس محصول آماده ارسال است',
    removeProductAttachment: 'حذف ضمیمه محصول',
    productAlt: 'محصول',
  },
  ps: {
    openAssistant: 'هوښیار مرستیال پرانیزئ',
    closeAssistant: 'هوښیار مرستیال بند کړئ',
    close: 'بندول',
    newConversation: 'نوې خبرې',
    startConversation: 'خبرې پیل کړئ',
    chat: 'چټ',
    history: 'تاریخچه',
    chatWithName: 'د نوم سره خبرې',
    today: 'نن',
    sendMessage: 'پیغام لېږل',
    historyTitle: 'د خبرو تاریخچه',
    savedConversations: 'خبرې خوندي شوې دي.',
    searchConversation: 'خبرې ولټوئ...',
    newConversationFallback: 'نوې خبرې',
    deleteConversation: 'خبرې ړنګول',
    selectedProduct: 'ټاکل شوی محصول',
    productImageReady: 'د محصول عکس د لېږلو لپاره چمتو دی',
    removeProductAttachment: 'د محصول ضمیمه لرې کول',
    productAlt: 'محصول',
  },
  en: {
    openAssistant: 'Open smart assistant',
    closeAssistant: 'Close smart assistant',
    close: 'Close',
    newConversation: 'New conversation',
    startConversation: 'Start conversation',
    chat: 'Chat',
    history: 'History',
    chatWithName: 'Chatting as',
    today: 'Today',
    sendMessage: 'Send message',
    historyTitle: 'Conversation history',
    savedConversations: 'conversations saved.',
    searchConversation: 'Search conversations...',
    newConversationFallback: 'New conversation',
    deleteConversation: 'Delete conversation',
    selectedProduct: 'Selected product',
    productImageReady: 'Product image is ready to send',
    removeProductAttachment: 'Remove product attachment',
    productAlt: 'Product',
  },
}

function BotAssistant() {
  const { language, direction } = useLanguage()
  const labels = botLabels[language] || botLabels.fa
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
  const [pendingProductRequest, setPendingProductRequest] = useState(null)
  const messageListRef = useRef(null)

  const refreshStore = () => {
    setSettings(getAssistantSettings())
    setConversations(getAssistantConversations())
    setVisitorState(getAssistantVisitor())
  }

  useEffect(() => subscribeAssistantStore(refreshStore), [])

  useEffect(() => {
    const handleProductRequest = (event) => {
      const detail = event.detail || {}
      setPendingProductRequest(detail)
      setOpen(true)
      setActiveTab('chat')
    }

    window.addEventListener('alimi-assistant-product-request', handleProductRequest)
    return () => {
      window.removeEventListener('alimi-assistant-product-request', handleProductRequest)
    }
  }, [])

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

  useEffect(() => {
    if (!pendingProductRequest || !visitor?.name || activeConversation) return

    let cancelled = false

    const prepareConversation = async () => {
      const conversation = await createAssistantConversation(visitor.name, language)
      if (cancelled || !conversation) return
      setVisitorState(getAssistantVisitor())
      setActiveTab('chat')
    }

    prepareConversation()

    return () => {
      cancelled = true
    }
  }, [activeConversation, pendingProductRequest, visitor?.name, language])
  const setting = (field) => assistantSettingText(settings, field, language)
  if (!settings.enabled) return null

  const startWithName = async (event) => {
    event.preventDefault()
    const cleanName = nameInput.trim()
    if (!cleanName) return

    const conversation = await createAssistantConversation(cleanName, language)
    if (!conversation) return

    setNameInput('')
    setVisitorState(getAssistantVisitor())
    setActiveTab('chat')
  }

  const sendMessage = async (text) => {
    const cleanText = text.trim()
    if (!cleanText || !activeConversation?.id) return

    const productAttachmentText = pendingProductRequest
      ? [
          '',
          '---',
          'ضمیمه محصول',
          pendingProductRequest.productName ? `نام محصول: ${pendingProductRequest.productName}` : '',
          pendingProductRequest.productId ? `آیدی محصول: ${pendingProductRequest.productId}` : '',
          pendingProductRequest.productUrl ? `لینک محصول: ${pendingProductRequest.productUrl}` : '',
          pendingProductRequest.productImage ? `عکس محصول: ${pendingProductRequest.productImage}` : '',
        ].filter(Boolean).join('\n')
      : ''

    await addAssistantMessage(activeConversation.id, {
      sender: 'user',
      senderName: visitor?.name,
      text: `${cleanText}${productAttachmentText}`,
    })
    setMessage('')
    setPendingProductRequest(null)
    setActiveTab('chat')
  }

  const handleNewConversation = async () => {
    if (!visitor?.name) return
    const conversation = await createAssistantConversation(visitor.name, language)
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
        const replacement = await createAssistantConversation(visitor?.name, language)
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
        aria-label={open ? labels.closeAssistant : labels.openAssistant}
      >
        {open ? <X size={22} /> : <img src={botImage} alt={setting('title')} />}
      </button>

      {open && (
        <section className="alimi-bot-window" dir={direction}>
          <header className="alimi-bot-header">
            <div className="alimi-bot-header-profile">
              <span className="alimi-bot-header-avatar">
                <img src={botImage} alt="" />
              </span>

              <div>
                <strong>{setting('title')}</strong>
                <small>
                  <i />
                  {setting('statusText')}
                </small>
              </div>
            </div>

            <div className="alimi-bot-header-actions">
              {visitor?.name && (
                <button
                  type="button"
                  onClick={handleNewConversation}
                  aria-label={labels.newConversation}
                  title={labels.newConversation}
                >
                  <Plus size={18} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
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
              <h3>{setting('namePromptTitle')}</h3>
              <p>{setting('namePromptText')}</p>

              <form onSubmit={startWithName}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder={setting('namePlaceholder')}
                  maxLength={60}
                />
                <button type="submit" disabled={!nameInput.trim()}>
                  {labels.startConversation}
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
                  {labels.chat}
                </button>

                <button
                  type="button"
                  className={activeTab === 'history' ? 'is-active' : ''}
                  onClick={() => setActiveTab('history')}
                >
                  <History size={15} />
                  {labels.history}
                </button>
              </nav>

              <div className="alimi-bot-content">
                {activeTab === 'chat' && (
                  <main className="alimi-bot-chat">
                    <div className="alimi-bot-visitor-bar">
                      <span>{labels.chatWithName}</span>
                      <strong>{visitor.name}</strong>
                    </div>

                    <div className="alimi-bot-messages" ref={messageListRef}>
                      <div className="alimi-bot-chat-date">
                        <Clock3 size={12} />
                        {labels.today}
                      </div>

                      {activeConversation?.messages.map((item) => {
                        const isUser = item.sender === 'user'
                        const productImage = extractProductImage(item.text)
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
                                {productImage && (
                                  <img
                                    className="alimi-bot-message-product-image"
                                    src={productImage}
                                    alt=""
                                  />
                                )}
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
                      {pendingProductRequest && (
                        <div className="alimi-bot-product-attachment">
                          {pendingProductRequest.productImage && (
                            <img
                              src={pendingProductRequest.productImage}
                              alt={pendingProductRequest.productName || labels.productAlt}
                            />
                          )}
                          <span>
                            <strong>{pendingProductRequest.productName || labels.selectedProduct}</strong>
                            <small>{pendingProductRequest.productId ? `ID: ${pendingProductRequest.productId}` : labels.productImageReady}</small>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPendingProductRequest(null)}
                            aria-label={labels.removeProductAttachment}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )}

                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            sendMessage(message)
                          }
                        }}
                        placeholder={setting('messagePlaceholder')}
                        rows={1}
                      />

                      <button
                        type="submit"
                        disabled={!message.trim() || !activeConversation}
                        aria-label={labels.sendMessage}
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </main>
                )}

                {activeTab === 'history' && (
                  <div className="alimi-bot-panel">
                    <div className="alimi-bot-panel-title">
                      <strong>{labels.historyTitle}</strong>
                      <small>{visitorConversations.length} {labels.savedConversations}</small>
                    </div>

                    <label className="alimi-bot-search">
                      <Search size={16} />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={labels.searchConversation}
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
                                  .at(-1)?.text?.slice(0, 34) || labels.newConversationFallback}
                              </strong>
                              <small>{formatDate(conversation.updatedAt)}</small>
                            </span>
                          </button>

                          <button
                            type="button"
                            className="alimi-bot-history-delete"
                            onClick={() => removeConversation(conversation.id)}
                            aria-label={labels.deleteConversation}
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
