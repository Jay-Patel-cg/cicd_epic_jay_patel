'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../../services/reviews.service';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Star, MessageSquareCode, Award } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface ReviewSectionProps {
  workflowId: string;
}

export default function ReviewSection({ workflowId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // 1. Fetch Reviews Query
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', workflowId],
    queryKeyHashFn: () => `reviews-${workflowId}`,
    queryFn: () => reviewsService.getReviews(workflowId),
  });

  // 2. Add Review Mutation
  const addReviewMutation = useMutation({
    mutationFn: ({ rating, review }: { rating: number; review: string }) =>
      reviewsService.addReview(workflowId, rating, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', workflowId] });
      setReviewText('');
      setRating(5);
      addToast('Review submitted successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to submit review', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    addReviewMutation.mutate({ rating, review: reviewText });
  };

  // Calculate Average Rating
  const avgRating =
    reviews.length === 0
      ? 0
      : Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1));

  return (
    <div className="space-y-6">
      
      {/* Header section with average score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-lg">Ratings & Assessments</h3>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(avgRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-white">
            {avgRating > 0 ? `${avgRating} / 5` : 'No ratings'}
          </span>
          <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Review Submission Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="glass p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Select Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-0.5 hover:scale-110 transition-transform pointer-events-auto cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Describe your experience using this guide..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={addReviewMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all pointer-events-auto cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 text-center text-sm text-slate-500">
          Please sign in to write an assessment.
        </div>
      )}

      {/* Reviews Log List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-slate-400 py-4 text-sm">
          No feedback assessments submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const reviewAuthor = typeof review.user === 'object' ? review.user : null;
            const authorName = reviewAuthor?.name || 'DevOps Specialist';
            
            return (
              <div
                key={review._id}
                className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{authorName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-350 dark:text-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  {review.review}
                </p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
