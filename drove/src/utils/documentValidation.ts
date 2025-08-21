
// Expresiones regulares para validación de documentos
const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const NIE_REGEX = /^[XYZ][0-9]{7}[A-Z]$/;
const CIF_REGEX = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;

export const validateDocument = (value: string): { isValid: boolean; message: string; type?: string } => {
  const upperValue = value.toUpperCase();
  
  if (DNI_REGEX.test(upperValue)) {
    return { isValid: true, message: '', type: 'dni' };
  }
  
  if (NIE_REGEX.test(upperValue)) {
    return { isValid: true, message: '', type: 'nie' };
  }
  
  if (CIF_REGEX.test(upperValue)) {
    return { isValid: true, message: '', type: 'cif' };
  }

  return {
    isValid: false,
    message: 'Formato inválido. Use:\n- DNI: 12345678A\n- NIE: X1234567L\n- CIF: B12345678'
  };
};

export const getDocumentPlaceholder = (documentType: string): string => {
  switch (documentType) {
    case 'dni':
      return '12345678A';
    case 'nie':
      return 'X1234567L';
    case 'cif':
      return 'B12345678';
    default:
      return 'Introduzca su documento';
  }
};
