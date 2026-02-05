import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  sticky?: boolean;
}

export function PageHeader({ title, actions, sticky = false }: PageHeaderProps) {
  if (sticky) {
    return (
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b -mx-4 px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{title}</h1>
          {actions && <div className="flex gap-2 items-center">{actions}</div>}
        </div>
      </header>
    );
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  );
}
