import { AdminLayout } from '@/components/admin/AdminLayout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSalon } from '@/contexts/SalonContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Reports() {
  const { appointments, services, professionals } = useSalon();

  // Calculate monthly revenue
  const monthlyRevenue = appointments
    .filter(apt => apt.status !== 'cancelled')
    .reduce((acc, apt) => {
      const date = new Date(apt.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const service = services.find(s => s.id === apt.serviceId);
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += service?.price || 0;
      return acc;
    }, {} as Record<string, number>);

  const revenueChartData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => {
      const [year, m] = month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return {
        month: monthNames[parseInt(m) - 1],
        revenue,
      };
    });

  // Appointments by professional
  const appointmentsByProfessional = professionals.map(prof => {
    const count = appointments.filter(apt => apt.professionalId === prof.id && apt.status !== 'cancelled').length;
    return {
      name: prof.name,
      value: count,
    };
  });

  const COLORS = ['hsl(280, 60%, 50%)', 'hsl(340, 80%, 65%)', 'hsl(280, 55%, 62%)', 'hsl(340, 70%, 55%)'];

  const totalRevenue = Object.values(monthlyRevenue).reduce((a, b) => a + b, 0);
  const totalAppointments = appointments.filter(apt => apt.status !== 'cancelled').length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Cliente', 'Serviço', 'Profissional', 'Valor', 'Status'];
    const rows = appointments.map(apt => {
      const service = services.find(s => s.id === apt.serviceId);
      const professional = professionals.find(p => p.id === apt.professionalId);
      return [
        apt.date,
        apt.clientName,
        service?.name || '',
        professional?.name || '',
        service?.price || 0,
        apt.status,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-agendamentos.csv';
    a.click();

    toast({ title: 'Relatório exportado com sucesso!' });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Análise de desempenho do salão</p>
          </div>
          <Button variant="gradient" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        <SubscriptionGate fallbackMessage="Assine o plano PRO para acessar relatórios completos.">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faturamento Total</p>
                  <p className="text-2xl font-semibold text-foreground">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Agendamentos</p>
                  <p className="text-2xl font-semibold text-foreground">{totalAppointments}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-0 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profissionais</p>
                  <p className="text-2xl font-semibold text-foreground">{professionals.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-card">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Faturamento Mensal
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => formatPrice(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(280, 60%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-card">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Atendimentos por Profissional
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentsByProfessional}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {appointmentsByProfessional.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {appointmentsByProfessional.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium text-foreground">({entry.value})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </SubscriptionGate>
      </div>
    </AdminLayout>
  );
}
