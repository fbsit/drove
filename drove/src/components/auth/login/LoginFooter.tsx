
import React from 'react';
import { Link } from 'react-router-dom';

export const LoginFooter = () => {
  return (
    <div className="mt-6 text-center">
      <p className="text-white/70">
        ¿No tienes una cuenta?{' '}
        <Link to="/registro" className="text-[#6EF7FF] hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
};
