import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebounce';
import InvoiceFiltersBar from '@/components/admin/invoices/InvoiceFiltersBar';
import InvoiceCard from '@/components/admin/invoices/InvoiceCard';
import { toast } from '@/hooks/use-toast';
import { AdminService } from '@/services/adminService';
import { InvoiceData as Invoice } from '@/hooks/admin/useBillingManagement';

const description =
  'Gestiona todas las facturas emitidas en DROVE. Controla pagos, emite nuevas facturas y mantén el control financiero.';

const Invoices: React.FC = () => {
  /* ----------------------------- filtros locale ---------------------------- */
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | Invoice['status']>('todos');
  const [filterClient, setFilterClient] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const debouncedSearch = useDebouncedValue(search, 300);

  /* --------------------- fetch real de facturas desde API ------------------ */
  const {
    data: invoices = [],
    isLoading,
    refetch: refetchInvoices,
  } = useQuery<Invoice[]>({
    queryKey: ['invoices', { search: debouncedSearch, status: filterStatus, clientId: filterClient, from: dateRange.from?.toISOString().slice(0,10), to: dateRange.to?.toISOString().slice(0,10) }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { search?: string; status?: string; clientId?: string; from?: string; to?: string }];
      return AdminService.getAllInvoices({
        search: params?.search || undefined,
        status: params?.status && params.status !== 'todos' ? params.status : undefined,
        clientId: params?.clientId || undefined,
        from: params?.from,
        to: params?.to,
      });
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las facturas.',
      }),
  });

  /* ----------------------------- helpers derivadas ------------------------ */
  const clients = useMemo(
    () => Array.from(new Set(invoices?.map((inv) => inv?.client_name))),
    [invoices],
  );

  // Fallback: si el backend ignora filtros, aplicamos filtrado local por estado
  const filteredInvoices = React.useMemo(() => {
    const list = Array.isArray(invoices) ? invoices : [];
    if (filterStatus && filterStatus !== 'todos') {
      return list.filter((inv) => inv?.status === filterStatus);
    }
    return list;
  }, [invoices, filterStatus]);


  async function handleUploadPDF(file: File, invoiceId: string) {
    try {
      console.log("init");
      const form = new FormData();
      form.append('file', file);
      form.append('invoiceId', invoiceId);
      
      // El backend debería responder 200 + { success: true } o 204 (No Content)
      const result = await AdminService.uploadInvoice(form);
      console.log("resultado", result);
      
      // Si llegamos aquí, la petición fue exitosa (no se lanzó error)
      toast({
        title: 'PDF subido',
        description: 'El PDF de la factura se ha subido correctamente.',
      });
      
      refetchInvoices();
    } catch (error) {
      console.log('Error al subir PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir PDF',
        description: 'No se pudo subir el PDF de la factura. Inténtalo de nuevo.',
      });
    }
  }

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice['status'] }) =>
      AdminService.updateInvoiceStatus(id, status), // crea este endpoint si no existe
    onSuccess: () => refetchInvoices(),
  });

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="admin-page-container">
      {/* ------------- cabecera ------------- */}
      <section
        className="w-full flex flex-col items-center justify-center text-center bg-gradient-to-tr
                   from-[#292244] via-[#242b36] to-[#191428] rounded-2xl border
                   border-[#6EF7FF33] px-4 py-6 mb-5 shadow-[0_2px_32px_0_#6EF7FF11]
                   md:flex-row md:items-end md:text-left md:py-8 md:px-8"
      >
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1 className="text-xl md:text-2xl text-white font-bold mb-2">Gestión de Facturas</h1>
          <p className="text-sm md:text-base text-white/70 max-w-md">{description}</p>
        </div>
      </section>

      {/* ------------- barra de filtros ------------- */}
      <InvoiceFiltersBar
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterTransfer="todos"
        setFilterTransfer={() => { }}
        filterClient={filterClient}
        setFilterClient={setFilterClient}
        filterDrover="todos"
        setFilterDrover={() => { }}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clients={clients}
        drovers={[]} // ajusta si manejas drovers
      />

      {/* ------------- listado de facturas ------------- */}
      {isLoading ? (
        <p className="text-white/70 text-center py-12">Cargando facturas…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onUploadPDF={(file) => handleUploadPDF(file, invoice.id)}
                onChangeStatus={(id, status) =>
                  changeStatusMutation.mutate({ id, status })
                }
                onRevertStatus={(id) =>
                  changeStatusMutation.mutate({ id, status: 'emitida' })
                }
              />
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No se encontraron facturas</p>
              <p className="text-white/50 text-sm mt-2">
                Ajusta los filtros para encontrar las facturas que buscas
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invoices;
