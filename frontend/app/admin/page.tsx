'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useToastStore } from '../../store/toastStore';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  Users, 
  Database, 
  ShieldAlert, 
  FileCode, 
  UserCheck, 
  Ban, 
  Unlock, 
  Trash2, 
  PlusCircle, 
  RefreshCw, 
  Shield, 
  Lock,
  Globe,
  Settings
} from 'lucide-react';

// Form validation for new Knowledge Guide
const guideSchema = zod.object({
  instruction: zod.string().min(10, 'Instruction/Title must be at least 10 characters'),
  output: zod.string().min(10, 'Output/Config contents must be at least 10 characters'),
  topic: zod.string().min(2, 'Topic slug is required (e.g. kubernetes, docker)'),
  difficulty: zod.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

type GuideFormValues = zod.infer<typeof guideSchema>;

// Form validation for Block IP
const ipSchema = zod.object({
  ip: zod.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Please enter a valid IP address'),
});

type IpFormValues = zod.infer<typeof ipSchema>;

export default function AdminPage() {
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'users' | 'backups' | 'security' | 'knowledge'>('users');

  // Forms setup
  const { register: registerGuide, handleSubmit: handleGuideSubmit, formState: { errors: guideErrors, isSubmitting: isSubmittingGuide }, reset: resetGuide } = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      difficulty: 'beginner'
    }
  });

  const { register: registerIp, handleSubmit: handleIpSubmit, formState: { errors: ipErrors, isSubmitting: isSubmittingIp }, reset: resetIp } = useForm<IpFormValues>({
    resolver: zodResolver(ipSchema)
  });

  const {
    useAdminUsersQuery,
    useAdminBackupsQuery,
    useAdminSecurityEventsQuery,
    useToggleRoleMutation,
    useBlockUserMutation,
    useUnblockUserMutation,
    useCreateBackupMutation,
    useDeleteBackupMutation,
    useBlockIpMutation,
    useCreateGuideMutation,
  } = useAdmin();

  // Queries
  const { data: users = [], isLoading: loadingUsers } = useAdminUsersQuery();
  const { data: backups = [], isLoading: loadingBackups } = useAdminBackupsQuery();
  const { data: securityEvents = [], isLoading: loadingSecurity } = useAdminSecurityEventsQuery();

  // Mutations
  const toggleRoleMutation = useToggleRoleMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const createBackupMutation = useCreateBackupMutation();
  const deleteBackupMutation = useDeleteBackupMutation();
  const blockIpMutation = useBlockIpMutation();
  const createGuideMutation = useCreateGuideMutation();

  const handleToggleRole = (id: string, currentRole: 'user' | 'admin') => {
    const role = currentRole === 'admin' ? 'user' : 'admin';
    toggleRoleMutation.mutate(
      { id, role },
      {
        onSuccess: () => addToast('User role updated successfully', 'success'),
        onError: (err: any) => addToast(err.message || 'Failed to update role', 'error'),
      }
    );
  };

  const handleBlockUser = (id: string) => {
    blockUserMutation.mutate(id, {
      onSuccess: () => addToast('User account blocked', 'info'),
      onError: (err: any) => addToast(err.message || 'Failed to block user', 'error'),
    });
  };

  const handleUnblockUser = (id: string) => {
    unblockUserMutation.mutate(id, {
      onSuccess: () => addToast('User account unblocked', 'success'),
      onError: (err: any) => addToast(err.message || 'Failed to unblock user', 'error'),
    });
  };

  const handleCreateBackup = () => {
    createBackupMutation.mutate(undefined, {
      onSuccess: () => addToast('Backup snapshot triggered successfully', 'success'),
      onError: (err: any) => addToast(err.message || 'Failed to create backup', 'error'),
    });
  };

  const handleDeleteBackup = (id: string) => {
    deleteBackupMutation.mutate(id, {
      onSuccess: () => addToast('Backup snapshot deleted', 'info'),
      onError: (err: any) => addToast(err.message || 'Failed to delete backup', 'error'),
    });
  };

  const onSubmitIp = (data: IpFormValues) => {
    blockIpMutation.mutate(data.ip, {
      onSuccess: (res) => {
        addToast(`IP address "${res.ip || data.ip}" blocked successfully`, 'success');
        resetIp();
      },
      onError: (err: any) => addToast(err.message || 'Failed to block IP', 'error'),
    });
  };

  const onSubmitGuide = (data: GuideFormValues) => {
    createGuideMutation.mutate(data, {
      onSuccess: () => {
        addToast('New DevOps Guide catalog entry compiled', 'success');
        resetGuide();
      },
      onError: (err: any) => addToast(err.message || 'Failed to create guide', 'error'),
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Admin Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-6 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-indigo-500" /> Administrative Center
            </h1>
            <p className="text-sm text-slate-400">
              System access control, database backup targets, firewall policy parameters, and catalog compiling controls.
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-900 gap-1 overflow-x-auto pb-px">
          {[
            { id: 'users', label: 'User Roles & Accounts', icon: Users },
            { id: 'backups', label: 'Database Backups', icon: Database },
            { id: 'security', label: 'Network & Firewalls', icon: ShieldAlert },
            { id: 'knowledge', label: 'Compile Guide Template', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-white bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Body content */}
        <div className="space-y-6">
          
          {/* TAB 1: User Roles and Accounts */}
          {activeTab === 'users' && (
            <Card className="glass border-slate-800/85 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">User Registrations</CardTitle>
                <CardDescription className="text-xs">Elevate profile credentials or restrict platform entry points dynamically.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loadingUsers ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-900/10">
                    <table className="min-w-full divide-y divide-slate-850 text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 font-bold text-slate-450">
                        <tr>
                          <th className="px-6 py-3.5">Name</th>
                          <th className="px-6 py-3.5">Email</th>
                          <th className="px-6 py-3.5">Current Role</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Access Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-855/60">
                        {users.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-900/20 transition-all">
                            <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                            <td className="px-6 py-4 font-mono text-slate-400">{item.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                item.role === 'admin' 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                              }`}>
                                {item.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {item.isBlocked ? (
                                <span className="text-rose-455 font-semibold flex items-center gap-1">
                                  <Ban className="w-3.5 h-3.5" /> Blocked
                                </span>
                              ) : (
                                <span className="text-emerald-450 font-semibold flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5" /> Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {/* Toggle Role */}
                              <button
                                onClick={() => handleToggleRole(item._id, item.role)}
                                disabled={toggleRoleMutation.isPending}
                                className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-750 transition-all cursor-pointer"
                              >
                                Toggle Role
                              </button>
                              
                              {/* Toggle Block */}
                              {item.isBlocked ? (
                                <button
                                  onClick={() => handleUnblockUser(item._id)}
                                  disabled={unblockUserMutation.isPending}
                                  className="px-2.5 py-1 rounded bg-emerald-950/20 hover:bg-emerald-950/40 text-[10px] font-bold text-emerald-400 border border-emerald-900/30 transition-all cursor-pointer"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockUser(item._id)}
                                  disabled={blockUserMutation.isPending}
                                  className="px-2.5 py-1 rounded bg-rose-950/20 hover:bg-rose-950/40 text-[10px] font-bold text-rose-400 border border-rose-900/30 transition-all cursor-pointer"
                                >
                                  Block
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Database Backups */}
          {activeTab === 'backups' && (
            <Card className="glass border-slate-800/85 shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-4 gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Database Snapshots</CardTitle>
                  <CardDescription className="text-xs">Compile and retain snapshots representing backup vectors.</CardDescription>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={createBackupMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Create Snapshot
                </button>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingBackups ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ) : backups.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2">No backups currently compiled.</p>
                ) : (
                  <div className="space-y-4">
                    {backups.map((snap) => (
                      <div key={snap.backupId} className="flex items-center justify-between p-4 rounded-xl border border-slate-850 bg-slate-900/30">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Database className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{snap.backupId}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span>Size: {(snap.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>Created: {new Date(snap.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBackup(snap.backupId)}
                          disabled={deleteBackupMutation.isPending}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                          title="Purge Backup"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Network Security and Firewalls */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Firewalls and Block IP form */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="glass border-slate-800/85 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <CardTitle className="text-base font-bold">Firewall Rules</CardTitle>
                    </div>
                    <CardDescription className="text-xs">Append malicious host IPs to restrict edge network entry ports.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <form onSubmit={handleIpSubmit(onSubmitIp)} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-455">Target IP Address</label>
                        <input
                          type="text"
                          placeholder="e.g. 192.168.1.1"
                          {...registerIp('ip')}
                          className={`w-full bg-slate-900 border ${ipErrors.ip ? 'border-rose-500' : 'border-slate-805'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                        />
                        {ipErrors.ip && (
                          <p className="text-xs text-rose-400 mt-0.5">{ipErrors.ip.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingIp}
                        className="w-full bg-rose-650 hover:bg-rose-600 disabled:opacity-50 text-white font-medium text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSubmittingIp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Block IP Vector
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Security Audits Log */}
              <div className="lg:col-span-2">
                <Card className="glass border-slate-800/85 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Recent Security Events</CardTitle>
                    <CardDescription className="text-xs">Live events audits compiled from credential verifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {loadingSecurity ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full rounded" />
                      </div>
                    ) : securityEvents.length === 0 ? (
                      <p className="text-slate-400 text-xs py-2">No security audit logs available.</p>
                    ) : (
                      <div className="space-y-3">
                        {securityEvents.map((evt, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-850 bg-slate-900/30 text-xs">
                            <div className="space-y-1">
                              <span className="font-semibold text-white">{evt.event}</span>
                              <div className="flex items-center gap-3 text-slate-500 font-medium">
                                <span>Actor: {evt.email}</span>
                                <span>•</span>
                                <span>IP: {evt.ip}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                              {new Date(evt.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* TAB 4: Knowledge Blueprint CRUD */}
          {activeTab === 'knowledge' && (
            <Card className="glass border-slate-800/85 shadow-xl max-w-3xl mx-auto">
              <CardHeader className="border-b border-slate-905 pb-4">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-500" />
                  <div>
                    <CardTitle className="text-lg font-bold">Compile New Guide</CardTitle>
                    <CardDescription className="text-xs">Synthesize a new production-ready configuration blueprint inside the registry catalog.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleGuideSubmit(onSubmitGuide)} className="space-y-5">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Instruction/Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Deploy NGINX Ingress controller using Helm with TLS encryption"
                      {...registerGuide('instruction')}
                      className={`w-full bg-slate-900 border ${guideErrors.instruction ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                    />
                    {guideErrors.instruction && (
                      <p className="text-xs text-rose-400 mt-0.5">{guideErrors.instruction.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Topic Tag (e.g. kubernetes, docker, terraform)</label>
                      <input
                        type="text"
                        placeholder="kubernetes"
                        {...registerGuide('topic')}
                        className={`w-full bg-slate-900 border ${guideErrors.topic ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors`}
                      />
                      {guideErrors.topic && (
                        <p className="text-xs text-rose-400 mt-0.5">{guideErrors.topic.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Difficulty Grade</label>
                      <select
                        {...registerGuide('difficulty')}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Blueprint Config Output (YAML / Shell scripts)</label>
                    <textarea
                      placeholder="apiVersion: apps/v1&#10;kind: Deployment&#10;..."
                      rows={8}
                      {...registerGuide('output')}
                      className={`w-full bg-slate-900 border ${guideErrors.output ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors`}
                    />
                    {guideErrors.output && (
                      <p className="text-xs text-rose-400 mt-0.5">{guideErrors.output.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-900">
                    <button
                      type="submit"
                      disabled={isSubmittingGuide}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmittingGuide && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      Compile & Register Guide
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
