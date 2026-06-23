import { HTMLAttributes } from 'react';

interface EenvoqIconProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  strokeWidth?: number; // Kept for type compatibility
}

export default function EenvoqIcon({ className = "w-6 h-6", strokeWidth, ...props }: EenvoqIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-white rounded bg-[#db2777] select-none lowercase leading-none ${className}`}
      style={{ fontSize: '0.65em' }}
      {...props}
    >
      ev
    </span>
  );
}
