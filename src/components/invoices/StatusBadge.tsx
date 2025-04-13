
import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div className={cn(
      "flex items-center",
      status === 'paid' && "text-green-600",
      status === 'pending' && "text-yellow-600",
      status === 'overdue' && "text-red-600",
      status === 'cancelled' && "text-gray-600"
    )}>
      {status === 'paid' && <CheckCircle2 className="mr-2 h-4 w-4" />}
      {status === 'pending' && <Clock className="mr-2 h-4 w-4" />}
      {status === 'overdue' && <AlertCircle className="mr-2 h-4 w-4" />}
      {status === 'cancelled' && <XCircle className="mr-2 h-4 w-4" />}
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default StatusBadge;
