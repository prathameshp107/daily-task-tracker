"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  TooltipProps
} from 'recharts';
import { 
  ValueType, 
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';

interface ProductivityData {
  month: string;
  productivity: number;
  workingDays: number;
  workDays: number;
}

interface ProductivityTrendsProps {
  data: ProductivityData[];
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: ProductivityData;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProductivityData;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">
          <span className="text-gray-600 dark:text-gray-300">Productivity: </span>
          <span className="font-medium">{(data.productivity * 100).toFixed(1)}%</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600 dark:text-gray-300">Work Days: </span>
          <span className="font-medium">{data.workDays.toFixed(1)} / {data.workingDays}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ProductivityTrends({ data }: ProductivityTrendsProps) {
  // If no data provided, show a message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No productivity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 1]}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                itemStyle={{
                  color: '#1f2937',
                  fontSize: '0.875rem',
                }}
                labelStyle={{
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="productivity"
                name="Productivity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
