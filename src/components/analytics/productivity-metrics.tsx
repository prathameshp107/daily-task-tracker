import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Calendar, Zap, CalendarCheck, CalendarX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ProductivityMetrics({
  totalTasks,
  totalApprovedHours,
  totalWorkingDays,
  totalWorkingHours,
  totalLeaves,
  productivity,
  month,
  year,
}: {
  totalTasks: number;
  totalApprovedHours: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  totalLeaves: number;
  productivity: number;
  month: string;
  year: number;
}) {
  // Calculate working days in the current month
  const currentDate = new Date();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const workingDaysInMonth = Array.from({ length: daysInMonth })
    .map((_, i) => new Date(year, currentDate.getMonth(), i + 1))
    .filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

  // Calculate final day work (working days - leaves)
  const finalDayWork = (totalWorkingHours / 8) - totalLeaves;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Productivity Overview - {month} {year}</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Total tasks completed this month
            </p>
          </CardContent>
        </Card>

        {/* Total Approved Hours Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApprovedHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total approved working hours
            </p>
          </CardContent>
        </Card>

        {/* Total Working Days Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkingDays}</div>
            <p className="text-xs text-muted-foreground">
              Total working days (including weekends)
            </p>
          </CardContent>
        </Card>

        {/* Total Working Hours Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkingHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total hours worked this month
            </p>
          </CardContent>
        </Card>

        {/* Total Leaves Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaves Taken</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaves} days</div>
            <p className="text-xs text-muted-foreground">
              Total leaves taken this month
            </p>
          </CardContent>
        </Card>

        {/* Productivity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(productivity * 100)}%
            </div>
            <div className="mt-2">
              <Progress value={productivity * 100} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {finalDayWork.toFixed(1)} work days / {workingDaysInMonth} working days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
