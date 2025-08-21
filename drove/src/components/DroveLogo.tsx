
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xg';
}

const DroveLogo: React.FC<LogoProps> = ({ 
  className = "", 
  variant = "horizontal", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
    xl: "h-32",
    xg: "h-48"
  };

  return (
    <div className={`flex items-center justify-center ${className} ${sizeClasses[size]}`}>
      <img 
        src="/lovable-uploads/a1b363ab-3f93-4c7f-ae49-8cfa92435f66.png" 
        alt="DROVE Logo" 
        className="h-full w-auto object-contain max-w-full"
      />
    </div>
  );
};

export default DroveLogo;
