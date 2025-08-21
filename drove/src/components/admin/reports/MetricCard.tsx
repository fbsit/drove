
import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconColor?: string;
}

const MetricCard = ({ icon: Icon, title, value, iconColor = "#6EF7FF" }: MetricCardProps) => {
  return (
    <Card className="bg-white/10 border-0 text-white">
      <CardHeader className="pb-2">
        <CardDescription className="text-white/70 flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
          {title}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default MetricCard;
