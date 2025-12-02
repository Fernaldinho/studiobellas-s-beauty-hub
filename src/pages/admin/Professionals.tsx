import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSalon } from '@/contexts/SalonContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Professionals() {
  const { professionals, services } = useSalon();

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe do salão</p>
        </div>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para gerenciar suas profissionais.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professionals.map((professional, index) => {
              const professionalServices = services.filter(s => s.professionalId === professional.id);

              return (
                <Card 
                  key={professional.id} 
                  className="overflow-hidden border-0 shadow-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 gradient-hero opacity-30" />
                    <img
                      src={professional.photo}
                      alt={professional.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                      <h3 className="font-display text-2xl font-semibold">{professional.name}</h3>
                      <p className="text-sm opacity-90">{professional.specialty}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Dias de trabalho</p>
                      <div className="flex gap-1">
                        {weekDays.map((day, i) => (
                          <Badge
                            key={day}
                            variant={professional.availableDays.includes(i) ? 'default' : 'secondary'}
                            className={professional.availableDays.includes(i) ? 'gradient-primary' : ''}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Horário</p>
                      <p className="text-foreground">
                        {professional.availableHours.start} - {professional.availableHours.end}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Serviços ({professionalServices.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {professionalServices.map(service => (
                          <Badge key={service.id} variant="outline">
                            {service.name}
                          </Badge>
                        ))}
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
