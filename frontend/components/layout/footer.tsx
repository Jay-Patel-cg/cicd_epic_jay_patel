import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            AG
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            DevOps Pulse
          </span>
          <span className="text-xs text-slate-500 border-l border-slate-350 dark:border-slate-800 pl-2">
            © 2026 Enterprise platform. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/search" className="hover:text-indigo-500 transition-colors">Search Guides</Link>
          <Link href="/bookmarks" className="hover:text-indigo-500 transition-colors">Saved Bookmarks</Link>
          <Link href="/dashboard" className="hover:text-indigo-500 transition-colors">User Logs</Link>
        </div>

      </div>
    </footer>
  );
}
