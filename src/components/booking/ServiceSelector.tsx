import { useSalon } from '@/contexts/SalonContext';
import { Service, Professional } from '@/types/salon';
import { Card } from '@/components/ui/card';
import { Clock, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceSelectorProps {
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ selectedService, onSelect }: ServiceSelectorProps) {
  const { services, professionals } = useSalon();

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getProfessional = (id: string): Professional | undefined => {
    return professionals.find(p => p.id === id);
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Escolha seu Serviço
        </h2>
        <p className="text-muted-foreground mt-2">
          Selecione o tratamento que deseja realizar
        </p>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-display font-medium text-foreground px-1">
            {category}
          </h3>
          <div className="grid gap-3">
            {categoryServices.map((service, index) => {
              const professional = getProfessional(service.professionalId);
              const isSelected = selectedService?.id === service.id;

              return (
                <Card
                  key={service.id}
                  onClick={() => onSelect(service)}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-300 border-2",
                    "hover:shadow-card hover:border-primary/30",
                    "animate-fade-in",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-card" 
                      : "border-transparent bg-card"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(service.duration)}
                        </span>
                        {professional && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {professional.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gradient">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
