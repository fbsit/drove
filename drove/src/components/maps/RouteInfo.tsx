
import React from 'react';
import { Clock, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RouteInfoProps {
  distance: string;
  duration: string;
}

const RouteInfo = ({ distance, duration }: RouteInfoProps) => {
  return (
    <Card className="bg-white/10 border-[#6EF7FF]/20 mt-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-[#6EF7FF]" />
            <span>{distance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#6EF7FF]" />
            <span>{duration}</span>
            <span className="text-xs text-white/60">*tiempo estimado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteInfo;
