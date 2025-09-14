
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import { validateDocument, getDocumentPlaceholder } from "@/utils/documentValidation";
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentDetailsFormProps {
  form: UseFormReturn<VehicleTransferRequest>;
  fieldPrefix: 'senderDetails' | 'receiverDetails';
  title: string;
}

const DocumentDetailsForm: React.FC<DocumentDetailsFormProps> = ({
  form,
  fieldPrefix,
  title
}) => {
  return (
    <div className="space-y-6">
      <div className="text-white/60 text-sm mb-4">
        {title}
      </div>

      <FormField
        control={form.control}
        name={`${fieldPrefix}.fullName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Nombre completo</FormLabel>
            <FormControl>
              <Input placeholder="Nombre y apellidos" {...field} />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${fieldPrefix}.dni`}
        render={({ field }) => {
          const validation = validateDocument(field.value || '');
          return (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="text-white font-medium">DNI/NIE/CIF</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-white/60" />
                    </TooltipTrigger>
                    <TooltipContent className="space-y-2 max-w-xs">
                      <p>Formatos válidos:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>DNI: 8 números + letra (12345678A)</li>
                        <li>NIE: X/Y/Z + 7 números + letra (X1234567L)</li>
                        <li>CIF: Letra + 7 números + número/letra (B12345678)</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input 
                  placeholder={getDocumentPlaceholder('dni')}
                  className={!validation.isValid && field.value ? 'border-red-500' : ''}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-white/60">
                {field.value && !validation.isValid && validation.message}
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name={`${fieldPrefix}.email`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="correo@ejemplo.com" {...field} />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`${fieldPrefix}.phone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Teléfono</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+34 600 000 000" {...field} />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DocumentDetailsForm;
