
/**
 * Utilidad simple para búsqueda difusa en arrays de objetos.
 * (No reemplaza a Fuse.js pero es ligera y fácil de mantener.)
 * Recibe la query y campos sobre los que buscar.
 */
export function fuzzySearch<T extends Record<string, any>>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();

  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      // Convertimos a string seguro, evitando null/undefined
      return (value !== null && value !== undefined
        ? String(value)
        : ""
      )
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
        .includes(q);
    })
  );
}
