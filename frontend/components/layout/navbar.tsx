'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../providers/themeProvider';
import { Sun, Moon, Bell, User as UserIcon, LogOut, Shield, Search } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Branding Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              AG
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent tracking-tight">
              DevOps<span className="text-indigo-500 font-semibold">Pulse</span>
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/search" className="hover:text-indigo-500 transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Explore
            </Link>
            <Link href="/bookmarks" className="hover:text-indigo-500 transition-colors">Bookmarks</Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="hover:text-indigo-500 transition-colors">Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
                    <Shield className="w-4 h-4 text-rose-500" /> Admin
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-slate-200 dark:border-slate-800"
            aria-label="Toggle Theme"
          >
            {!mounted ? (
              <div className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Notification Trigger */}
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-slate-200 dark:border-slate-800 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
            </Link>
          )}

          {/* Auth Controllers Profile dropdown */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium hover:text-indigo-500 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-850 border border-slate-300 dark:border-slate-800 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/10 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
