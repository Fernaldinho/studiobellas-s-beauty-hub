import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Crown,
  ChevronLeft,
  Menu,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Scissors, label: 'Serviços', path: '/admin/services' },
  { icon: Users, label: 'Profissionais', path: '/admin/professionals' },
  { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Clientes', path: '/admin/clients' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

function SidebarContent({ collapsed, onCollapse, onLogout, subscription, profile }: {
  collapsed: boolean;
  onCollapse: () => void;
  onLogout: () => void;
  subscription: { subscribed: boolean; plan: string };
  profile: { name: string | null } | null;
}) {
  const location = useLocation();

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-sm text-foreground truncate">
                {profile?.name || 'Meu Salão'}
              </h1>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className="shrink-0 hidden lg:flex"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Subscription Badge */}
      {!collapsed && (
        <div className="p-4">
          <div className={cn(
            "rounded-xl p-3 text-center text-sm",
            subscription.subscribed && subscription.plan === 'PRO'
              ? "gradient-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {subscription.subscribed && subscription.plan === 'PRO' ? (
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano PRO Ativo</span>
              </div>
            ) : (
              <span>Plano Gratuito</span>
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
      <div className="p-4 border-t border-border space-y-2">
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
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const { subscription, signOut, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-md">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full flex flex-col">
              <SidebarContent
                collapsed={false}
                onCollapse={() => setMobileOpen(false)}
                onLogout={handleLogout}
                subscription={subscription}
                profile={profile}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex h-screen bg-card border-r border-border flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          onLogout={handleLogout}
          subscription={subscription}
          profile={profile}
        />
      </aside>
    </>
  );
}
