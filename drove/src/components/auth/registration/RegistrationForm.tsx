
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  onSubmit: (formData: any) => Promise<void>;
  isLoading?: boolean;
}

export const RegistrationForm: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactInfo: {
      fullName: '',
      phone: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('contactInfo.')) {
      const contactField = field.replace('contactInfo.', '');
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-center">Registro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-white/80">Nombre Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.contactInfo.fullName}
              onChange={(e) => handleInputChange('contactInfo.fullName', e.target.value)}
              className="bg-white/5 border-white/20 text-white mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-white/5 border-white/20 text-white mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white/80">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contactInfo.phone}
              onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
              className="bg-white/5 border-white/20 text-white mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white/80">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-white/5 border-white/20 text-white mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-white/80">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="bg-white/5 border-white/20 text-white mt-1"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold rounded-2xl"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
