
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, MapPin } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';
import AddressInput from '@/components/vehicle-transfer/AddressInput';
import type { LatLngCity } from '@/types/lat-lng-city';

interface Props {
  data: Partial<RegistrationFormData>;
  onUpdate: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const DroverIdentificationStep: React.FC<Props> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    documentType: (data as any).documentType || '',
    documentNumber: data.documentNumber || '',
    address: data.address || '',
    city: (data as any).city || '',
    lat: (data as any).lat || undefined,
    lng: (data as any).lng || undefined,
  });

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

  const handleAddressChange = (v: LatLngCity) => {
    setFormData(prev => ({ ...prev, address: v.address, city: v.city, lat: v.lat, lng: v.lng }));
    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentType) {
      newErrors.documentType = 'Selecciona el tipo de documento';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección de residencia es obligatoria';
    }
    if (formData.address && (formData.lat == null || formData.lng == null)) {
      newErrors.address = 'Selecciona una dirección de Google válida (con lat/lng)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Validación básica de formato DNI/NIE en el cliente (no reemplaza validación backend)
    const type = String(formData.documentType || '').toUpperCase();
    const num = String(formData.documentNumber || '').trim().toUpperCase();
    let formatOk = true;
    if (type === 'DNI') {
      formatOk = /^[0-9]{8}[A-Z]$/.test(num);
      if (!formatOk) setErrors(prev => ({ ...prev, documentNumber: 'DNI inválido. Formato: 8 dígitos + letra (p.ej. 12345678Z).' }));
    } else if (type === 'NIE') {
      formatOk = /^[XYZ][0-9]{7}[A-Z]$/.test(num);
      if (!formatOk) setErrors(prev => ({ ...prev, documentNumber: 'NIE inválido. Formato: X/Y/Z + 7 dígitos + letra.' }));
    }
    if (!formatOk) return;
    onNext();
  };

  const getDocumentPlaceholder = () => {
    switch (formData.documentType) {
      case 'DNI':
        return '12345678A';
      case 'NIE':
        return 'X1234567L';
      case 'Pasaporte':
        return 'AAA123456';
      default:
        return 'Número de documento';
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Identificación
        </h2>
        <p className="text-white/70">
          Información de identificación personal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Documento */}
        <div>
          <Label className="text-white/80 mb-2 block">
            Tipo de Documento *
          </Label>
          <Select 
            value={formData.documentType} 
            onValueChange={(value) => handleChange('documentType', value)}
          >
            <SelectTrigger className={`bg-white/5 border-white/20 text-white ${errors.documentType ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecciona el tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI - Documento Nacional de Identidad</SelectItem>
              <SelectItem value="NIE">NIE - Número de Identidad de Extranjero</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && (
            <p className="text-red-400 text-sm mt-1">{errors.documentType}</p>
          )}
        </div>

        {/* Número de Documento */}
        <div>
          <Label htmlFor="documentNumber" className="text-white/80 mb-2 block">
            Número de Documento *
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="documentNumber"
              type="text"
              placeholder={getDocumentPlaceholder()}
              value={formData.documentNumber}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              className={`pl-12 bg-white/5 border-white/20 text-white ${errors.documentNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.documentNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.documentNumber}</p>
          )}
        </div>

        {/* Dirección de Residencia (Google Places) */}
        <div>
          <Label htmlFor="address" className="text-white/80 mb-2 block">
            Dirección de Residencia *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <div className="pl-10">
              <AddressInput
                id="address"
                value={{ address: formData.address, city: formData.city || '', lat: Number(formData.lat || 0), lng: Number(formData.lng || 0) } as LatLngCity}
                onChange={handleAddressChange}
                placeholder="Calle, número, ciudad, código postal"
              />
            </div>
          </div>
          {errors.address && (
            <p className="text-red-400 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Button
            type="submit"
            className="bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold w-full"
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DroverIdentificationStep;
