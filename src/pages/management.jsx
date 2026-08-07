import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import {
  Images,
  Boxes,
  ChevronLeft,
  CircleGauge,
  FolderKanban,
  Layers3,
  LogOut,
  Mail,
  Menu,
  PackagePlus,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Bot,
  MessageSquareText,
  Send,
  Save,
  UserRound,
  CheckCircle2,
  X,
} from 'lucide-react'

import DashboardImages from './DashboardImages'
import ProjectsAdmin from './ProjectsAdmin'
import ProductsAdmin from './ProductsAdmin'
import AboutAdmin from './AboutAdmin'
import ContactAdmin from './ContactAdmin'
import {
  addAssistantMessage,
  deleteAssistantConversation,
  getAssistantConversations,
  getAssistantSettings,
  markAssistantConversationRead,
  saveAssistantSettings,
  subscribeAssistantStore,
} from '../data/assistantStore'

import './management.css'

const getManagementTabs = (t) => [
  {
    id: 'dashboard',
    label: t('admin.dashboard'),
    icon: CircleGauge,
  },
  {
    id: 'dashboard-images',
    label: t('admin.dashboardImages'),
    icon: Images,
  },
  {
    id: 'products',
    label: t('admin.products'),
    icon: Boxes,
  },
  {
    id: 'projects',
    label: t('admin.projects'),
    icon: FolderKanban,
  },
  {
    id: 'messages',
    label: t('admin.messages'),
    icon: Mail,
  },
  {
    id: 'about',
    label: t('admin.about'),
    icon: Users,
  },
  {
    id: 'settings',
    label: t('admin.settings'),
    icon: Settings,
  },
]


const messages = [
  {
    id: 1,
    name: 'محمد اکبری',
    phone: '0700 111 222',
    subject: 'درخواست قیمت رنگ صنعتی',
    date: '۱۴۰۵/۰۵/۱۲',
    status: 'جدید',
  },
  {
    id: 2,
    name: 'احمد صدیقی',
    phone: '0799 222 333',
    subject: 'همکاری در پروژه ساختمانی',
    date: '۱۴۰۵/۰۵/۱۰',
    status: 'پاسخ داده‌شده',
  },
  {
    id: 3,
    name: 'شرکت ساختمانی پامیر',
    phone: '0788 333 444',
    subject: 'خرید رنگ نمای بیرونی',
    date: '۱۴۰۵/۰۵/۰۸',
    status: 'جدید',
  },
]

function StatusBadge({ status }) {
  const normalizedStatus = String(status)
    .trim()
    .replaceAll(' ', '-')

  return (
    <span
      className={`management-status management-status-${normalizedStatus}`}
    >
      {status}
    </span>
  )
}

function TableActions() {
  return (
    <div className="management-table-actions">
      <button
        type="button"
        className="management-action-button management-edit-button"
        aria-label="ویرایش"
        title="ویرایش"
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        className="management-action-button management-delete-button"
        aria-label="حذف"
        title="حذف"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function DashboardTab() {
  const recentActivities = [
    {
      id: 1,
      title: 'محصول جدید ثبت شد',
      description: 'رنگ داخلی ممتاز به سیستم اضافه شد.',
      date: 'امروز، ۱۰:۳۰',
    },
    {
      id: 2,
      title: 'پروژه ویرایش شد',
      description: 'معلومات پروژه دفتر مرکزی به‌روزرسانی شد.',
      date: 'دیروز، ۱۵:۲۰',
    },
    {
      id: 3,
      title: 'پیام جدید دریافت شد',
      description: 'یک درخواست قیمت از طریق صفحه تماس ارسال شد.',
      date: 'دیروز، ۱۲:۱۰',
    },
  ]

  return (
    <div className="management-dashboard-content">
      <div className="management-statistics-grid">
        <article className="management-stat-card">
          <span className="management-stat-icon">
            <Boxes size={22} />
          </span>

          <div>
            <small>مجموع محصولات</small>
            <strong>۴۵</strong>
            <p>۴ محصول جدید در این ماه</p>
          </div>
        </article>

        <article className="management-stat-card">
          <span className="management-stat-icon">
            <Layers3 size={22} />
          </span>

          <div>
            <small>دسته‌بندی‌ها</small>
            <strong>۶</strong>
            <p>تمام دسته‌بندی‌های محصولات</p>
          </div>
        </article>

        <article className="management-stat-card">
          <span className="management-stat-icon">
            <FolderKanban size={22} />
          </span>

          <div>
            <small>پروژه‌ها</small>
            <strong>۱۸</strong>
            <p>۳ پروژه در حال اجرا</p>
          </div>
        </article>

        <article className="management-stat-card">
          <span className="management-stat-icon">
            <Mail size={22} />
          </span>

          <div>
            <small>پیام‌های جدید</small>
            <strong>۷</strong>
            <p>نیازمند بررسی مدیریت</p>
          </div>
        </article>
      </div>

      <div className="management-dashboard-panels">
        <section className="management-panel">
          <div className="management-panel-header">
            <div>
              <h3>آخرین فعالیت‌ها</h3>
              <p>تغییرات جدید انجام‌شده در سیستم</p>
            </div>
          </div>

          <div className="management-activity-list">
            {recentActivities.map((activity) => (
              <article
                className="management-activity-item"
                key={activity.id}
              >
                <span className="management-activity-dot" />

                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.description}</p>
                </div>

                <time>{activity.date}</time>
              </article>
            ))}
          </div>
        </section>

        <section className="management-panel">
          <div className="management-panel-header">
            <div>
              <h3>خلاصه وضعیت</h3>
              <p>وضعیت فعلی اطلاعات وب‌سایت</p>
            </div>
          </div>

          <div className="management-summary-list">
            <div>
              <span>محصولات فعال</span>
              <strong>۴۱ از ۴۵</strong>
            </div>

            <div>
              <span>پروژه‌های تکمیل‌شده</span>
              <strong>۱۵ از ۱۸</strong>
            </div>

            <div>
              <span>پیام‌های پاسخ‌داده‌شده</span>
              <strong>۲۸ از ۳۵</strong>
            </div>

            <div>
              <span>دسته‌بندی‌های فعال</span>
              <strong>۵ از ۶</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProductsTab({ searchTerm }) {
  return <ProductsAdmin searchTerm={searchTerm} />
}

function ProjectsTab({ searchTerm }) {
  return <ProjectsAdmin searchTerm={searchTerm} />
}

function MessagesTab({ searchTerm }) {
  const filteredMessages = messages.filter((message) =>
    `${message.name} ${message.phone} ${message.subject}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  return (
    <ManagementTable
      columns={[
        'شماره',
        'نام فرستنده',
        'شماره تماس',
        'موضوع',
        'تاریخ',
        'حالت',
        'عملیات',
      ]}
    >
      {filteredMessages.map((message, index) => (
        <tr key={message.id}>
          <td>{index + 1}</td>
          <td>
            <strong className="management-table-title">
              {message.name}
            </strong>
          </td>
          <td dir="ltr">{message.phone}</td>
          <td>{message.subject}</td>
          <td>{message.date}</td>
          <td>
            <StatusBadge status={message.status} />
          </td>
          <td>
            <TableActions />
          </td>
        </tr>
      ))}
    </ManagementTable>
  )
}

function SettingsTab() {
  const [settingsSection, setSettingsSection] = useState('assistant-settings')
  const [settings, setSettings] = useState(() => getAssistantSettings())
  const [conversations, setConversations] = useState(() =>
    getAssistantConversations(),
  )
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [search, setSearch] = useState('')
  const [reply, setReply] = useState('')
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const messagePaneRef = useRef(null)

  const refreshAssistantData = () => {
    setSettings(getAssistantSettings())
    const nextConversations = getAssistantConversations()
    setConversations(nextConversations)
    setActiveConversationId((current) => {
      if (current && nextConversations.some((item) => item.id === current)) {
        return current
      }
      return null
    })
  }

  useEffect(() => subscribeAssistantStore(refreshAssistantData), [])

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return conversations

    return conversations.filter((conversation) => {
      const fullText = [
        conversation.visitorName,
        ...conversation.messages.map((item) => item.text),
      ]
        .join(' ')
        .toLowerCase()
      return fullText.includes(query)
    })
  }, [conversations, search])

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) || null,
    [activeConversationId, conversations],
  )

  useEffect(() => {
    if (!activeConversation?.id) return
    requestAnimationFrame(() => {
      if (messagePaneRef.current) {
        messagePaneRef.current.scrollTop = messagePaneRef.current.scrollHeight
      }
    })
  }, [activeConversation?.id, activeConversation?.messages.length])

  const updateField = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const saveSettings = async () => {
    await saveAssistantSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const chooseConversation = async (conversationId) => {
    setActiveConversationId(conversationId)
    await markAssistantConversationRead(conversationId, 'admin')
  }

  const sendReply = async (event) => {
    event.preventDefault()
    const cleanReply = reply.trim()
    if (!cleanReply || !activeConversation?.id || sending) return

    setSending(true)
    try {
      await addAssistantMessage(activeConversation.id, {
        sender: 'admin',
        senderName: settings.adminName,
        text: cleanReply,
      })
      setReply('')
    } finally {
      setSending(false)
    }
  }

  const removeConversation = async (conversationId) => {
    await deleteAssistantConversation(conversationId)
    if (activeConversationId === conversationId) {
      setActiveConversationId(null)
    }
  }

  const totalUnread = conversations.reduce(
    (sum, conversation) => sum + Number(conversation.unreadByAdmin || 0),
    0,
  )

  return (
    <div className="assistant-admin-layout">
      <nav className="assistant-settings-tabs" aria-label="بخش‌های تنظیمات دستیار">
        <button
          type="button"
          className={settingsSection === 'assistant-settings' ? 'is-active' : ''}
          onClick={() => setSettingsSection('assistant-settings')}
        >
          <Bot size={17} />
          تنظیمات دستیار
        </button>

        <button
          type="button"
          className={settingsSection === 'assistant-messages' ? 'is-active' : ''}
          onClick={() => setSettingsSection('assistant-messages')}
        >
          <MessageSquareText size={17} />
          پیام‌های دستیار
          {totalUnread > 0 && <b>{totalUnread}</b>}
        </button>
      </nav>

      {settingsSection === 'assistant-settings' && (
        <section className="management-settings-card assistant-settings-card">
          <div className="management-settings-card-header assistant-settings-heading">
            <div>
              <span className="assistant-settings-icon">
                <Bot size={22} />
              </span>
              <div>
                <h3>دستیار هوشمند علیمی</h3>
                <p>نام ادمین، متن‌های دستیار و حالت نمایش آن را مدیریت کنید.</p>
              </div>
            </div>

            <label className="assistant-enable-toggle">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) => updateField('enabled', event.target.checked)}
              />
              <span />
              <b>{settings.enabled ? 'فعال' : 'غیرفعال'}</b>
            </label>
          </div>

          <div className="management-form-grid assistant-settings-form">
            <label>
              <span>نام دستیار</span>
              <input
                type="text"
                value={settings.title}
                onChange={(event) => updateField('title', event.target.value)}
              />
            </label>

            <label>
              <span>نام ادمین</span>
              <input
                type="text"
                value={settings.adminName}
                onChange={(event) => updateField('adminName', event.target.value)}
                placeholder="مثلاً: احمد - بخش فروش"
              />
            </label>

            <label>
              <span>متن حالت آنلاین</span>
              <input
                type="text"
                value={settings.statusText}
                onChange={(event) => updateField('statusText', event.target.value)}
              />
            </label>

            <label>
              <span>متن داخل کادر پیام</span>
              <input
                type="text"
                value={settings.messagePlaceholder}
                onChange={(event) =>
                  updateField('messagePlaceholder', event.target.value)
                }
              />
            </label>

            <label>
              <span>عنوان درخواست نام کاربر</span>
              <input
                type="text"
                value={settings.namePromptTitle}
                onChange={(event) =>
                  updateField('namePromptTitle', event.target.value)
                }
              />
            </label>

            <label>
              <span>متن داخل کادر نام</span>
              <input
                type="text"
                value={settings.namePlaceholder}
                onChange={(event) =>
                  updateField('namePlaceholder', event.target.value)
                }
              />
            </label>

            <label className="management-full-field">
              <span>توضیح مرحله دریافت نام</span>
              <textarea
                rows="3"
                value={settings.namePromptText}
                onChange={(event) =>
                  updateField('namePromptText', event.target.value)
                }
              />
            </label>

            <label className="management-full-field">
              <span>پیام خوش‌آمدگویی</span>
              <textarea
                rows="3"
                value={settings.welcomeMessage}
                onChange={(event) =>
                  updateField('welcomeMessage', event.target.value)
                }
              />
              <small className="assistant-field-help">
                برای نمایش نام کاربر از <code>{'{name}'}</code> استفاده کنید.
              </small>
            </label>
          </div>

          <div className="management-settings-actions assistant-settings-actions">
            <button
              type="button"
              className="management-save-button"
              onClick={saveSettings}
            >
              {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
              {saved ? 'ذخیره شد' : 'ذخیره تنظیمات دستیار'}
            </button>
          </div>
        </section>
      )}

      {settingsSection === 'assistant-messages' && (
        <section className="management-settings-card assistant-messages-card">
          <div className="management-settings-card-header assistant-message-header">
            <div>
              <span className="assistant-settings-icon">
                <MessageSquareText size={22} />
              </span>
              <div>
                <h3>پیام‌های دستیار</h3>
                <p>گفتگوهای همه کاربران و Browserها را به‌صورت زنده مدیریت کنید.</p>
              </div>
            </div>

            <span className="assistant-unread-summary">
              {totalUnread} پیام خوانده‌نشده
            </span>
          </div>

          <div className="assistant-inbox">
            <aside className="assistant-inbox-list">
              <label className="assistant-inbox-search">
                <Search size={16} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجو در پیام‌ها..."
                />
              </label>

              <div className="assistant-conversation-list">
                {filteredConversations.length ? (
                  filteredConversations.map((conversation) => {
                    const lastMessage = conversation.messages.at(-1)
                    const hasUnread = Number(conversation.unreadByAdmin || 0) > 0
                    return (
                      <button
                        type="button"
                        key={conversation.id}
                        className={
                          activeConversationId === conversation.id
                            ? 'assistant-conversation-item is-active'
                            : 'assistant-conversation-item'
                        }
                        onClick={() => chooseConversation(conversation.id)}
                      >
                        <span className="assistant-conversation-avatar">
                          <UserRound size={18} />
                          {hasUnread && <i className="assistant-profile-online-dot" />}
                        </span>
                        <span className="assistant-conversation-copy">
                          <strong>{conversation.visitorName}</strong>
                          <small>{lastMessage?.text || 'گفتگوی جدید'}</small>
                        </span>
                        <span className="assistant-conversation-meta">
                          <time>
                            {new Date(conversation.updatedAt).toLocaleDateString(
                              'fa-AF',
                            )}
                          </time>
                          {hasUnread && <b>{conversation.unreadByAdmin}</b>}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <div className="assistant-empty-list">
                    هنوز پیامی از کاربران دریافت نشده است.
                  </div>
                )}
              </div>
            </aside>

            <div className="assistant-chat-admin">
              {activeConversation ? (
                <>
                  <header className="assistant-chat-admin-header">
                    <div>
                      <span className="assistant-conversation-avatar">
                        <UserRound size={18} />
                      </span>
                      <span>
                        <strong>{activeConversation.visitorName}</strong>
                        <small>گفتگوی مستقیم با کاربر</small>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="assistant-delete-chat"
                      onClick={() => removeConversation(activeConversation.id)}
                      title="حذف گفتگو"
                    >
                      <Trash2 size={16} />
                    </button>
                  </header>

                  <div className="assistant-admin-messages" ref={messagePaneRef}>
                    {activeConversation.messages.map((item) => {
                      const fromAdmin = item.sender === 'admin'
                      return (
                        <div
                          key={item.id}
                          className={
                            fromAdmin
                              ? 'assistant-admin-message is-admin'
                              : 'assistant-admin-message is-user'
                          }
                        >
                          <span>{item.senderName}</span>
                          <div>{item.text}</div>
                          <time>
                            {new Date(item.createdAt).toLocaleTimeString('fa-AF', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </div>
                      )
                    })}
                  </div>

                  <form className="assistant-admin-composer" onSubmit={sendReply}>
                    <textarea
                      rows="1"
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          sendReply(event)
                        }
                      }}
                      placeholder={`پاسخ به ${activeConversation.visitorName}...`}
                    />
                    <button type="submit" disabled={!reply.trim() || sending}>
                      <Send size={17} />
                      {sending ? 'در حال ارسال...' : 'ارسال'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="assistant-chat-empty">
                  <MessageSquareText size={38} />
                  <strong>یک گفتگو را انتخاب کنید</strong>
                  <p>گفتگوهای دارای نقطه سبز، پیام خوانده‌نشده دارند.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ManagementTable({ columns, children }) {
  return (
    <div className="management-table-container">
      <div className="management-table-scroll">
        <table className="management-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

function Management() {
  const {
    direction,
    language,
    setLanguage,
    languages,
    currentLanguage,
    t,
  } = useLanguage()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [assistantSettings, setAssistantSettings] = useState(() =>
    getAssistantSettings(),
  )

  useEffect(
    () => subscribeAssistantStore(() => setAssistantSettings(getAssistantSettings())),
    [],
  )

  const managementTabs = useMemo(
    () => getManagementTabs(t),
    [language],
  )

  const activeTabInformation = useMemo(
    () =>
      managementTabs.find((tab) => tab.id === activeTab) ||
      managementTabs[0],
    [activeTab, managementTabs],
  )

  const ActiveTabIcon = activeTabInformation.icon

  const changeTab = (tabId) => {
    setActiveTab(tabId)
    setSearchTerm('')
    setSidebarOpen(false)
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard-images':
        return <DashboardImages />

      case 'products':
        return <ProductsTab searchTerm={searchTerm} />

      case 'projects':
        return <ProjectsTab searchTerm={searchTerm} />

      case 'messages':
        return <ContactAdmin />

      case 'about':
        return <AboutAdmin />

      case 'settings':
        return <SettingsTab />

      case 'dashboard':
      default:
        return <DashboardTab />
    }
  }

  const showSearch =
    activeTab !== 'dashboard' &&
    activeTab !== 'dashboard-images' &&
    activeTab !== 'settings' &&
    activeTab !== 'about' &&
    activeTab !== 'messages'

  const showStandardContentHeader =
    activeTab !== 'dashboard-images'

  return (
   <div
  className={`management-page management-page-${direction}`}
  dir={direction}
  data-language={language}
>
      <aside
        className={
          sidebarOpen
            ? 'management-sidebar management-sidebar-open'
            : 'management-sidebar'
        }
      >
        <div className="management-sidebar-header">
          <a className="management-logo" href="/">
            <span className="management-logo-icon">
              <Palette size={24} />
            </span>

            <span>
              <strong>علیمی</strong>
              <small>پنل مدیریت وب‌سایت</small>
            </span>
          </a>

          <button
            type="button"
            className="management-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="بستن منو"
          >
            <X size={21} />
          </button>
        </div>

        <div className="management-sidebar-label">
          مدیریت وب‌سایت
        </div>

        <nav className="management-sidebar-navigation">
          {managementTabs.map((tab) => {
            const TabIcon = tab.icon

            return (
              <button
                type="button"
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? 'management-sidebar-tab management-sidebar-tab-active'
                    : 'management-sidebar-tab'
                }
                onClick={() => changeTab(tab.id)}
              >
                <span className="management-sidebar-tab-icon">
                  <TabIcon size={19} />
                </span>

                <span>{tab.label}</span>

                <ChevronLeft
                  className="management-sidebar-arrow"
                  size={16}
                />
              </button>
            )
          })}
        </nav>

        <div className="management-sidebar-footer">
          <a href="/" className="management-back-link">
            <LogOut size={18} />
            بازگشت به وب‌سایت
          </a>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="management-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="بستن منو"
        />
      )}

      <main className="management-main">
        <header className="management-topbar">
          <div className="management-topbar-start">
            <button
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu size={22} />
            </button>

            <div className="management-page-heading">
              <span className="management-page-heading-icon">
                <ActiveTabIcon size={20} />
              </span>

              <div>
                <h1>مدیریت {activeTabInformation.label}</h1>
                <p>
                  معلومات این بخش را مشاهده و مدیریت کنید.
                </p>
              </div>
            </div>
          </div>

          <div className="management-admin-profile">
            <span className="management-admin-avatar">{assistantSettings.adminName?.trim()?.charAt(0) || 'A'}</span>

            <span>
              <strong>{assistantSettings.adminName || 'مدیر سیستم'}</strong>
              <small>Administrator</small>
            </span>
          </div>
        </header>

        <div className="management-content">
          {showStandardContentHeader && (
            <section className="management-content-header">
              <div>
                <h2>{activeTabInformation.label}</h2>
                <p>
                  مدیریت معلومات مربوط به بخش{' '}
                  {activeTabInformation.label}
                </p>
              </div>

              <div className="management-content-actions">
                {showSearch && (
                  <label className="management-search">
                    <Search size={18} />

                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="جستجو..."
                    />
                  </label>
                )}

                {activeTab !== 'dashboard' &&
                  activeTab !== 'settings' &&
                  activeTab !== 'projects' &&
                  activeTab !== 'products' &&
                  activeTab !== 'about' &&
                  activeTab !== 'messages' && (
                    <button
                      type="button"
                      className="management-add-button"
                    >
                      <Plus size={18} />
                      افزودن مورد جدید
                    </button>
                  )}
              </div>
            </section>
          )}

          {renderActiveTab()}
        </div>
      </main>
    </div>
  )
}

export default Management