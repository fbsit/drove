
import React, { useState } from 'react';
import DroveButton from '@/components/DroveButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

const PromoBanner = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Quiero cotizar un traslado');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    try {
      setSending(true);
      await AdminService.createSupportTicket({ name, email, subject, message });
      toast({ title: 'Enviado', description: 'Hemos creado tu ticket de soporte. Te contactaremos pronto.' });
      setOpen(false);
      setName(''); setEmail(''); setSubject('Quiero cotizar un traslado'); setMessage('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'No fue posible enviar tu mensaje.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-drove-accent text-drove p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h3 className="font-bold">Transporte seguro y profesional</h3>
          <p className="font-medium">Realizamos transportes de vehículos en toda España</p>
        </div>
        <DroveButton
          variant="default"
          className="bg-drove border-drove hover:bg-drove/80"
          onClick={() => setOpen(true)}
        >
          Contáctanos
        </DroveButton>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#22142A] text-white border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Envíanos tu consulta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            <Input placeholder="Asunto" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            <Textarea placeholder="Cuéntanos tu duda o necesidad" value={message} onChange={(e) => setMessage(e.target.value)} className="bg-white/10 border-white/20 text-white min-h-[120px]" />
          </div>
          <DialogFooter>
            <DroveButton onClick={submit} disabled={sending || !email || !message} className="w-full md:w-auto">
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </DroveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PromoBanner;
