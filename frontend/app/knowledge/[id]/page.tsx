'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Navbar from '../../../components/layout/navbar';
import Footer from '../../../components/layout/footer';
import CodeBlock from '../../../components/shared/code-block';
import CommentSection from '../../../components/shared/comment-section';
import ReviewSection from '../../../components/shared/review-section';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { useKnowledge } from '../../../hooks/useKnowledge';
import { knowledgeService } from '../../../services/knowledge.service';
import { useAuthStore } from '../../../store/authStore';
import { useToastStore } from '../../../store/toastStore';
import {
  Eye,
  ThumbsUp,
  Bookmark,
  Play,
  Terminal,
  Activity,
  Calendar,
  AlertCircle,
  FileCode,
  MessageSquare,
  Star,
  BookOpen,
} from 'lucide-react';

export default function KnowledgeDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'template' | 'comments' | 'reviews'>('template');
  
  // Dry-run simulator local state
  const [simulatorState, setSimulatorState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simResult, setSimResult] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [simMetrics, setSimMetrics] = useState<any>(null);

  const { useWorkflowDetailsQuery, useToggleBookmarkMutation } = useKnowledge();

  // 1. Fetch Workflow details query
  const { data: guide, isLoading, isError } = useWorkflowDetailsQuery(id);

  // 2. Bookmark mutation
  const bookmarkMutation = useToggleBookmarkMutation(id);

  // 3. Trigger simulation dry run mutation
  const runMutation = useMutation({
    mutationFn: () => knowledgeService.triggerWorkflowRun(id),
    onMutate: () => {
      setSimulatorState('running');
      setTerminalLogs([
        'Initializing pipeline environment...',
        'Resolving template parameters...',
      ]);
    },
    onSuccess: async (data) => {
      setSimResult(data);
      
      // Delay fetching logs to mock real pipeline processing
      setTimeout(async () => {
        try {
          const logsData = await knowledgeService.getWorkflowLogs(id);
          const metricsData = await knowledgeService.getWorkflowMetrics(id);
          
          setTerminalLogs((prev) => [
            ...prev,
            'Parsed template syntax successfully. Validated tab flag check: Pass.',
            'Linting: 0 styling issues flagged.',
            'Initiating container run simulation in dry mode...',
            ...logsData.logs,
            'Pipeline completed with code 0.'
          ]);
          setSimMetrics(metricsData.metrics);
          setSimulatorState('completed');
          addToast('Pipeline simulation finished successfully', 'success');
        } catch (e) {
          setTerminalLogs((prev) => [...prev, 'Error: Failed to stream simulation logs.']);
          setSimulatorState('completed');
        }
      }, 1500);
    },
    onError: (err: any) => {
      setSimulatorState('idle');
      addToast(err.message || 'Simulation failed to boot', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !guide) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-lg mx-auto flex items-center justify-center flex-col gap-4 text-center py-20 px-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold">Failed to load guide</h2>
          <p className="text-sm text-slate-500">The template record might have been deleted or the API is offline.</p>
          <button onClick={() => router.push('/search')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            Go back to search
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Path Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 capitalize">
          <Link href="/search" className="hover:text-indigo-500">Directory</Link>
          <span>/</span>
          <span className="text-slate-400 font-medium">{guide.topic}</span>
          <span>/</span>
          <span className="text-slate-455 truncate max-w-[200px]">{guide.instruction}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Details, Code Block & Discussion tab panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {guide.instruction}
              </h1>
              
              {/* Statistics badges */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-2.5 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider">
                  {guide.topic}
                </span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {guide.views} views</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {guide.likes} likes</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              {[
                { id: 'template', name: 'Configuration Template', icon: FileCode },
                { id: 'comments', name: 'Forums Discussion', icon: MessageSquare },
                { id: 'reviews', name: 'Assessments', icon: Star },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px pointer-events-auto cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels Contents */}
            <div className="animate-fade-in">
              {activeTab === 'template' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Copy or inspect the generated code template below. Ensure syntax matches standard parameters before applying.
                  </p>
                  <CodeBlock code={guide.output} language={guide.topic} />
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <CommentSection workflowId={id} />
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="glass p-6 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <ReviewSection workflowId={id} />
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Actions & Telemetry Console */}
          <div className="space-y-6">
            
            {/* Guide metadata card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engineering Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">Difficulty Rating</span>
                  <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{guide.difficulty}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">Released Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(guide.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return router.push('/login');
                      bookmarkMutation.mutate(undefined, {
                        onSuccess: (data: any) => {
                          addToast(data.isBookmarked ? 'Bookmark added' : 'Bookmark removed', 'success');
                        },
                        onError: (err: any) => {
                          addToast(err.message || 'Failed to toggle bookmark', 'error');
                        }
                      });
                    }}
                    disabled={bookmarkMutation.isPending}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-55 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-indigo-500" /> Bookmark
                  </button>

                </div>

              </CardContent>
            </Card>

            {/* Dry Run Simulation Telemetry Terminal */}
            <Card className="bg-slate-950 border-slate-850 p-5 flex flex-col gap-4 text-white">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" /> Pipeline Simulator
                </span>
                {simulatorState === 'completed' && (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                    Success
                  </span>
                )}
              </div>

              {simulatorState === 'idle' ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-xs text-slate-455 max-w-[220px] mx-auto">
                    Submit dry-run execution on a mock k8s cluster metrics server to check YAML schema and retrieve telemetry.
                  </p>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return router.push('/login');
                      runMutation.mutate();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 mx-auto shadow-md shadow-indigo-500/10 pointer-events-auto cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Trigger Dry Run
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Interactive Terminal console */}
                  <div className="bg-black/80 rounded-lg p-3 font-mono text-[10px] text-indigo-300 leading-5 min-h-[140px] max-h-[220px] overflow-y-auto border border-slate-900">
                    {terminalLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5">
                        <span className="text-slate-600 select-none">$</span>
                        <span className="whitespace-pre-wrap">{log}</span>
                      </div>
                    ))}
                    {simulatorState === 'running' && (
                      <div className="animate-pulse flex items-center gap-1 mt-1 text-slate-500">
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full"></span>
                        <span>Compiling...</span>
                      </div>
                    )}
                  </div>

                  {/* Simulator Metrics Dashboard */}
                  {simMetrics && (
                    <div className="grid grid-cols-3 gap-2.5 border-t border-slate-900 pt-3">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">CPU Usage</span>
                        <span className="text-xs font-bold flex items-center gap-1 text-indigo-400">
                          <Activity className="w-3.5 h-3.5" /> {simMetrics.cpuUsage}%
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">RAM Load</span>
                        <span className="text-xs font-bold text-violet-400">{simMetrics.memoryUsage} MB</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Network Traffic</span>
                        <span className="text-xs font-bold text-sky-400">{simMetrics.networkTraffic} kb/s</span>
                      </div>
                    </div>
                  )}

                  {/* Cancel run link option */}
                  {simulatorState === 'running' && (
                    <button
                      onClick={() => {
                        knowledgeService.cancelWorkflowRun(id);
                        setSimulatorState('idle');
                        addToast('Run simulation cancelled', 'info');
                      }}
                      className="w-full text-center text-[10px] text-rose-400 hover:text-rose-500 transition-colors hover:underline cursor-pointer"
                    >
                      Abort Execution Run
                    </button>
                  )}

                </div>
              )}

            </Card>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
