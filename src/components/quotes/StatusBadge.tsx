
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, X } from 'lucide-react';

interface StatusBadgeProps {
  status: 'accepted' | 'pending' | 'rejected' | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div className={cn(
      "flex items-center",
      status === 'accepted' && "text-green-600",
      status === 'pending' && "text-yellow-600",
      status === 'rejected' && "text-red-600"
    )}>
      {status === 'accepted' && <CheckCircle2 className="mr-2 h-4 w-4" />}
      {status === 'pending' && <Clock className="mr-2 h-4 w-4" />}
      {status === 'rejected' && <X className="mr-2 h-4 w-4" />}
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default StatusBadge;
