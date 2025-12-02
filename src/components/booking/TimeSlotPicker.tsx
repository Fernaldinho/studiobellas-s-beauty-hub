import { Clock, Lock } from 'lucide-react';
import { useSalon } from '@/contexts/SalonContext';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  professionalId: string;
  date: string;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({ professionalId, date, selectedTime, onSelect }: TimeSlotPickerProps) {
  const { getAvailableSlots, isSlotBooked } = useSalon();

  const slots = getAvailableSlots(professionalId, date);

  const morningSlots = slots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = slots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 12;
  });

  const renderSlot = (time: string) => {
    const booked = isSlotBooked(professionalId, date, time);
    const selected = time === selectedTime;

    return (
      <button
        key={time}
        onClick={() => !booked && onSelect(time)}
        disabled={booked}
        className={cn(
          "relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
          !booked && !selected && "bg-secondary hover:bg-primary/10 text-secondary-foreground",
          booked && "bg-muted text-muted-foreground/50 cursor-not-allowed",
          selected && "gradient-primary text-primary-foreground shadow-soft"
        )}
      >
        {time}
        {booked && (
          <Lock className="absolute top-1 right-1 w-3 h-3 text-muted-foreground/50" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Escolha o Horário
        </h2>
        <p className="text-muted-foreground mt-2">
          Selecione o melhor horário para você
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {morningSlots.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">🌅</span> Manhã
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {morningSlots.map(renderSlot)}
            </div>
          </div>
        )}

        {afternoonSlots.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">☀️</span> Tarde
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {afternoonSlots.map(renderSlot)}
            </div>
          </div>
        )}

        {slots.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum horário disponível para esta data.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full gradient-primary" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
