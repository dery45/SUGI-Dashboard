import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, desc, action }) => {
  const IconComponent = Icon || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-border/20 mb-4">
        <IconComponent className="w-10 h-10 text-muted/40" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title || 'Tidak ada data'}</h3>
      <p className="text-sm text-muted-foreground/60 max-w-sm">{desc || ''}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
