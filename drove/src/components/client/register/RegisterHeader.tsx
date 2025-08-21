
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DroveButton from '@/components/DroveButton';

const RegisterHeader = () => {
  return (
    <header className="p-6 md:p-8 flex items-center">
      <Link to="/">
        <DroveButton variant="outline" size="sm" icon={<ArrowLeft size={20} />}>
          Volver
        </DroveButton>
      </Link>
    </header>
  );
};

export default RegisterHeader;
