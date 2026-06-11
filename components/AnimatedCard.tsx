import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'button' | 'tr';
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0, className = '', as: Tag = 'div', onClick }) => {
  return (
    <Tag
      onClick={onClick}
      className={`animate-slide-up opacity-0 ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </Tag>
  );
};

export default AnimatedCard;
