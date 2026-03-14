'use client';

import { useState, useEffect, useRef, type ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import logoSrc from '@/app/assets/logo/career.pilot.ai.icon.png';
import {
  Home,
  FileText,
  Sparkles,
  Briefcase,
  Search,
  Mic,
  ClipboardList,
  BarChart3,
  User,
  Shield,
  CreditCard,
  Receipt,
  Mail,
  DollarSign,
  KeyRound,
  Zap,
  Users,
  Ruler,
  Gem,
  TrendingUp,
  Bot,
  Flag,
  Ticket,
  ScrollText,
  Radio,
  AtSign,
  Link2,
  Bell,
  LogOut,
  PenLine,
  Star,
  Rocket,
  Gift,
  Layout,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Navigation items organised into groups
// ────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
  authOnly?: boolean;
  guestOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home, authOnly: true },
    ],
  },
  {
    title: 'Job Tools',
    items: [
      { label: 'Job Search', href: '/jobs/search', icon: Search, authOnly: true },
      { label: 'Analyze Job', href: '/analyze-job', icon: Briefcase, authOnly: true },
      { label: 'Tailor Resume', href: '/tailor', icon: Sparkles, authOnly: true },
      { label: 'Create Cover Letter', href: '/cover-letter', icon: PenLine, authOnly: true },
      { label: 'STAR Stories', href: '/star-stories', icon: Star, authOnly: true },
      { label: 'Apply Wizard', href: '/apply', icon: Rocket, authOnly: true },
    ],
  },
  {
    title: 'Preparation',
    items: [
      { label: 'Mock Interview', href: '/mock-interview', icon: Mic, authOnly: true },
      { label: 'My Resumes', href: '/resumes', icon: FileText, authOnly: true },
      { label: 'Resume Templates', href: '/resumes/templates', icon: Layout, authOnly: true },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Applications', href: '/applications', icon: Briefcase, authOnly: true },
      { label: 'My TODOs', href: '/todos', icon: ClipboardList, authOnly: true },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3, authOnly: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: User, authOnly: true },
      { label: 'Security', href: '/profile/security', icon: Shield, authOnly: true },
      { label: 'Upgrade', href: '/subscribe', icon: CreditCard, authOnly: true },
      { label: 'Billing', href: '/billing', icon: Receipt, authOnly: true },
      { label: 'Referrals', href: '/referrals', icon: Gift, authOnly: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Contact Us', href: '/contact', icon: Mail },
    ],
  },
];

const GUEST_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, guestOnly: true },
  { label: 'Pricing', href: '/pricing', icon: DollarSign, guestOnly: true },
  { label: 'Contact Us', href: '/contact', icon: Mail, guestOnly: true },
];

const ADMIN_GROUP: NavGroup = {
  title: 'Admin',
  items: [
    { label: 'Admin Dashboard', href: '/admin', icon: Zap, authOnly: true },
    { label: 'User Management', href: '/admin/users', icon: Users, authOnly: true },
    { label: 'Plan Config', href: '/admin/plans', icon: Ruler, authOnly: true },
    { label: 'Credit Packs', href: '/admin/credit-packs', icon: Gem, authOnly: true },
    { label: 'Revenue', href: '/admin/revenue', icon: TrendingUp, authOnly: true },
    { label: 'AI Costs', href: '/admin/ai-costs', icon: Bot, authOnly: true },
    { label: 'Feature Flags', href: '/admin/features', icon: Flag, authOnly: true },
    { label: 'Support', href: '/admin/support', icon: Ticket, authOnly: true },
    { label: 'Audit Log', href: '/admin/audit', icon: ScrollText, authOnly: true },
    { label: 'Observability', href: '/admin/observability', icon: Radio, authOnly: true },
    { label: 'Emails', href: '/admin/emails', icon: AtSign, authOnly: true },
    { label: 'Webhooks', href: '/admin/webhooks', icon: Link2, authOnly: true },
    { label: 'Alerts', href: '/admin/alerts', icon: Bell, authOnly: true },
  ],
};

// ────────────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Collapsible sections — all expanded by default except Admin
  const allGroups = [...NAV_GROUPS, ...(user?.is_admin ? [ADMIN_GROUP] : [])];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => (init[g.title] = false));
    init[ADMIN_GROUP.title] = true; // Admin collapsed by default
    return init;
  });
  const toggleSection = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  // Close sidebar when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Close on outside click (mobile overlay)
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const isLandingPage = pathname === '/';

  return (
    <>
      {/* ──────── Top bar ──────── */}
      <header className={`fixed top-0 left-0 right-0 h-14 flex items-center px-4 ${
        isLandingPage
          ? 'z-[60] bg-transparent pointer-events-none'
          : 'z-40 bg-white border-b border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition lg:hidden pointer-events-auto"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <Link href="/" className="ml-3 lg:ml-1 flex items-center gap-2 truncate pointer-events-auto">
          <Image
            src={logoSrc}
            alt="CareerPilot AI logo"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <span className="text-xl font-bold text-blue-600">CareerPilot AI</span>
        </Link>

        {/* Right side — user info on desktop */}
        {isAuthenticated && user && (
          <div className="ml-auto hidden sm:flex items-center gap-3 pointer-events-auto">
            <span className="text-sm text-gray-600 truncate max-w-[180px]">
              {user.full_name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition font-medium"
            >
              Logout
            </button>
          </div>
        )}
        {!isAuthenticated && (
          <div className="ml-auto pointer-events-auto">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* ──────── Overlay (mobile only) ──────── */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" />
      )}

      {/* ──────── Sidebar drawer ──────── */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="py-4 pb-16">
          {isAuthenticated ? (
            <>
              {[...NAV_GROUPS, ...(user?.is_admin ? [ADMIN_GROUP] : [])].map((group) => (
                <div key={group.title} className="mb-3">
                  <button
                    onClick={() => toggleSection(group.title)}
                    className="w-full flex items-center justify-between px-5 mb-1 group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition">
                      {group.title}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
                        collapsed[group.title] ? '-rotate-90' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      collapsed[group.title] ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'
                    }`}
                  >
                    {group.items
                      .filter((item) => !item.guestOnly)
                      .map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                          }`}
                        >
                          <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}

              {/* Mobile-only: user info + logout */}
              <div className="sm:hidden border-t mt-4 pt-4 px-5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center gap-3 text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              {GUEST_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
              <div className="mx-2 mt-1">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  <KeyRound className="w-[18px] h-[18px] flex-shrink-0" />
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
