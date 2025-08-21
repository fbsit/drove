
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DriverApplicationData } from '@/types/driver-application';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentationStepProps {
  form: UseFormReturn<DriverApplicationData>;
}

const DocumentationStep: React.FC<DocumentationStepProps> = ({ form }) => {
  const [fileNames, setFileNames] = useState({
    nifDniNie: '',
    licenciaConducirAnverso: '',
    licenciaConducirReverso: '',
    certificadoAntecedentes: ''
  });

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(field as any, file.name);
      setFileNames(prev => ({ ...prev, [field]: file.name }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="nifDniNie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIF / DNI / NIE</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Introduce tu número de documento" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-bold mt-6 mb-4">Documentación Requerida</h3>
        
        <FormField
          control={form.control}
          name="licenciaConducirAnverso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia de conducir (anverso)</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="licenciaConducirAnverso"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('licenciaConducirAnverso', e)}
                  />
                  <label htmlFor="licenciaConducirAnverso" className="cursor-pointer">
                    <Card className={`border-dashed hover:bg-white/5 transition-colors ${fileNames.licenciaConducirAnverso ? 'bg-white/10' : ''}`}>
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        {fileNames.licenciaConducirAnverso ? (
                          <div className="flex items-center gap-2 text-drove-accent">
                            <FileText size={24} />
                            <span>{fileNames.licenciaConducirAnverso}</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-white/70" />
                            <span className="text-center text-white/70">Haz clic para subir el anverso de tu licencia</span>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="licenciaConducirReverso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia de conducir (reverso)</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="licenciaConducirReverso"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('licenciaConducirReverso', e)}
                  />
                  <label htmlFor="licenciaConducirReverso" className="cursor-pointer">
                    <Card className={`border-dashed hover:bg-white/5 transition-colors ${fileNames.licenciaConducirReverso ? 'bg-white/10' : ''}`}>
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        {fileNames.licenciaConducirReverso ? (
                          <div className="flex items-center gap-2 text-drove-accent">
                            <FileText size={24} />
                            <span>{fileNames.licenciaConducirReverso}</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-white/70" />
                            <span className="text-center text-white/70">Haz clic para subir el reverso de tu licencia</span>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="certificadoAntecedentes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificado de antecedentes</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="certificadoAntecedentes"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('certificadoAntecedentes', e)}
                  />
                  <label htmlFor="certificadoAntecedentes" className="cursor-pointer">
                    <Card className={`border-dashed hover:bg-white/5 transition-colors ${fileNames.certificadoAntecedentes ? 'bg-white/10' : ''}`}>
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                        {fileNames.certificadoAntecedentes ? (
                          <div className="flex items-center gap-2 text-drove-accent">
                            <FileText size={24} />
                            <span>{fileNames.certificadoAntecedentes}</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-white/70" />
                            <span className="text-center text-white/70">Haz clic para subir tu certificado de antecedentes</span>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="aceptarTerminos"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-white/10">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Acepto los términos y condiciones
              </FormLabel>
              <FormDescription className="text-xs text-gray-400">
                Al marcar esta casilla, acepto los términos y condiciones de Drove, incluyendo el procesamiento de mis datos personales para la postulación.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default DocumentationStep;
