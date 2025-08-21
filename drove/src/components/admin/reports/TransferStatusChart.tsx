
import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TransferStatusChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const CHART_COLORS = ['#6EF7FF', '#FF6B6B', '#FFD166', '#06D6A0'];

const TransferStatusChart: React.FC<TransferStatusChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white/10 border-0 text-white p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Estado de Traslados</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Vista móvil optimizada */}
        <div className="block md:hidden">
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} traslados`, name]}
                  contentStyle={{ 
                    backgroundColor: '#22142A', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Lista móvil - 2 columnas */}
          <div className="grid grid-cols-2 gap-2">
            {data.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  ></div>
                  <span className="text-lg font-bold text-white">{item.value}</span>
                </div>
                <p className="text-xs text-white/70 leading-tight">{item.name}</p>
                <p className="text-xs text-white/50 mt-1">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vista escritorio */}
        <div className="hidden md:block">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} traslados`, name]}
                  contentStyle={{ 
                    backgroundColor: '#22142A', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Lista detallada escritorio */}
          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  ></div>
                  <span className="text-sm text-white">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/50">
                    {((item.value / total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferStatusChart;
