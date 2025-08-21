
import React from 'react';
import { Building, IdCard, Lock, User } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { type ClientRegistrationData } from '@/types/client-registration';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SignatureCanvas from '@/components/SignatureCanvas';

interface IdentityStepProps {
  form: UseFormReturn<ClientRegistrationData>;
  isCompletingProfile?: boolean;
}

const IdentityStep = ({ form, isCompletingProfile = false }: IdentityStepProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="nombreCompleto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.getValues('tipoCliente') === 'empresa' ? 'Nombre de la empresa' : 'Nombre completo'}
            </FormLabel>
            <FormControl>
              <div className="relative">
                {form.getValues('tipoCliente') === 'empresa' ? 
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> :
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                }
                <Input 
                  placeholder={form.getValues('tipoCliente') === 'empresa' ? 'Nombre de la empresa' : 'Nombre y apellidos'} 
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                  disabled={isCompletingProfile} // Disable if completing profile
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentoIdentidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{form.getValues('tipoCliente') === 'empresa' ? 'CIF' : 'DNI/NIE'}</FormLabel>
            <FormControl>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  placeholder={form.getValues('tipoCliente') === 'empresa' ? 'B12345678' : '12345678A'} 
                  className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                  disabled={isCompletingProfile} // Disable if completing profile
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isCompletingProfile && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="firma"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Firma</FormLabel>
            <SignatureCanvas onSignatureChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default IdentityStep;
