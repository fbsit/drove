
import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { type DriverApplicationData } from '@/types/driver-application';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface PersonalInfoStepProps {
  form: UseFormReturn<DriverApplicationData>;
  isCompletingProfile?: boolean;
}

const PersonalInfoStep = ({ form, isCompletingProfile = false }: PersonalInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nombres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    placeholder="Juan" 
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
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
          name="apellidos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellidos</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    placeholder="Pérez García" 
                    className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  placeholder="ejemplo@correo.com" 
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

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="codigoPais"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel>Código</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="País" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="+34">+34</SelectItem>
                  <SelectItem value="+351">+351</SelectItem>
                  <SelectItem value="+33">+33</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input 
                    placeholder="600123456" 
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
      </div>

      <FormField
        control={form.control}
        name="fechaNacimiento"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="bg-white text-gray-900 border-gray-200 pl-10 relative flex justify-start text-left font-normal hover:bg-gray-50"
                  >
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    {field.value ? (
                      format(field.value, "PPP", { locale: es })
                    ) : (
                      <span className="text-gray-400">Seleccionar fecha</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1940-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInfoStep;
