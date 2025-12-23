import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Store, Clock, Phone, Palette, Image, Crown, Eye, Copy, CreditCard, User, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ThemeSelector, getThemeCSS } from '@/components/admin/ThemeSelector';
import { ImageFormat, ThemePreset } from '@/types/salon';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { profile, subscription, createCheckout, openCustomerPortal, checkSubscription } = useAuth();
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [salonLink, setSalonLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsapp: '',
    openingStart: '09:00',
    openingEnd: '18:00',
    bannerUrl: '',
    logoUrl: '',
    logoFormat: 'circular' as ImageFormat,
    bannerFormat: 'rectangular' as ImageFormat,
    themePreset: 'purple' as ThemePreset,
  });

  useEffect(() => {
    // Check for subscription success/cancel from URL
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast({ title: 'Assinatura ativada com sucesso!' });
      checkSubscription();
    } else if (subscriptionStatus === 'canceled') {
      toast({ title: 'Checkout cancelado', variant: 'destructive' });
    }
  }, [searchParams]);

  useEffect(() => {
    loadSettings();
  }, [profile]);

  const loadSettings = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('salon_settings')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        whatsapp: data.whatsapp || '',
        openingStart: data.opening_hours_start || '09:00',
        openingEnd: data.opening_hours_end || '18:00',
        bannerUrl: data.banner_url || '',
        logoUrl: data.logo_url || '',
        logoFormat: (data.logo_format as ImageFormat) || 'circular',
        bannerFormat: (data.banner_format as ImageFormat) || 'rectangular',
        themePreset: (data.theme_preset as ThemePreset) || 'purple',
      });
    }
  };

  const handleThemeChange = (theme: ThemePreset) => {
    setFormData({ ...formData, themePreset: theme });
    const themeCSS = getThemeCSS(theme);
    Object.entries(themeCSS).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const { error } = await supabase
      .from('salon_settings')
      .upsert({
        user_id: profile.id,
        name: formData.name,
        description: formData.description,
        whatsapp: formData.whatsapp,
        opening_hours_start: formData.openingStart,
        opening_hours_end: formData.openingEnd,
        banner_url: formData.bannerUrl,
        logo_url: formData.logoUrl,
        logo_format: formData.logoFormat,
        banner_format: formData.bannerFormat,
        theme_preset: formData.themePreset,
      }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Configurações salvas com sucesso!' });
    }
  };

  const handleGetSalonLink = async () => {
    setIsLoadingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-salon-link');
      if (error) throw error;
      if (data?.link) {
        setSalonLink(data.link);
      }
    } catch (err) {
      toast({ title: 'Erro ao obter link', variant: 'destructive' });
    } finally {
      setIsLoadingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (salonLink) {
      navigator.clipboard.writeText(salonLink);
      toast({ title: 'Link copiado!' });
    }
  };

  const handleViewSalon = () => {
    if (salonLink) {
      window.open(salonLink, '_blank');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu salão e assinatura</p>
        </div>

        {/* Account & Subscription Card */}
        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Minha Conta
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <p className="font-medium text-foreground">{profile?.name || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium text-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-muted-foreground">Status do Plano</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {subscription.subscribed && subscription.plan === 'PRO' ? (
                      <>
                        <Crown className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-primary">PRO Ativo</span>
                      </>
                    ) : (
                      <span className="font-medium text-muted-foreground">Gratuito</span>
                    )}
                  </div>
                </div>
                {subscription.subscribed && subscription.plan === 'PRO' ? (
                  <Button variant="outline" onClick={openCustomerPortal}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <Button variant="hero" onClick={createCheckout}>
                    <Crown className="w-4 h-4 mr-2" />
                    Ativar PRO – R$ 45,30/mês
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Salon Link Card */}
        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Página do Cliente
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {!salonLink ? (
              <Button onClick={handleGetSalonLink} disabled={isLoadingLink}>
                {isLoadingLink ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Gerar Link
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleViewSalon}>
                  <Eye className="w-4 h-4 mr-2 text-blue-500" />
                  Ver Página
                </Button>
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              </>
            )}
          </div>
        </Card>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para personalizar seu salão.">
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
                <h2 className="font-display font-semibold text-lg text-foreground">Tema Visual</h2>
              </div>
              <ThemeSelector currentTheme={formData.themePreset} onThemeChange={handleThemeChange} />
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground">Contato</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
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
                <h2 className="font-display font-semibold text-lg text-foreground">Horário</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingStart">Abertura</Label>
                  <Input id="openingStart" type="time" value={formData.openingStart} onChange={(e) => setFormData({ ...formData, openingStart: e.target.value })} className="input-elegant" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingEnd">Fechamento</Label>
                  <Input id="openingEnd" type="time" value={formData.openingEnd} onChange={(e) => setFormData({ ...formData, openingEnd: e.target.value })} className="input-elegant" />
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
