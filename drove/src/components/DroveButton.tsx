
import React from 'react';
import { cn } from "@/lib/utils";

interface DroveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const DroveButton: React.FC<DroveButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  icon,
  onClick,
  ...props
}) => {
  const variantClasses = {
    default: "bg-transparent border border-white text-white hover:bg-drove-accent hover:text-drove hover:border-drove-accent",
    outline: "bg-transparent border border-drove-accent text-drove-accent hover:bg-drove-accent hover:text-drove",
    accent: "bg-drove-accent border border-drove-accent text-drove hover:bg-transparent hover:text-drove-accent",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm rounded-xl min-h-[32px]",
    md: "px-4 sm:px-6 py-2 rounded-2xl min-h-[40px] text-sm sm:text-base",
    lg: "px-6 sm:px-8 py-3 text-base sm:text-lg rounded-2xl min-h-[48px]",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('DroveButton clicked');
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-helvetica transition-colors focus:outline-none focus:ring-2 focus:ring-drove-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="mr-1 sm:mr-2 flex-shrink-0">{icon}</span>}
      <span className="truncate flex items-center">{children}</span>
    </button>
  );
};

export default DroveButton;
