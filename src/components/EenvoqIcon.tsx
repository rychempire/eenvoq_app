import { HTMLAttributes } from 'react';

interface EenvoqIconProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  strokeWidth?: number;
}

export default function EenvoqIcon({ className = "w-5 h-5", strokeWidth, ...props }: EenvoqIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-sans font-semibold select-none leading-none ${className}`}
      style={{ 
        fontSize: '1.725em',
        textTransform: 'lowercase'
      }}
      {...props}
    >
      e
    </span>
  );
}
