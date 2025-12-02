import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSalon } from '@/contexts/SalonContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Services() {
  const { services, professionals, addService, updateService, deleteService } = useSalon();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    professionalId: '',
    category: '',
  });

  const resetForm = () => {
    setFormData({ name: '', price: '', duration: '', professionalId: '', category: '' });
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      professionalId: formData.professionalId,
      category: formData.category,
    };

    if (editingService) {
      updateService(editingService, serviceData);
      toast({ title: 'Serviço atualizado com sucesso!' });
    } else {
      addService(serviceData);
      toast({ title: 'Serviço criado com sucesso!' });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        professionalId: service.professionalId,
        category: service.category,
      });
      setEditingService(serviceId);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (serviceId: string) => {
    deleteService(serviceId);
    toast({ title: 'Serviço removido com sucesso!' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const categories = ['Cabelo', 'Unhas', 'Cílios', 'Depilação', 'Estética', 'Maquiagem'];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">Serviços</h1>
            <p className="text-muted-foreground mt-1">Gerencie os serviços do salão</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Corte Feminino"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="80.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="45"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Select value={formData.professionalId} onValueChange={(value) => setFormData({ ...formData, professionalId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>{prof.name} - {prof.specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" variant="gradient" className="w-full">
                  {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para gerenciar seus serviços.">
          <div className="grid gap-4">
            {services.map((service, index) => {
              const professional = professionals.find(p => p.id === service.professionalId);
              
              return (
                <Card 
                  key={service.id} 
                  className="p-4 border-0 shadow-soft animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-lg">
                          {service.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(service.duration)}
                          </span>
                          {professional && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {professional.name}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gradient">
                        {formatPrice(service.price)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service.id)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </SubscriptionGate>
      </div>
    </AdminLayout>
  );
}
