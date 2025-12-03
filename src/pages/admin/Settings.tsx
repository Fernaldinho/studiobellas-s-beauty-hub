import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSalon } from '@/contexts/SalonContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Save, Store, Clock, Phone, Palette, Image } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ThemeSelector, getThemeCSS } from '@/components/admin/ThemeSelector';
import { ImageFormat, ThemePreset } from '@/types/salon';

export default function Settings() {
  const { settings, updateSettings } = useSalon();
  const [formData, setFormData] = useState({
    name: settings.name,
    description: settings.description,
    whatsapp: settings.whatsapp,
    openingStart: settings.openingHours.start,
    openingEnd: settings.openingHours.end,
    bannerUrl: settings.bannerUrl,
    logoUrl: settings.logoUrl,
    logoFormat: settings.logoFormat,
    bannerFormat: settings.bannerFormat,
    themePreset: settings.themePreset,
  });

  useEffect(() => {
    setFormData({
      name: settings.name,
      description: settings.description,
      whatsapp: settings.whatsapp,
      openingStart: settings.openingHours.start,
      openingEnd: settings.openingHours.end,
      bannerUrl: settings.bannerUrl,
      logoUrl: settings.logoUrl,
      logoFormat: settings.logoFormat,
      bannerFormat: settings.bannerFormat,
      themePreset: settings.themePreset,
    });
  }, [settings]);

  const handleThemeChange = (theme: ThemePreset) => {
    setFormData({ ...formData, themePreset: theme });
    // Apply theme immediately
    const themeCSS = getThemeCSS(theme);
    Object.entries(themeCSS).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      openingHours: {
        start: formData.openingStart,
        end: formData.openingEnd,
      },
      bannerUrl: formData.bannerUrl,
      logoUrl: formData.logoUrl,
      logoFormat: formData.logoFormat,
      bannerFormat: formData.bannerFormat,
      themePreset: formData.themePreset,
    });
    toast({ title: 'Configurações salvas com sucesso!' });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Configure as informações do salão</p>
        </div>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para acessar as configurações.">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Informações do Salão
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Salão</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-elegant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-elegant resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Image className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Personalização Visual
                </h2>
              </div>

              <div className="space-y-6">
                <ImageUploader
                  label="Banner do Salão"
                  currentUrl={formData.bannerUrl}
                  format={formData.bannerFormat}
                  onUrlChange={(url) => setFormData({ ...formData, bannerUrl: url })}
                  onFormatChange={(format) => setFormData({ ...formData, bannerFormat: format })}
                />

                <ImageUploader
                  label="Logotipo"
                  currentUrl={formData.logoUrl}
                  format={formData.logoFormat}
                  onUrlChange={(url) => setFormData({ ...formData, logoUrl: url })}
                  onFormatChange={(format) => setFormData({ ...formData, logoFormat: format })}
                />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Tema Visual
                </h2>
              </div>

              <ThemeSelector
                currentTheme={formData.themePreset}
                onThemeChange={handleThemeChange}
              />
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Contato
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (apenas números)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                  placeholder="11999999999"
                  className="input-elegant"
                />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Horário de Funcionamento
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingStart">Abertura</Label>
                  <Input
                    id="openingStart"
                    type="time"
                    value={formData.openingStart}
                    onChange={(e) => setFormData({ ...formData, openingStart: e.target.value })}
                    className="input-elegant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingEnd">Fechamento</Label>
                  <Input
                    id="openingEnd"
                    type="time"
                    value={formData.openingEnd}
                    onChange={(e) => setFormData({ ...formData, openingEnd: e.target.value })}
                    className="input-elegant"
                  />
                </div>
              </div>
            </Card>

            <Button type="submit" variant="gradient" size="lg" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </form>
        </SubscriptionGate>
      </div>
    </AdminLayout>
  );
}
