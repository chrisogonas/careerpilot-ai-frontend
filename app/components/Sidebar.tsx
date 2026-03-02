'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// Navigation items organised into groups
// ────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: string;
  authOnly?: boolean;
  guestOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '🏠', authOnly: true },
      { label: 'Tailor Resume', href: '/tailor', icon: '✂️', authOnly: true },
      { label: 'My Resumes', href: '/resumes', icon: '📄', authOnly: true },
      { label: 'Applications', href: '/applications', icon: '💼', authOnly: true },
      { label: 'My TODOs', href: '/todos', icon: '📋', authOnly: true },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', href: '/analytics', icon: '📊', authOnly: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/profile', icon: '👤', authOnly: true },
      { label: 'Security', href: '/profile/security', icon: '🔐', authOnly: true },
      { label: 'Upgrade', href: '/subscribe', icon: '💳', authOnly: true },
      { label: 'Billing', href: '/billing', icon: '🧾', authOnly: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Contact', href: '/contact', icon: '✉️' },
    ],
  },
];

const GUEST_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠', guestOnly: true },
  { label: 'Pricing', href: '/pricing', icon: '💰', guestOnly: true },
  { label: 'Contact', href: '/contact', icon: '✉️', guestOnly: true },
];

// ────────────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      {/* ──────── Top bar ──────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition"
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

        <Link href="/" className="ml-3 text-xl font-bold text-blue-600 truncate">
          CareerPilot AI
        </Link>

        {/* Right side — user info on desktop */}
        {isAuthenticated && user && (
          <div className="ml-auto hidden sm:flex items-center gap-3">
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
          <div className="ml-auto">
            <Link
              href="/auth/login"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* ──────── Overlay (mobile) ──────── */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" />
      )}

      {/* ──────── Sidebar drawer ──────── */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="py-4">
          {isAuthenticated ? (
            <>
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="mb-3">
                  <p className="px-5 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {group.title}
                  </p>
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
                        <span className="text-base w-5 text-center">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
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
                  className="mt-3 w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  🚪 Logout
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
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="mx-2 mt-4">
                <Link
                  href="/auth/login"
                  className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                >
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
