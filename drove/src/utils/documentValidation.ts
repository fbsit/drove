// Expresiones regulares base
const DNI_REGEX = /^[0-9]{8}$/;
const NIE_REGEX = /^[XYZ][0-9]{7}[A-Z]$/;
const CIF_REGEX = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
// RUT chileno: acepta con o sin puntos y con o sin guión para el dígito verificador
const RUT_BASE_REGEX = /^(\d{1,2}\.?(\d{3})\.?(\d{3})-?[\dKk])$/;

const isValidRut = (value: string): boolean => {
  const sanitized = value.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (!/^[0-9]{7,8}[0-9K]$/.test(sanitized)) return false;
  const body = sanitized.slice(0, -1);
  const dv = sanitized.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return dv === expected;
};

export const validateDocument = (
  value: string
): { isValid: boolean; message: string; type?: string } => {
  const upperValue = value.toUpperCase();

  if (DNI_REGEX.test(upperValue)) {
    return { isValid: true, message: "", type: "dni" };
  }

  if (NIE_REGEX.test(upperValue)) {
    return { isValid: true, message: "", type: "nie" };
  }

  if (CIF_REGEX.test(upperValue)) {
    return { isValid: true, message: "", type: "cif" };
  }

  if (RUT_BASE_REGEX.test(value) && isValidRut(value)) {
    return { isValid: true, message: "", type: "rut" };
  }

  return {
    isValid: false,
    message:
      "Formato inválido. Use:\n- DNI: 123456786\n- NIE: X1234567L\n- CIF: B12345678\n- RUT: 12.345.678-5",
  };
};

export const getDocumentPlaceholder = (documentType: string): string => {
  switch (documentType) {
    case "dni":
      return "123456786";
    case "nie":
      return "X1234567L";
    case "cif":
      return "B12345678";
    case "rut":
      return "12.345.678-5";
    default:
      return "Introduzca su documento";
  }
};
