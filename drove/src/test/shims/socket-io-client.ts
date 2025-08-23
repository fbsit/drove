export const io = () => {
  // prefer a shared mock if test installed one
  const g: any = globalThis as any;
  if (g.__SOCKET__) return g.__SOCKET__;
  return {
    on: () => {},
    emit: () => {},
    disconnect: () => {},
  } as any;
};

export type Socket = any;


