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
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterClient, setFilterClient] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const debouncedSearch = useDebouncedValue(search, 300);

  /* --------------------- fetch real de facturas desde API ------------------ */
  const {
    data: invoices = [],
    isLoading,
    refetch: refetchInvoices,
  } = useQuery<any[]>({
    queryKey: ['invoices', { search: debouncedSearch, status: filterStatus, clientId: filterClient, from: dateRange.from?.toISOString().slice(0, 10), to: dateRange.to?.toISOString().slice(0, 10) }],
    queryFn: async ({ queryKey }) => {
      try {
        const [, params] = queryKey as [string, { search?: string; status?: string; clientId?: string; from?: string; to?: string }];
        return await AdminService.getAllInvoices({
          search: params?.search || undefined,
          status: params?.status && params.status !== 'todos' ? params.status : undefined,
          clientId: params?.clientId || undefined,
          from: params?.from,
          to: params?.to,
        });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las facturas.',
        });
        return [] as any[];
      }
    },
  });


  /* ----------------------------- helpers derivadas ------------------------ */
  const normalizedInvoices = useMemo(() => {
    const list = Array.isArray(invoices) ? invoices : [];
    return list.map((inv: any) => {
      const t = inv.travel || {};
      const vehicleFromFields = inv.vehicle
        || [inv?.vehicle_details?.brand, inv?.vehicle_details?.model].filter(Boolean).join(' ')
        || [inv?.brandVehicle, inv?.modelVehicle].filter(Boolean).join(' ')
        || [t?.brandVehicle, t?.modelVehicle].filter(Boolean).join(' ');
      const origin = inv.fromAddress
        || inv.originAddress
        || inv?.pickup_details?.originAddress
        || inv?.startAddress?.address
        || inv?.startAddress?.city
        || t?.startAddress?.address
        || t?.startAddress?.city
        || '';
      const destination = inv.toAddress
        || inv.destinationAddress
        || inv?.pickup_details?.destinationAddress
        || inv?.endAddress?.address
        || inv?.endAddress?.city
        || t?.endAddress?.address
        || t?.endAddress?.city
        || '';
      const transferId = inv.transferId || inv.travelId || inv.transfer_id || inv.tripId || t?.id;
      return {
        id: String(inv.id ?? inv.invoiceId ?? inv.transferId ?? Date.now()),
        invoiceDate: inv.invoiceDate || inv.date || inv.createdAt || inv.issue_date,
        client: inv.client || inv.client_name || inv.clientName || t?.client?.contactInfo?.fullName,
        client_name: inv.client_name || inv.client || inv.clientName || t?.client?.contactInfo?.fullName,
        vehicle: vehicleFromFields || undefined,
        fromAddress: origin || undefined,
        toAddress: destination || undefined,
        droverName: inv.droverName || inv?.drover?.contactInfo?.fullName || inv.drover_name || t?.drover?.contactInfo?.fullName,
        paymentMethod: inv.paymentMethod || inv.payment_method || inv.method,
        status: inv.status || inv.invoiceStatus || inv.state,
        isAdvance: inv.isAdvance ?? inv.advance ?? false,
        transferStatus: inv.transferStatus || inv.transfer_status || inv.tripStatus || t?.status,
        urlPDF: inv.urlPDF || inv.pdfUrl || inv.pdf_url || null,
        transferId,
        notes: inv.notes,
      };
    });
  }, [invoices]);

  const clients = useMemo(
    () => Array.from(new Set(normalizedInvoices?.map((inv: any) => inv?.client_name))),
    [normalizedInvoices],
  );

  // Fallback: si el backend ignora filtros, aplicamos filtrado local por estado
  const filteredInvoices = React.useMemo(() => {
    const list = Array.isArray(normalizedInvoices) ? normalizedInvoices : [];
    if (filterStatus && filterStatus !== 'todos') {
      return list.filter((inv) => inv?.status === filterStatus);
    }
    return list;
  }, [normalizedInvoices, filterStatus]);


  async function handleUploadPDF(file: File, invoiceId: string): Promise<'success' | 'exists' | 'error'> {
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
      // Refetch para mostrar URL PDF, el estado queda manual (Emitida/Anticipo/Pagada)
      await refetchInvoices();
      return 'success';
    } catch (error) {
      console.log('Error al subir PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error al subir PDF',
        description: 'No se pudo subir el PDF de la factura. Inténtalo de nuevo.',
      });
      return 'error';
    }
  }

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'emitida' | 'anticipo' | 'pagada' | 'rejected' | 'voided' }) =>
      AdminService.updateInvoiceStatus(id, status),
    onSuccess: () => refetchInvoices(),
  });

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="">

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
            {filteredInvoices.map((invoice: any) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onUploadPDF={(file) => handleUploadPDF(file, invoice.id)}
                onChangeStatus={(id, status) =>
                  changeStatusMutation.mutateAsync({ id, status })
                }
                onRevertStatus={(id) =>
                  changeStatusMutation.mutateAsync({ id, status: 'emitida' })
                }
                onReject={(id) =>
                  changeStatusMutation.mutateAsync({ id, status: 'rejected' })
                }
                onCancel={(id) =>
                  changeStatusMutation.mutateAsync({ id, status: 'voided' })
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
