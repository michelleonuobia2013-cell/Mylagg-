import React from 'react';

interface NairaSignProps {
  className?: string;
}

export const NairaSign: React.FC<NairaSignProps> = ({ className = 'w-3.5 h-3.5 inline-block shrink-0' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Naira"
      className={className}
    >
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <path d="M6 4v16l12-16v16" />
    </svg>
  );
};

export const FormatNaira: React.FC<{ amount: number; className?: string; iconClass?: string }> = ({
  amount,
  className = '',
  iconClass = 'w-3.5 h-3.5 inline-block -mt-0.5 mr-0.5',
}) => {
  return (
    <span className={`inline-flex items-center tabular-nums ${className}`}>
      <NairaSign className={iconClass} />
      <span>{amount.toLocaleString()}</span>
    </span>
  );
};
