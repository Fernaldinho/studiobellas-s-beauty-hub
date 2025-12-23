import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { CalendarPicker } from '@/components/booking/CalendarPicker';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { ClientForm } from '@/components/booking/ClientForm';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import { Service, Professional } from '@/types/salon';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Sparkles, 
  Heart, 
  Star, 
  ChevronRight, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

type BookingStep = 'landing' | 'service' | 'date' | 'time' | 'form' | 'success';

interface SalonSettings {
  id: string;
  name: string;
  description: string | null;
  whatsapp: string | null;
  banner_url: string | null;
  logo_url: string | null;
  logo_format: string;
  banner_format: string;
  theme_preset: string;
  opening_hours_start: string;
  opening_hours_end: string;
}

interface DBProfessional {
  id: string;
  name: string;
  specialty: string | null;
  photo: string | null;
  available_days: number[];
  available_hours_start: string;
  available_hours_end: string;
}

interface DBService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string | null;
  professional_id: string | null;
}

export default function SalonPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [salon, setSalon] = useState<SalonSettings | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [step, setStep] = useState<BookingStep>('landing');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (salonId) {
      loadSalonData();
    }
  }, [salonId]);

  const loadSalonData = async () => {
    try {
      // Load salon settings
      const { data: salonData, error: salonError } = await supabase
        .from('salon_settings')
        .select('*')
        .eq('id', salonId)
        .maybeSingle();

      if (salonError || !salonData) {
        toast({
          title: 'Erro',
          description: 'Salão não encontrado.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      setSalon(salonData);

      // Load professionals
      const { data: profsData } = await supabase
        .from('professionals')
        .select('*')
        .eq('salon_id', salonId);

      if (profsData) {
        const mappedProfs: Professional[] = profsData.map((p: DBProfessional) => ({
          id: p.id,
          name: p.name,
          specialty: p.specialty || '',
          photo: p.photo || '',
          services: [],
          availableDays: p.available_days || [1, 2, 3, 4, 5, 6],
          availableHours: {
            start: p.available_hours_start || '09:00',
            end: p.available_hours_end || '18:00',
          },
        }));
        setProfessionals(mappedProfs);
      }

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId);

      if (servicesData) {
        const mappedServices: Service[] = servicesData.map((s: DBService) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration: s.duration,
          category: s.category || '',
          professionalId: s.professional_id || '',
        }));
        setServices(mappedServices);
      }
    } catch (err) {
      console.error('Error loading salon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    const professional = professionals.find(p => p.id === service.professionalId);
    setSelectedProfessional(professional || professionals[0] || null);
    setStep('date');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleFormSubmit = async (name: string, phone: string) => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !salonId) return;

    setIsSubmitting(true);
    setClientName(name);

    try {
      const { error } = await supabase.from('appointments').insert({
        salon_id: salonId,
        professional_id: selectedProfessional.id,
        service_id: selectedService.id,
        client_name: name,
        client_phone: phone,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
      });

      if (error) throw error;

      setStep('success');
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientName('');
    setStep('landing');
  };

  const handleBack = () => {
    switch (step) {
      case 'service':
        setStep('landing');
        break;
      case 'date':
        setStep('service');
        setSelectedService(null);
        break;
      case 'time':
        setStep('date');
        setSelectedDate(null);
        break;
      case 'form':
        setStep('time');
        setSelectedTime(null);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Salão não encontrado
          </h1>
          <p className="text-muted-foreground">
            Verifique se o link está correto.
          </p>
        </div>
      </div>
    );
  }

  // Booking Flow
  if (step !== 'landing') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            {step !== 'success' && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="font-display font-semibold text-foreground">{salon.name}</h1>
              <p className="text-xs text-muted-foreground">Agendamento Online</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {step === 'service' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  Escolha um Serviço
                </h2>
              </div>
              <div className="grid gap-4">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration} min</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        R$ {service.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 'date' && selectedProfessional && (
            <CalendarPicker
              professionalId={selectedProfessional.id}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
          )}
          {step === 'time' && selectedProfessional && selectedDate && (
            <TimeSlotPicker
              professionalId={selectedProfessional.id}
              date={selectedDate}
              selectedTime={selectedTime}
              onSelect={handleTimeSelect}
            />
          )}
          {step === 'form' && (
            <ClientForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
          {step === 'success' && selectedService && selectedProfessional && selectedDate && selectedTime && (
            <BookingSuccess
              service={selectedService}
              professional={selectedProfessional}
              date={selectedDate}
              time={selectedTime}
              clientName={clientName}
              onNewBooking={handleNewBooking}
            />
          )}
        </main>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {salon.logo_url ? (
              <img
                src={salon.logo_url}
                alt={salon.name}
                className={cn(
                  'w-10 h-10 object-cover shadow-soft',
                  salon.logo_format === 'circular' && 'rounded-full',
                  salon.logo_format === 'square' && 'rounded-xl',
                  salon.logo_format === 'rectangular' && 'rounded-lg w-14 h-10'
                )}
              />
            ) : (
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-display font-semibold text-xl text-foreground">{salon.name}</span>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        {salon.banner_url ? (
          <div className="absolute inset-0">
            <img
              src={salon.banner_url}
              alt="Banner"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 gradient-soft" />
          </div>
        ) : (
          <div className="absolute inset-0 gradient-soft" />
        )}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Seu momento de beleza</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Agende seu momento de beleza no{' '}
              <span className="text-gradient">{salon.name}</span> 💖
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {salon.description || 'Transforme-se com nossos tratamentos exclusivos.'}
            </p>
            
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => setStep('service')}
              className="group"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Agora
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>4.9 estrelas</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="text-sm text-muted-foreground">
                +500 clientes satisfeitas
              </div>
            </div>
          </div>
        </div>
      </section>

      {professionals.length > 0 && (
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
                Nossas Profissionais
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto text-center">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Pronta para se transformar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Reserve seu horário agora e deixe-nos cuidar de você.
            </p>
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setStep('service')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Meu Horário
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 {salon.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
