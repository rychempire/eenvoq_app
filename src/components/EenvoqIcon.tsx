import { HTMLAttributes } from 'react';

interface EenvoqIconProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  strokeWidth?: number; // Kept for type compatibility
}

export default function EenvoqIcon({ className = "w-5 h-5", strokeWidth, ...props }: EenvoqIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      {...props}
    >
      <img 
        src="https://res.cloudinary.com/dee01jm0p/image/upload/e_bgremoval/f_auto,q_auto/1001133582_wa3zq3" 
        alt="eenvoq icon" 
        className="w-14 h-full object-contain [filter:drop-shadow(1px_0_0_#000)_drop-shadow(-1px_0_0_#000)_drop-shadow(0_1px_0_0_#000)_drop-shadow(0_-1px_0_0_#000)]" 
      />
    </span>
  );
}
