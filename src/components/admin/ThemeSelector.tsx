import { ThemePreset } from '@/types/salon';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
}

const themes: { id: ThemePreset; name: string; gradient: string; colors: string[] }[] = [
  {
    id: 'purple',
    name: 'Roxo Elegante',
    gradient: 'linear-gradient(135deg, #9333ea, #ec4899)',
    colors: ['#9333ea', '#a855f7', '#ec4899'],
  },
  {
    id: 'rose',
    name: 'Rosa Delicado',
    gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    colors: ['#f43f5e', '#fb7185', '#fda4af'],
  },
  {
    id: 'gold',
    name: 'Dourado Luxo',
    gradient: 'linear-gradient(135deg, #ca8a04, #fbbf24)',
    colors: ['#ca8a04', '#eab308', '#fbbf24'],
  },
];

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Escolha um tema visual</p>
      <div className="grid grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105',
              currentTheme === theme.id
                ? 'border-primary shadow-lg'
                : 'border-border hover:border-primary/50'
            )}
          >
            {currentTheme === theme.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div
              className="h-16 rounded-lg mb-3"
              style={{ background: theme.gradient }}
            />
            <p className="text-sm font-medium text-foreground">{theme.name}</p>
            <div className="flex gap-1 mt-2 justify-center">
              {theme.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getThemeCSS(theme: ThemePreset): Record<string, string> {
  const themes = {
    purple: {
      '--primary': '270 70% 50%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '330 80% 60%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(270, 70%, 50%), hsl(330, 80%, 60%))',
    },
    rose: {
      '--primary': '350 80% 55%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '350 70% 70%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(350, 80%, 55%), hsl(350, 70%, 70%))',
    },
    gold: {
      '--primary': '45 90% 40%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '45 90% 55%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(45, 90%, 40%), hsl(45, 90%, 55%))',
    },
  };
  return themes[theme];
}
