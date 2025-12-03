import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImageFormat } from '@/types/salon';
import { cn } from '@/lib/utils';
import { Upload, X, Square, RectangleHorizontal, Circle } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  currentUrl: string;
  format: ImageFormat;
  onUrlChange: (url: string) => void;
  onFormatChange: (format: ImageFormat) => void;
}

const formatOptions: { id: ImageFormat; label: string; icon: React.ReactNode; aspectClass: string }[] = [
  { id: 'square', label: 'Quadrado', icon: <Square className="w-4 h-4" />, aspectClass: 'aspect-square' },
  { id: 'rectangular', label: 'Retangular', icon: <RectangleHorizontal className="w-4 h-4" />, aspectClass: 'aspect-video' },
  { id: 'circular', label: 'Circular', icon: <Circle className="w-4 h-4" />, aspectClass: 'aspect-square rounded-full' },
];

export function ImageUploader({ label, currentUrl, format, onUrlChange, onFormatChange }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onUrlChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentFormatOption = formatOptions.find(f => f.id === format) || formatOptions[0];

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <div className="flex gap-2 mb-3">
        {formatOptions.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant={format === option.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFormatChange(option.id)}
            className={cn(
              'flex items-center gap-2',
              format === option.id && 'gradient-primary'
            )}
          >
            {option.icon}
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex items-start gap-4">
        <div 
          className={cn(
            'relative w-32 h-32 bg-muted border-2 border-dashed border-border rounded-lg overflow-hidden flex items-center justify-center',
            format === 'circular' && 'rounded-full',
            format === 'rectangular' && 'w-48 h-28'
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className={cn(
                  'w-full h-full object-cover',
                  format === 'circular' && 'rounded-full'
                )}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center p-2">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Sem imagem</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Escolher Arquivo
          </Button>
          <p className="text-xs text-muted-foreground">
            Formatos: JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}
