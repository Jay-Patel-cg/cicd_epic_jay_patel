'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, User, Shield, Bell, Bookmark, KeyRound } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const links = [
    { name: 'Overview Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Saved Bookmarks', href: '/bookmarks', icon: Bookmark },
    { name: 'Notifications Log', href: '/notifications', icon: Bell },
  ];

  if (user?.role === 'admin') {
    links.push({ name: 'Admin Console', href: '/admin', icon: Shield });
  }

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Navigation Panel
      </div>
      
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            {link.name}
          </Link>
        );
      })}
    </aside>
  );
}
