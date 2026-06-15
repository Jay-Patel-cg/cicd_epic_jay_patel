'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../../services/comments.service';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { MessageSquare, Edit2, Trash2, Send, X, CornerDownRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface CommentSectionProps {
  workflowId: string;
}

export default function CommentSection({ workflowId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 1. Fetch Comments Query
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', workflowId],
    queryKeyHashFn: () => `comments-${workflowId}`,
    queryFn: () => commentsService.getComments(workflowId),
  });

  // 2. Add Comment Mutation
  const addMutation = useMutation({
    mutationFn: (text: string) => commentsService.addComment(workflowId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      setNewComment('');
      addToast('Comment added successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to add comment', 'error');
    },
  });

  // 3. Edit Comment Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      commentsService.updateComment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      setEditingCommentId(null);
      setEditingText('');
      addToast('Comment updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to update comment', 'error');
    },
  });

  // 4. Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      addToast('Comment deleted successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to delete comment', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addMutation.mutate(newComment);
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingCommentId(id);
    setEditingText(text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    editMutation.mutate({ id, text: editingText });
  };

  return (
    <div className="space-y-6">
      
      {/* Header title */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-lg">Discussion Forums ({comments.length})</h3>
      </div>

      {/* Input Box for comments */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Share your thoughts or ask a question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all pointer-events-auto cursor-pointer"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 text-center text-sm text-slate-500">
          Please sign in to join the discussion thread.
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-slate-400 py-6 text-sm">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const commentAuthor = typeof comment.user === 'object' ? comment.user : null;
            const authorName = commentAuthor?.name || 'Anonymous User';
            const authorEmail = commentAuthor?.email || '';
            const isOwner = commentAuthor?._id === user?._id || comment.user === user?._id;
            
            return (
              <div
                key={comment._id}
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-start justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  
                  {/* Author Name and Date */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{authorName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment Content */}
                  {editingCommentId === comment._id ? (
                    <div className="flex items-center gap-2 mt-1 w-full">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded border border-slate-350 dark:border-slate-750 bg-white dark:bg-slate-950 text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="p-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {comment.comment}
                    </p>
                  )}

                </div>

                {/* Edit & Delete Action Options */}
                {isOwner && editingCommentId !== comment._id && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(comment._id, comment.comment)}
                      className="p-1 rounded text-slate-455 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(comment._id)}
                      className="p-1 rounded text-slate-455 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
