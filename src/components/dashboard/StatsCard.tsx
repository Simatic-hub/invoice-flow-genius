
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  onClick,
}: StatsCardProps) => {
  return (
    <Card 
      className={cn("overflow-hidden card-hover", onClick && "hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  "text-xs font-medium",
                  trend === 'up' && "text-green-500 dark:text-green-400",
                  trend === 'down' && "text-red-500 dark:text-red-400",
                  trend === 'neutral' && "text-gray-500 dark:text-gray-400"
                )}>
                  {trend === 'up' && '↑'}
                  {trend === 'down' && '↓'}
                  {trend === 'neutral' && '→'} {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full transition-transform duration-300 hover:scale-110">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
