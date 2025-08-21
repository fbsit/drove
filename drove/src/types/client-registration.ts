
import * as z from 'zod';

const clientTypeSchema = z.object({
  tipoCliente: z.enum(['empresa', 'persona'], {
    required_error: "Selecciona el tipo de cliente"
  }),
  email: z.string().email({
    message: "Introduce un correo electrónico válido"
  }),
  telefono: z.string()
    .min(9, { message: "El número debe tener al menos 9 dígitos" })
    .max(15, { message: "Número demasiado largo" }),
  codigoPais: z.string().min(1, { message: "Selecciona un código de país" }),
});

const addressSchema = z.object({
  pais: z.string().min(1, { message: "Selecciona un país" }),
  direccion: z.string().min(5, { message: "La dirección es demasiado corta" }),
  ciudad: z.string().min(2, { message: "Introduce una ciudad válida" }),
  provincia: z.string().min(2, { message: "Introduce una provincia válida" }),
  codigoPostal: z.string().min(4, { message: "Código postal inválido" }),
});

const identitySchema = z.object({
  nombreCompleto: z.string().min(2, { message: "Nombre demasiado corto" }),
  documentoIdentidad: z.string().min(8, { message: "Documento de identidad inválido" }),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "La contraseña debe contener mayúsculas, minúsculas y números"
    }),
  firma: z.string().min(1, { message: "La firma es requerida" }),
});

export const clientRegistrationSchema = z.object({
  ...clientTypeSchema.shape,
  ...addressSchema.shape,
  ...identitySchema.shape,
});

export const stepSchemas = {
  CLIENT_TYPE: clientTypeSchema,
  ADDRESS: addressSchema,
  IDENTITY: identitySchema,
} as const;

export type ClientRegistrationData = z.infer<typeof clientRegistrationSchema>;

