import React from 'react';
import { Scroll } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon = Scroll, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
    <div className="w-20 h-20 rounded-full bg-fantasy-wood/5 dark:bg-white/5 flex items-center justify-center mb-6 border-2 border-dashed border-fantasy-wood/20 dark:border-white/10">
      <Icon size={36} className="text-fantasy-wood/30 dark:text-fantasy-parchment/20" />
    </div>
    <h3 className="font-medieval text-2xl text-fantasy-wood/50 dark:text-fantasy-parchment/40 mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-fantasy-wood/40 dark:text-fantasy-parchment/30 max-w-md mb-6">{description}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="bg-fantasy-wood/10 hover:bg-fantasy-wood/20 dark:bg-white/5 dark:hover:bg-white/10 text-fantasy-wood dark:text-fantasy-parchment px-8 py-4 rounded-2xl font-medieval uppercase tracking-widest text-sm transition-all border border-fantasy-wood/20 dark:border-white/10 active:scale-95"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
