import { useMemo, useState } from 'react'
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
  X,
} from 'lucide-react'

import DashboardImages from './DashboardImages'
import ProjectsAdmin from './ProjectsAdmin'
import ProductsAdmin from './ProductsAdmin'
import AboutAdmin from './AboutAdmin'
import ContactAdmin from './ContactAdmin'

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
  return (
    <div className="management-settings-grid">
      <section className="management-settings-card">
        <div className="management-settings-card-header">
          <h3>معلومات شرکت</h3>
          <p>معلومات عمومی نمایش‌داده‌شده در وب‌سایت</p>
        </div>

        <div className="management-form-grid">
          <label>
            <span>نام شرکت</span>
            <input
              type="text"
              defaultValue="شرکت رنگ سازی علیمی"
            />
          </label>

          <label>
            <span>عنوان کوتاه</span>
            <input
              type="text"
              defaultValue="صنعت رنگ افغانستان"
            />
          </label>

          <label>
            <span>شماره تماس</span>
            <input
              type="text"
              defaultValue="0700 000 000"
              dir="ltr"
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              defaultValue="info@alimi.af"
              dir="ltr"
            />
          </label>

          <label className="management-full-field">
            <span>آدرس</span>
            <input
              type="text"
              defaultValue="کابل، افغانستان"
            />
          </label>

          <label className="management-full-field">
            <span>درباره شرکت</span>
            <textarea
              rows="5"
              defaultValue="شرکت رنگ سازی علیمی تولیدکننده رنگ‌های ساختمانی و صنعتی با کیفیت پایدار است."
            />
          </label>
        </div>

        <div className="management-settings-actions">
          <button type="button" className="management-save-button">
            ذخیره تغییرات
          </button>
        </div>
      </section>
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
            <span className="management-admin-avatar">A</span>

            <span>
              <strong>مدیر سیستم</strong>
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