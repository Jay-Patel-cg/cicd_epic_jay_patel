'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/navbar';
import Footer from '../components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useKnowledge } from '../hooks/useKnowledge';
import { Search, Flame, Clock, BookOpen, ChevronRight, Terminal, Container, Cloud } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { useTrendingWorkflowsQuery, useLatestWorkflowsQuery } = useKnowledge();

  // 1. Fetch Trending Workflows Query
  const { data: trending = [], isLoading: loadingTrending } = useTrendingWorkflowsQuery();

  // 2. Fetch Latest Workflows Query
  const { data: latest = [], isLoading: loadingLatest } = useLatestWorkflowsQuery();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
  };

  const categories = [
    { name: 'Kubernetes', slug: 'kubernetes', desc: 'Pod orchestrations, ConfigMaps, and Ingress setups.', icon: Container, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { name: 'Docker', slug: 'docker', desc: 'Container engine builds, and compose workflows.', icon: Terminal, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
    { name: 'Terraform', slug: 'terraform', desc: 'Declarative Cloud infrastructure as code guides.', icon: Cloud, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40' },
    { name: 'Helm', slug: 'helm', desc: 'Kubernetes package configuration and charts.', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-20 border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-violet-950/30"></div>
          {/* Decorative background blobs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Flame className="w-3.5 h-3.5 animate-pulse" /> Production-Ready DevOps Templates
            </span>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Kubernetes configs & CI/CD pipelines <br />
              <span className="text-indigo-400">synthesized in seconds.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Query, validate, and simulate deployment pipelines. Explore verified templates for Docker, Helm, Terraform, Kubernetes, and popular DevOps providers.
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center bg-slate-850 border border-slate-750 focus-within:border-indigo-500/50 rounded-xl p-1.5 shadow-xl transition-all">
              <div className="flex-grow flex items-center px-3 gap-2 text-slate-400">
                <Search className="w-5 h-5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for templates, e.g. ingress, multi-stage docker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full focus:outline-none text-white placeholder-slate-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Core Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Featured Technologies</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Browse template catalogs curated for primary engineering toolchains.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.slug} href={`/search?topic=${cat.slug}`}>
                  <Card className="hover:scale-[1.02] cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle>{cat.name}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">{cat.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400 pt-2 group">
                      Explore directory <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guides Grids (Trending & Latest) */}
        <section className="bg-slate-100/50 dark:bg-slate-900/10 border-y border-slate-200/60 dark:border-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Trending Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg">Trending Guides</h3>
              </div>

              {loadingTrending ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : trending.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">No trending guides found.</p>
              ) : (
                <div className="space-y-4">
                  {trending.slice(0, 3).map((guide) => (
                    <Link key={guide._id} href={`/knowledge/${guide._id}`} className="block">
                      <div className="glass p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm hover:text-indigo-400 transition-colors line-clamp-1">{guide.instruction}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-400">{guide.topic}</span>
                            <span>{guide.views} views</span>
                            <span>{guide.likes} likes</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-lg">Latest Releases</h3>
              </div>

              {loadingLatest ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : latest.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">No recent templates found.</p>
              ) : (
                <div className="space-y-4">
                  {latest.slice(0, 3).map((guide) => (
                    <Link key={guide._id} href={`/knowledge/${guide._id}`} className="block">
                      <div className="glass p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm hover:text-indigo-400 transition-colors line-clamp-1">{guide.instruction}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-400">{guide.topic}</span>
                            <span>Difficulty: <span className="capitalize">{guide.difficulty}</span></span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
