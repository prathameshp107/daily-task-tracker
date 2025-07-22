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
  TooltipProps,
  BarChart,
  Bar,
  ComposedChart
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
  totalTasks: number;
  totalHours: number;
  leaves: number;
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
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg min-w-[200px]">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Productivity: </span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{(data.productivity * 100).toFixed(1)}%</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Work Days: </span>
            <span className="font-medium">{data.workDays.toFixed(1)} / {data.workingDays}</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total Tasks: </span>
            <span className="font-medium">{data.totalTasks}</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Total Hours: </span>
            <span className="font-medium">{data.totalHours}h</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-600 dark:text-gray-300">Leaves Taken: </span>
            <span className="font-medium">{data.leaves} days</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ProductivityTrends({ data }: ProductivityTrendsProps) {
  // If no data provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No productivity data available. Complete some tasks to see trends.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Productivity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your productivity percentage over the last 6 months
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 1]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  name="Productivity %"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                  activeDot={{ r: 7, stroke: '#2563eb', strokeWidth: 2, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tasks and Hours Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks & Hours Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly task count and total hours worked
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ProductivityData;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Tasks: </span>
                              <span className="font-medium text-green-600">{data.totalTasks}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Hours: </span>
                              <span className="font-medium text-blue-600">{data.totalHours}h</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Leaves: </span>
                              <span className="font-medium text-red-600">{data.leaves} days</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="totalTasks" 
                  name="Tasks" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="totalHours" 
                  name="Hours" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="leaves" 
                  name="Leaves" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#ef4444' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Work Days Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Work Days Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparison of actual work days vs available working days
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ProductivityData;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Available Days: </span>
                              <span className="font-medium text-blue-600">{data.workingDays}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Worked Days: </span>
                              <span className="font-medium text-green-600">{data.workDays.toFixed(1)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Efficiency: </span>
                              <span className="font-medium text-purple-600">{((data.workDays / data.workingDays) * 100).toFixed(1)}%</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="workingDays" 
                  name="Available Days" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="workDays" 
                  name="Worked Days" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
