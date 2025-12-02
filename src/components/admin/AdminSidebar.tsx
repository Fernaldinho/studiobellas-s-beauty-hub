import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Crown,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalon } from '@/contexts/SalonContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Scissors, label: 'Serviços', path: '/admin/services' },
  { icon: Users, label: 'Profissionais', path: '/admin/professionals' },
  { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Clientes', path: '/admin/clients' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { subscription, settings } = useSalon();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm text-foreground truncate">
                {settings.name}
              </h1>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Subscription Badge */}
      {!collapsed && (
        <div className="p-4">
          <div className={cn(
            "rounded-xl p-3 text-center text-sm",
            subscription.isActive 
              ? "gradient-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {subscription.isActive ? (
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano PRO Ativo</span>
              </div>
            ) : (
              <span>Plano Inativo</span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "gradient-primary text-primary-foreground shadow-soft" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {!collapsed && <span>Voltar ao Site</span>}
        </Link>
      </div>
    </aside>
  );
}
