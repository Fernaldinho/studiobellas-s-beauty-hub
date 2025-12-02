import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Sparkles } from 'lucide-react';

interface ClientFormProps {
  onSubmit: (name: string, phone: string) => void;
  isLoading?: boolean;
}

export function ClientForm({ onSubmit, isLoading }: ClientFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Por favor, insira seu nome';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    const phoneNumbers = phone.replace(/\D/g, '');
    if (!phoneNumbers) {
      newErrors.phone = 'Por favor, insira seu WhatsApp';
    } else if (phoneNumbers.length < 10) {
      newErrors.phone = 'Número de WhatsApp inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), phone.replace(/\D/g, ''));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Seus Dados
        </h2>
        <p className="text-muted-foreground mt-2">
          Preencha suas informações para confirmar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12 rounded-xl input-elegant"
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            WhatsApp
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={15}
              className="pl-10 h-12 rounded-xl input-elegant"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full"
          disabled={isLoading}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </Button>
      </form>
    </div>
  );
}
