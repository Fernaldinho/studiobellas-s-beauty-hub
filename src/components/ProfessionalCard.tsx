import { Professional } from '@/types/salon';
import { Card } from '@/components/ui/card';
import { useSalon } from '@/contexts/SalonContext';

interface ProfessionalCardProps {
  professional: Professional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { services } = useSalon();
  
  const professionalServices = services.filter(s => s.professionalId === professional.id);

  return (
    <Card className="overflow-hidden group hover:shadow-card transition-all duration-300 border-0 bg-card">
      <div className="aspect-square relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <img
          src={professional.photo}
          alt={professional.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
          <h3 className="font-display text-xl font-semibold">{professional.name}</h3>
          <p className="text-sm opacity-90">{professional.specialty}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Serviços:</p>
        <div className="flex flex-wrap gap-1">
          {professionalServices.slice(0, 3).map(service => (
            <span
              key={service.id}
              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {service.name}
            </span>
          ))}
          {professionalServices.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              +{professionalServices.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
