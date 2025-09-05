
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xg';
}

const DroveLogo: React.FC<LogoProps> = ({
  className = "",
}) => {

  return (
    <div className={`flex items-center justify-center ${className} h-[80px]`}>
      <img
        src="/lovable-uploads/a1b363ab-3f93-4c7f-ae49-8cfa92435f66.png"
        alt="DROVE Logo"
        className="h-full w-auto object-contain max-w-full"
      />
    </div>
  );
};

export default DroveLogo;
