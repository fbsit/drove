
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';

interface Props {
  data: Partial<RegistrationFormData>;
  onUpdate: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const DroverPersonalDataStep: React.FC<Props> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    password: data.password || '',
    confirmPassword: data.confirmPassword || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Datos Personales
        </h2>
        <p className="text-white/70">
          Información básica para tu cuenta de DROVER
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre Completo */}
        <div>
          <Label htmlFor="fullName" className="text-white/80 mb-2 block">
            Nombre Completo *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="fullName"
              type="text"
              placeholder="Ej: Juan Carlos Pérez López"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`pl-12 bg-white/5 border-white/20 text-white ${errors.fullName ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-white/80 mb-2 block">
            Correo Electrónico *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="tu.email@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`pl-12 bg-white/5 border-white/20 text-white ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <Label htmlFor="phone" className="text-white/80 mb-2 block">
            Teléfono *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="phone"
              type="tel"
              placeholder="+34 600 123 456"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`pl-12 bg-white/5 border-white/20 text-white ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <Label htmlFor="password" className="text-white/80 mb-2 block">
            Contraseña *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`pl-12 pr-12 bg-white/5 border-white/20 text-white ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <Label htmlFor="confirmPassword" className="text-white/80 mb-2 block">
            Confirmar Contraseña *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`pl-12 pr-12 bg-white/5 border-white/20 text-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:justify-between">
          {onPrevious && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="order-2 md:order-1 flex items-center gap-2"
            >
              Anterior
            </Button>
          )}
          
          <Button
            type="submit"
            className="order-1 md:order-2 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold w-full"
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DroverPersonalDataStep;
