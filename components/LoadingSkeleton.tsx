import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-fantasy-wood/10 dark:bg-white/5 animate-pulse rounded-xl ${className}`} />
);

const LoadingSkeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBlock key={i} className={className} />
    ))}
  </>
);

export const CardSkeleton: React.FC = () => (
  <div className="parchment-card p-8 rounded-[32px] space-y-6">
    <div className="flex justify-between items-start">
      <SkeletonBlock className="w-16 h-16 rounded-2xl" />
      <SkeletonBlock className="w-10 h-10 rounded-full" />
    </div>
    <div className="space-y-3">
      <SkeletonBlock className="w-24 h-3" />
      <SkeletonBlock className="w-32 h-8" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4">
    <div className="flex gap-4 p-4">
      <SkeletonBlock className="w-1/4 h-4" />
      <SkeletonBlock className="w-1/4 h-4" />
      <SkeletonBlock className="w-1/4 h-4" />
      <SkeletonBlock className="w-1/4 h-4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-t border-fantasy-wood/5">
        <SkeletonBlock className="w-1/4 h-4" />
        <SkeletonBlock className="w-1/4 h-4" />
        <SkeletonBlock className="w-1/4 h-4" />
        <SkeletonBlock className="w-1/4 h-4" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
