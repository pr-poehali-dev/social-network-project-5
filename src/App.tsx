import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const AUTH_URL = 'https://functions.poehali.dev/5b596f5c-cdae-4f25-a488-beffe3a44eed';

async function authApi(action: string, data: object = {}, sessionId?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionId) headers['X-Session-Id'] = sessionId;
  const res = await fetch(`${AUTH_URL}?action=${action}`, {
    method: action === 'me' ? 'GET' : 'POST',
    headers,
    body: action === 'me' ? undefined : JSON.stringify({ action, ...data }),
  });
  return res.json();
}

type AuthUser = { id: number; username: string; display_name: string; email: string; bio: string; avatar_color: string };
type Page = 'feed' | 'profile' | 'messages' | 'notifications' | 'search' | 'subscriptions' | 'settings';

const MOCK_VIDEOS = [
  {
    id: 1,
    user: 'Алексей Звёздный',
    avatar: 'АЗ',
    avatarColor: 'from-blue-500 to-cyan-400',
    time: '2 часа назад',
    title: 'Как я снял закат на МКС — 4K таймлапс',
    views: '124K',
    likes: 4820,
    comments: 312,
    liked: false,
    duration: '12:47',
    thumb: 'from-blue-900 via-indigo-800 to-blue-950',
  },
  {
    id: 2,
    user: 'Марина Облако',
    avatar: 'МО',
    avatarColor: 'from-violet-500 to-blue-500',
    time: '5 часов назад',
    title: 'Разбор новых функций — полный обзор 2026',
    views: '87K',
    likes: 2140,
    comments: 98,
    liked: true,
    duration: '8:23',
    thumb: 'from-slate-900 via-blue-950 to-slate-800',
  },
  {
    id: 3,
    user: 'DevStream RU',
    avatar: 'DS',
    avatarColor: 'from-sky-500 to-blue-600',
    time: '1 день назад',
    title: 'Live-кодинг: пишем соцсеть с нуля за 3 часа',
    views: '203K',
    likes: 9100,
    comments: 674,
    liked: false,
    duration: '3:02:11',
    thumb: 'from-blue-950 via-cyan-900 to-blue-900',
  },
  {
    id: 4,
    user: 'Наука Рядом',
    avatar: 'НР',
    avatarColor: 'from-teal-500 to-blue-500',
    time: '3 дня назад',
    title: 'Почему небо синее: объяснение за 5 минут',
    views: '541K',
    likes: 21300,
    comments: 1450,
    liked: false,
    duration: '5:01',
    thumb: 'from-sky-950 via-blue-900 to-indigo-950',
  },
];

const MOCK_MESSAGES = [
  { id: 1, name: 'Алексей Звёздный', avatar: 'АЗ', color: 'from-blue-500 to-cyan-400', text: 'Классное видео, жду новое!', time: '10:42', unread: 2 },
  { id: 2, name: 'Марина Облако', avatar: 'МО', color: 'from-violet-500 to-blue-500', text: 'Спасибо за подписку 🙌', time: '09:15', unread: 0 },
  { id: 3, name: 'DevStream RU', avatar: 'DS', color: 'from-sky-500 to-blue-600', text: 'Стрим сегодня в 20:00!', time: 'Вчера', unread: 5 },
  { id: 4, name: 'Наука Рядом', avatar: 'НР', color: 'from-teal-500 to-blue-500', text: 'Ответил на ваш комментарий', time: 'Вчера', unread: 0 },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: 'Heart', color: 'text-rose-400', bg: 'bg-rose-500/10', text: 'Алексей Звёздный лайкнул ваше видео', time: '5 мин назад', read: false },
  { id: 2, icon: 'MessageCircle', color: 'text-blue-400', bg: 'bg-blue-500/10', text: 'Марина Облако оставила комментарий: «Отличная работа!»', time: '1 час назад', read: false },
  { id: 3, icon: 'UserPlus', color: 'text-emerald-400', bg: 'bg-emerald-500/10', text: 'DevStream RU подписался на вас', time: '3 часа назад', read: true },
  { id: 4, icon: 'Play', color: 'text-sky-400', bg: 'bg-sky-500/10', text: 'Новое видео от Наука Рядом: «Квантовая физика»', time: 'Вчера', read: true },
  { id: 5, icon: 'Heart', color: 'text-rose-400', bg: 'bg-rose-500/10', text: 'Ваше видео набрало 10 000 просмотров!', time: '2 дня назад', read: true },
];

const MOCK_SUBSCRIPTIONS = [
  { id: 1, name: 'Алексей Звёздный', avatar: 'АЗ', color: 'from-blue-500 to-cyan-400', subs: '124K', videos: 48, isLive: true },
  { id: 2, name: 'Марина Облако', avatar: 'МО', color: 'from-violet-500 to-blue-500', subs: '87K', videos: 31, isLive: false },
  { id: 3, name: 'DevStream RU', avatar: 'DS', color: 'from-sky-500 to-blue-600', subs: '203K', videos: 126, isLive: false },
  { id: 4, name: 'Наука Рядом', avatar: 'НР', color: 'from-teal-500 to-blue-500', subs: '541K', videos: 89, isLive: false },
  { id: 5, name: 'ТехноТок', avatar: 'ТТ', color: 'from-blue-600 to-indigo-500', subs: '32K', videos: 17, isLive: false },
];

const SEARCH_RESULTS = [
  { id: 1, title: 'Как снять идеальное видео на телефон', channel: 'Алексей Звёздный', views: '1.2M', duration: '14:20', thumb: 'from-blue-900 to-indigo-900' },
  { id: 2, title: 'Топ-10 приложений 2026 года', channel: 'ТехноТок', views: '340K', duration: '9:55', thumb: 'from-slate-900 to-blue-950' },
  { id: 3, title: 'Прямой эфир: разбор вопросов подписчиков', channel: 'DevStream RU', views: '88K', duration: 'LIVE', thumb: 'from-blue-950 to-cyan-900' },
];

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ username: '', display_name: '', email: '', login: '', password: '' });

  const [page, setPage] = useState<Page>('feed');
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [openVideo, setOpenVideo] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem('session_id');
    if (!sid) { setAuthLoading(false); setAuthScreen('login'); return; }
    authApi('me', {}, sid).then(data => {
      if (data.user) setUser(data.user);
      else { localStorage.removeItem('session_id'); setAuthScreen('login'); }
      setAuthLoading(false);
    }).catch(() => { setAuthLoading(false); setAuthScreen('login'); });
  }, []);

  const handleAuth = async (action: 'login' | 'register') => {
    setAuthError('');
    const data = action === 'login'
      ? { login: authForm.login, password: authForm.password }
      : { username: authForm.username, display_name: authForm.display_name, email: authForm.email, password: authForm.password };
    const res = await authApi(action, data);
    if (res.error) { setAuthError(res.error); return; }
    localStorage.setItem('session_id', res.session_id);
    setUser(res.user);
    setAuthScreen(null);
  };

  const handleLogout = async () => {
    const sid = localStorage.getItem('session_id');
    await authApi('logout', {}, sid || undefined);
    localStorage.removeItem('session_id');
    setUser(null);
    setAuthScreen('login');
  };

  const nav = [
    { id: 'feed', icon: 'Home', label: 'Лента' },
    { id: 'search', icon: 'Search', label: 'Поиск' },
    { id: 'subscriptions', icon: 'Rss', label: 'Подписки' },
    { id: 'messages', icon: 'MessageCircle', label: 'Сообщения' },
    { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ] as const;

  const unreadMessages = MOCK_MESSAGES.reduce((a, m) => a + m.unread, 0);
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  const toggleLike = (id: number) => {
    setVideos(vs => vs.map(v => v.id === id
      ? { ...v, liked: !v.liked, likes: v.liked ? v.likes - 1 : v.likes + 1 }
      : v
    ));
  };

  const currentVideo = openVideo ? videos.find(v => v.id === openVideo) : null;

  const avatarInitials = user
    ? user.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ВМ';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue animate-pulse">
            <Icon name="Zap" size={22} className="text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (authScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue mb-1">
              <Icon name="Zap" size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">СоцСеть</h1>
            <p className="text-sm text-muted-foreground">
              {authScreen === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
            {authScreen === 'register' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Имя пользователя</label>
                  <input
                    type="text"
                    placeholder="например: ivan_petrov"
                    value={authForm.username}
                    onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full bg-muted/60 border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Отображаемое имя</label>
                  <input
                    type="text"
                    placeholder="Иван Петров"
                    value={authForm.display_name}
                    onChange={e => setAuthForm(f => ({ ...f, display_name: e.target.value }))}
                    className="w-full bg-muted/60 border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="ivan@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-muted/60 border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </>
            )}

            {authScreen === 'login' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Логин или Email</label>
                <input
                  type="text"
                  placeholder="ivan_petrov или ivan@example.com"
                  value={authForm.login}
                  onChange={e => setAuthForm(f => ({ ...f, login: e.target.value }))}
                  className="w-full bg-muted/60 border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={authForm.password}
                onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAuth(authScreen)}
                className="w-full bg-muted/60 border border-border/60 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5 text-sm text-rose-400">
                {authError}
              </div>
            )}

            <button
              onClick={() => handleAuth(authScreen)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-1"
            >
              {authScreen === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {authScreen === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button
              onClick={() => { setAuthScreen(authScreen === 'login' ? 'register' : 'login'); setAuthError(''); setAuthForm({ username: '', display_name: '', email: '', login: '', password: '' }); }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {authScreen === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-golos flex">

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 glass sticky top-0 h-screen z-30">
        <div className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">СоцСеть</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${page === item.id
                  ? 'nav-item-active'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
            >
              <Icon name={item.icon} size={18} className={page === item.id ? 'text-blue-400' : 'text-muted-foreground group-hover:text-foreground transition-colors'} />
              <span>{item.label}</span>
              {item.id === 'messages' && unreadMessages > 0 && (
                <span className="ml-auto text-[11px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadMessages}
                </span>
              )}
              {item.id === 'notifications' && unreadNotifs > 0 && (
                <span className="ml-auto text-[11px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border/60">
          <button onClick={() => setPage('profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user?.avatar_color || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
              {avatarInitials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold truncate">{user?.display_name || 'Профиль'}</div>
              <div className="text-xs text-muted-foreground truncate">@{user?.username || ''}</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 glass border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Icon name="Zap" size={13} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">СоцСеть</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute top-0 right-0 w-64 h-full glass border-l border-border/60" onClick={e => e.stopPropagation()}>
              <div className="px-4 py-4 border-b border-border/60 flex items-center justify-between">
                <span className="font-bold">Меню</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/60">
                  <Icon name="X" size={18} />
                </button>
              </div>
              <nav className="p-3 space-y-0.5">
                {nav.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${page === item.id ? 'nav-item-active' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                    {item.id === 'messages' && unreadMessages > 0 && (
                      <span className="ml-auto text-[11px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
                    )}
                    {item.id === 'notifications' && unreadNotifs > 0 && (
                      <span className="ml-auto text-[11px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Bottom nav mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/60 flex">
          {nav.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors
                ${page === item.id ? 'text-blue-400' : 'text-muted-foreground'}`}
            >
              <Icon name={item.icon} size={20} />
              {item.id === 'messages' && unreadMessages > 0 && (
                <span className="absolute top-2 right-1/4 text-[9px] font-bold bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>
              )}
              {item.id === 'notifications' && unreadNotifs > 0 && (
                <span className="absolute top-2 right-1/4 text-[9px] font-bold bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifs}</span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">

          {/* FEED */}
          {page === 'feed' && (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold">Лента</h1>
                <button className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  <Icon name="Plus" size={16} />
                  <span>Загрузить</span>
                </button>
              </div>

              {/* Stories */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {['Вы', ...MOCK_SUBSCRIPTIONS.slice(0, 4).map(s => s.name.split(' ')[0])].map((name, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
                    <div className={`w-14 h-14 rounded-full p-0.5 ${i === 0 ? 'border-2 border-dashed border-border' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold
                        ${i === 0 ? 'bg-muted text-muted-foreground' : 'bg-card text-foreground'}`}>
                        {i === 0 ? <Icon name="Plus" size={18} className="text-muted-foreground" /> : name.slice(0, 2)}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[56px] text-center">
                      {i === 0 ? 'Добавить' : name}
                    </span>
                  </div>
                ))}
              </div>

              {videos.map((v, i) => (
                <article
                  key={v.id}
                  className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${v.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                      {v.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{v.user}</div>
                      <div className="text-xs text-muted-foreground">{v.time}</div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground">
                      <Icon name="MoreHorizontal" size={16} />
                    </button>
                  </div>

                  <div
                    className={`relative mx-4 rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br ${v.thumb} aspect-video group`}
                    onClick={() => setOpenVideo(v.id)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon name="Play" size={24} className="text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                      {v.duration}
                    </div>
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                  </div>

                  <div className="px-4 pt-3 pb-1">
                    <p className="text-sm font-semibold leading-snug cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setOpenVideo(v.id)}>
                      {v.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{v.views} просмотров</p>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-2 border-t border-border/40 mt-2">
                    <button
                      onClick={() => toggleLike(v.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105
                        ${v.liked ? 'text-rose-400 bg-rose-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
                    >
                      <Icon name="Heart" size={16} className={v.liked ? 'fill-current' : ''} />
                      <span>{v.likes.toLocaleString('ru')}</span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                      onClick={() => setOpenVideo(v.id)}
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>{v.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all ml-auto">
                      <Icon name="Share2" size={16} />
                      <span>Поделиться</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* SEARCH */}
          {page === 'search' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <h1 className="text-xl font-bold mb-4">Поиск</h1>
              <div className="relative mb-5">
                <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск видео, каналов, тем..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                />
              </div>

              {searchQuery === '' && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Популярные темы</p>
                  <div className="flex flex-wrap gap-2">
                    {['Технологии', 'Наука', 'Музыка', 'Игры', 'Программирование', 'Путешествия', 'Кино', 'Спорт'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-sm px-3 py-1.5 rounded-xl bg-card border border-border/60 hover:border-blue-500/40 hover:text-blue-400 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(searchQuery
                  ? SEARCH_RESULTS.filter(r =>
                      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.channel.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  : SEARCH_RESULTS
                ).map(r => (
                  <div key={r.id} className="flex gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-blue-500/30 cursor-pointer transition-all group">
                    <div className={`w-32 h-20 rounded-xl bg-gradient-to-br ${r.thumb} flex items-center justify-center shrink-0 relative`}>
                      <Icon name="Play" size={20} className="text-white/70 group-hover:text-white transition-colors" />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded font-mono">{r.duration}</div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="text-sm font-semibold leading-snug group-hover:text-blue-400 transition-colors">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.channel}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.views} просмотров</p>
                    </div>
                  </div>
                ))}
                {searchQuery && SEARCH_RESULTS.filter(r =>
                  r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.channel.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">По запросу «{searchQuery}» ничего не найдено</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS */}
          {page === 'subscriptions' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <h1 className="text-xl font-bold mb-4">Подписки</h1>
              <div className="space-y-2">
                {MOCK_SUBSCRIPTIONS.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl px-4 py-3.5 hover:border-blue-500/30 transition-all cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-sm font-bold text-white`}>
                        {s.avatar}
                      </div>
                      {s.isLive && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-full">LIVE</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{s.name}</span>
                        {s.isLive && <span className="text-xs text-red-400 font-medium animate-pulse">● эфир</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.subs} подписчиков · {s.videos} видео</div>
                    </div>
                    <button className="text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl transition-colors shrink-0">
                      Открыть
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {page === 'messages' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Сообщения</h1>
                <button className="p-2 rounded-xl hover:bg-muted/60 transition-colors text-blue-400">
                  <Icon name="Edit" size={18} />
                </button>
              </div>
              <div className="space-y-1.5">
                {MOCK_MESSAGES.map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-card border border-transparent hover:border-border/60 cursor-pointer transition-all animate-fade-in"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-semibold truncate ${m.unread > 0 ? 'text-foreground' : 'text-foreground/80'}`}>{m.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{m.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs truncate ${m.unread > 0 ? 'text-foreground/80' : 'text-muted-foreground'}`}>{m.text}</span>
                        {m.unread > 0 && (
                          <span className="ml-2 text-[11px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full shrink-0">{m.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {page === 'notifications' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Уведомления</h1>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">Прочитать все</button>
              </div>
              <div className="space-y-2">
                {MOCK_NOTIFICATIONS.map((n, i) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all animate-fade-in
                      ${n.read ? 'bg-card/50 border-border/40' : 'bg-card border-blue-500/20'}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={`w-9 h-9 rounded-xl ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon name={n.icon} size={16} className={n.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? 'text-foreground/70' : 'text-foreground font-medium'}`}>{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {page === 'profile' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <div className="relative h-36 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 mb-14 overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)'}} />
                <div className="absolute -bottom-10 left-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${user?.avatar_color || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-xl font-bold text-white border-4 border-background glow-blue`}>
                    {avatarInitials}
                  </div>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold">{user?.display_name}</h2>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                  </div>
                  <button className="text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors">
                    Редактировать
                  </button>
                </div>
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                  {user?.bio || 'Расскажите о себе — нажмите «Редактировать»'}
                </p>

                <div className="flex gap-5 mb-5 text-sm">
                  {[['4', 'Видео'], ['5', 'Подписки'], ['1.2K', 'Подписчики']].map(([val, label]) => (
                    <div key={label} className="text-center">
                      <div className="font-bold text-lg">{val}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Мои видео</p>
                  <div className="grid grid-cols-2 gap-3">
                    {videos.slice(0, 4).map(v => (
                      <div
                        key={v.id}
                        className={`aspect-video rounded-xl bg-gradient-to-br ${v.thumb} relative overflow-hidden cursor-pointer group`}
                        onClick={() => setOpenVideo(v.id)}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Icon name="Play" size={24} className="text-white/0 group-hover:text-white/90 transition-colors" />
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded font-mono">{v.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
              <h1 className="text-xl font-bold mb-5">Настройки</h1>
              {[
                { label: 'Аккаунт', items: [
                  { icon: 'User', text: 'Личные данные', desc: 'Имя, фото, описание' },
                  { icon: 'Lock', text: 'Безопасность', desc: 'Пароль, двухфакторная аутентификация' },
                  { icon: 'Mail', text: 'Email и телефон', desc: 'Контактные данные' },
                ]},
                { label: 'Приложение', items: [
                  { icon: 'Bell', text: 'Уведомления', desc: 'Настройка оповещений' },
                  { icon: 'Shield', text: 'Приватность', desc: 'Кто видит ваш контент' },
                  { icon: 'Palette', text: 'Внешний вид', desc: 'Тема, язык, шрифт' },
                ]},
                { label: 'Контент', items: [
                  { icon: 'Upload', text: 'Загрузка видео', desc: 'Качество, теги, описание' },
                  { icon: 'Download', text: 'Скачивание', desc: 'Офлайн-просмотр' },
                ]},
              ].map(group => (
                <div key={group.label} className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{group.label}</p>
                  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40">
                    {group.items.map(item => (
                      <button key={item.text} className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Icon name={item.icon} size={17} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{item.text}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <button onClick={handleLogout} className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-rose-500/5 transition-colors text-left">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                    <Icon name="LogOut" size={17} className="text-rose-400" />
                  </div>
                  <span className="text-sm font-medium text-rose-400">Выйти из аккаунта</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Video Modal */}
      {openVideo && currentVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-4 px-4"
          onClick={() => setOpenVideo(null)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-full aspect-video bg-gradient-to-br ${currentVideo.thumb} relative flex items-center justify-center`}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <Icon name="Play" size={26} className="text-white ml-1" />
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs text-white font-mono">{currentVideo.duration}</span>
                </div>
              </div>
              <button
                onClick={() => setOpenVideo(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Icon name="X" size={16} className="text-white" />
              </button>
            </div>

            <div className="p-4">
              <h2 className="text-base font-bold mb-1">{currentVideo.title}</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentVideo.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {currentVideo.avatar}
                </div>
                <span className="text-sm text-muted-foreground">{currentVideo.user}</span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{currentVideo.views} просм.</span>
              </div>

              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <button
                  onClick={() => toggleLike(currentVideo.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${currentVideo.liked ? 'text-rose-400 bg-rose-500/10' : 'text-muted-foreground bg-muted/60 hover:text-foreground'}`}
                >
                  <Icon name="Heart" size={16} className={currentVideo.liked ? 'fill-current' : ''} />
                  <span>{currentVideo.likes.toLocaleString('ru')}</span>
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-muted/60 hover:text-foreground transition-all">
                  <Icon name="Share2" size={16} />
                  <span>Поделиться</span>
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-muted/60 hover:text-foreground transition-all ml-auto">
                  <Icon name="BookmarkPlus" size={16} />
                  <span>Сохранить</span>
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold mb-3">{currentVideo.comments} комментариев</p>
                <div className="flex gap-2.5 mb-3">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user?.avatar_color || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5`}>
                    {avatarInitials}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Написать комментарий..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="flex-1 bg-muted/60 border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground"
                    />
                    <button
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-40 text-sm font-medium"
                      disabled={!comment.trim()}
                      onClick={() => setComment('')}
                    >
                      <Icon name="Send" size={16} />
                    </button>
                  </div>
                </div>
                {[
                  { user: 'Наука Рядом', avatar: 'НР', color: 'from-teal-500 to-blue-500', text: 'Отличный контент, продолжай в том же духе!', time: '1 час назад', likes: 42 },
                  { user: 'ТехноТок', avatar: 'ТТ', color: 'from-blue-600 to-indigo-500', text: 'Подписался, жду новых видео 🔥', time: '3 часа назад', likes: 18 },
                ].map((c, i) => (
                  <div key={i} className="flex gap-2.5 py-2.5 border-t border-border/40">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5`}>
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{c.user}</span>
                        <span className="text-[11px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-sm text-foreground/85">{c.text}</p>
                      <button className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-rose-400 transition-colors">
                        <Icon name="Heart" size={12} />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}