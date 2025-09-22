
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { VehicleTransferRequest } from "@/types/vehicle-transfer-request";
import ScaledSignatureCanvas from "./ScaledSignatureCanvas";

interface SignatureSectionProps {
  form: UseFormReturn<VehicleTransferRequest>;
  onSignatureChange: (signatureData: string) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ form, onSignatureChange }) => {
  const signature = form.watch("transferDetails.signature");
  const [hasSigned, setHasSigned] = useState(false);

  // Efecto para verificar si hay una firma real (no vacía)
  useEffect(() => {
    if (signature && signature.length > 0 && signature !== 'data:,') {
      setHasSigned(true);
    } else {
      setHasSigned(false);
    }
  }, [signature]);

  const handleSignatureChange = (signatureData: string) => {
    console.log("Firma actualizada:", signatureData ? "Con firma" : "Sin firma");
    onSignatureChange(signatureData);
    setHasSigned(!!signatureData && signatureData.length > 0 && signatureData !== 'data:,');
  };

  return (
    <>
      <FormField
        control={form.control}
        name="transferDetails.signature"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-white font-medium">
              Firma del solicitante
              <span className="text-red-400 ml-1">*</span>
              {hasSigned && <span className="text-green-500 ml-2 text-sm">✓ Firmado</span>}
            </FormLabel>
            <FormControl>
              <ScaledSignatureCanvas onSignatureChange={handleSignatureChange} />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {!hasSigned && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            La firma es obligatoria para continuar
          </AlertDescription>
        </Alert>
      )}

      {hasSigned && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-md text-sm mt-6">
          ✓ Firma registrada correctamente
        </div>
      )}
    </>
  );
};

export default SignatureSection;
