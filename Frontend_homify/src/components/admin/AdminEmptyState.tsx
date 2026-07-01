import { LucideIcon } from 'lucide-react';

export function AdminEmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="text-center py-16 bg-homify-card rounded-modal border border-homify-border p-8">
      <Icon className="w-12 h-12 text-homify-muted/40 mx-auto mb-4" />
      <p className="font-medium text-homify-text">{text}</p>
    </div>
  );
}
