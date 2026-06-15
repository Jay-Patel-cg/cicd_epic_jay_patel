'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useToastStore } from '../../store/toastStore';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationsService } from '../../services/notifications.service';
import { 
  Bell, 
  Check, 
  Trash2, 
  MailOpen, 
  Clock, 
  AlertCircle,
  BellOff
} from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { useNotificationsQuery, useMarkReadMutation, useDeleteNotificationMutation } = useNotifications();

  // 1. Fetch Notifications List
  const { data: notifications = [], isLoading, isError } = useNotificationsQuery();

  // 2. Mark as Read Mutation
  const markReadMutation = useMarkReadMutation();

  // 3. Delete Notification Mutation
  const deleteNotificationMutation = useDeleteNotificationMutation();

  // Helper: batch mark all as read
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) {
      addToast('No new notifications to mark', 'info');
      return;
    }
    
    try {
      await Promise.all(unread.map(n => notificationsService.markAsRead(n._id)));
      addToast('All notifications marked as read', 'success');
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Title Header area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-6 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Bell className="w-7 h-7 text-indigo-500" /> Inbox Notifications
            </h1>
            <p className="text-sm text-slate-400">
              Review live triggers, status changes, workflow evaluations, and comments alerts.
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
            >
              <MailOpen className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Content list block */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="glass p-8 rounded-xl border border-rose-950/40 text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-bold text-lg">Error connecting to Inbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify database connectivity is operational and token validation matches your session.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass p-12 rounded-2xl border border-slate-900 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <BellOff className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg">Inbox is completely clear</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We'll notify you here when trigger actions or team collaborations require attention.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`glass p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 justify-between ${
                  notif.isRead 
                    ? 'border-slate-900/60 bg-slate-900/10 opacity-70' 
                    : 'border-slate-800 bg-indigo-950/5 shadow-md shadow-indigo-950/10'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-grow min-w-0">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    notif.isRead 
                      ? 'bg-slate-900 text-slate-500' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold truncate ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(notif._id, {
                        onSuccess: () => addToast('Notification marked as read', 'success'),
                        onError: (err: any) => addToast(err.message || 'Failed to update notification', 'error'),
                      })}
                      disabled={markReadMutation.isPending}
                      className="p-1.5 rounded-lg text-slate-450 hover:text-indigo-400 hover:bg-slate-900 transition-all cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotificationMutation.mutate(notif._id, {
                      onSuccess: () => addToast('Notification purged successfully', 'info'),
                      onError: (err: any) => addToast(err.message || 'Failed to delete notification', 'error'),
                    })}
                    disabled={deleteNotificationMutation.isPending}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
