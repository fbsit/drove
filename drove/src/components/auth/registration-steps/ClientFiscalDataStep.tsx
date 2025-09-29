
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import AddressInput from '@/components/vehicle-transfer/AddressInput';
import { LatLngCity } from '@/types/lat-lng-city';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building, MapPin, FileText } from 'lucide-react';
import { RegistrationFormData } from '@/types/new-registration';
import { validateDocument, getDocumentPlaceholder } from '@/utils/documentValidation';

interface Props {
  data: Partial<RegistrationFormData>;
  onUpdate: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

const ClientFiscalDataStep: React.FC<Props> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    documentNumber: data.documentNumber || '',
    address: data.address || '',
    addressCity: (data as any)?.addressCity || '',
    addressLat: (data as any)?.addressLat || null as number | null,
    addressLng: (data as any)?.addressLng || null as number | null,
    province: (data as any)?.province || '',
    postalCode: (data as any)?.postalCode || '',
    country: (data as any)?.country || '',
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

  const handleAddressSelect = (v: any) => {
    setFormData(prev => ({
      ...prev,
      address: v.address,
      addressCity: v.city,
      province: v.state || prev.province,
      postalCode: v.zip || prev.postalCode,
      country: v.country || prev.country,
      addressLat: v.lat,
      addressLng: v.lng,
    }));
    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    } else {
      const docValidation = validateDocument(formData.documentNumber);
      if (!docValidation.isValid) {
        newErrors.documentNumber = docValidation.message;
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
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
          Datos Fiscales
        </h2>
        <p className="text-white/70">
          Información fiscal y dirección comercial
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Número de Documento */}
        <div>
          <Label htmlFor="documentNumber" className="text-white/80 mb-2 block">
            RUT / NIF / CIF *
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <Input
              id="documentNumber"
              type="text"
              placeholder={getDocumentPlaceholder('cif')}
              value={formData.documentNumber}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              className={`pl-12 bg-white/5 border-white/20 text-white ${errors.documentNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.documentNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.documentNumber}</p>
          )}
          <p className="text-white/50 text-sm mt-1">
            Formato válido: DNI (12345678A), NIE (X1234567L), CIF (B12345678)
          </p>
        </div>

        {/* Dirección (con Google Places) */}
        <div>
          <Label htmlFor="address" className="text-white/80 mb-2 block">
            Dirección Fiscal/Comercial *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <div className="pl-12">
              <AddressInput
                id="fiscal-address"
                value={{ address: formData.address || '', city: formData.addressCity || '', lat: formData.addressLat || 0, lng: formData.addressLng || 0 }}
                onChange={handleAddressSelect}
                placeholder="Calle, número, ciudad, código postal"
              />
            </div>
          </div>
          {errors.address && (
            <p className="text-red-400 text-sm mt-1">{errors.address}</p>
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
            className="order-1 md:order-2 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold"
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientFiscalDataStep;
