
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PaymentMethodChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white/10 border-0 text-white p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Ingresos por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'white', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: 'white', fontSize: 12 }} 
                stroke="rgba(255,255,255,0.2)"
                tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Importe']}
                contentStyle={{ 
                  backgroundColor: '#22142A', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar 
                dataKey="value" 
                fill="#6EF7FF" 
                radius={[4, 4, 0, 0]}
                name="Importe"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Desglose mejorado */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-xs text-white/70 uppercase tracking-wide mb-1">{item.name}</p>
              <p className="text-xl font-bold text-[#6EF7FF] mb-1">€{item.value.toLocaleString()}</p>
              <p className="text-xs text-white/50">
                {((item.value / total) * 100).toFixed(1)}% del total
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodChart;
