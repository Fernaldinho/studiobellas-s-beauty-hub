import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSalon } from '@/contexts/SalonContext';
import { Card } from '@/components/ui/card';
import { User, Calendar, Phone } from 'lucide-react';

export default function Clients() {
  const { clients, appointments, services, professionals } = useSalon();

  // Create client list from appointments
  const clientList = appointments.reduce((acc, apt) => {
    const existing = acc.find(c => c.phone === apt.clientPhone);
    if (existing) {
      existing.totalVisits += 1;
      if (apt.date > existing.lastVisit) {
        existing.lastVisit = apt.date;
      }
      existing.appointments.push(apt);
    } else {
      acc.push({
        id: apt.clientPhone,
        name: apt.clientName,
        phone: apt.clientPhone,
        totalVisits: 1,
        lastVisit: apt.date,
        appointments: [apt],
      });
    }
    return acc;
  }, [] as typeof clients);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Histórico de clientes do salão</p>
        </div>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para ver o histórico de clientes.">
          {clientList.length === 0 ? (
            <Card className="p-12 text-center border-0 shadow-card">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Nenhum cliente ainda
              </h3>
              <p className="text-muted-foreground">
                Os clientes aparecerão aqui conforme forem fazendo agendamentos.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {clientList.map((client, index) => (
                <Card 
                  key={client.id} 
                  className="p-6 border-0 shadow-soft animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-display font-semibold text-xl">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {client.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {formatPhone(client.phone)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Última visita: {formatDate(client.lastVisit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gradient">{client.totalVisits}</div>
                      <div className="text-sm text-muted-foreground">visitas</div>
                    </div>
                  </div>

                  {/* Recent appointments */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Últimos agendamentos</p>
                    <div className="space-y-2">
                      {client.appointments.slice(-3).reverse().map(apt => {
                        const service = services.find(s => s.id === apt.serviceId);
                        const professional = professionals.find(p => p.id === apt.professionalId);
                        return (
                          <div key={apt.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">
                              {service?.name} com {professional?.name}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(apt.date)} às {apt.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </SubscriptionGate>
      </div>
    </AdminLayout>
  );
}
