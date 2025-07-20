'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { leaveService } from "@/lib/services";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const workingDaysSchema = z.object({
  month: z.string().min(1, 'Month is required'),
  workingRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
  workHours: z.object({
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
  }),
  timezone: z.string().min(1, 'Timezone is required'),
  totalWorkingDays: z.number().min(1, 'Total working days must be at least 1'),
});

type WorkingDaysFormValues = z.infer<typeof workingDaysSchema>;

export function WorkingDaysForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);

  const form = useForm<WorkingDaysFormValues>({
    resolver: zodResolver(workingDaysSchema),
    defaultValues: {
      month: MONTHS[new Date().getMonth()],
      workingRange: { from: undefined, to: undefined },
      workHours: {
        start: '09:00',
        end: '18:00',
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      totalWorkingDays: 22,
    },
  });

  useEffect(() => {
    // Set timezones
    setTimezones([
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Kolkata',
    ]);

    // Load saved settings from service
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load working days config
        const settings = await leaveService.getWorkingDaysConfig();
        const month = MONTHS[new Date().getMonth()];
        
        // Find settings for current month or use defaults
        const monthSettings = settings[month] || {
          month: month,
          workingRange: { from: undefined, to: undefined },
          workHours: {
            start: '09:00',
            end: '18:00',
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          totalWorkingDays: 22,
        };
        
        form.reset(monthSettings);
        
        // Load leaves for the month
        const leavesData = await leaveService.getLeaves();
        setLeaves(leavesData);
        
      } catch (err) {
        console.error('Failed to load working days settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load working days settings.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [form, toast]);

  const onSubmit = async (data: WorkingDaysFormValues) => {
    try {
      setIsLoading(true);
      
      // Save settings to service
      await leaveService.updateWorkingDaysConfig({
        [data.month]: data
      });
      
      toast({
        title: 'Success',
        description: 'Working days settings saved successfully.',
      });
    } catch (err) {
      console.error('Failed to save working days settings:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save working days settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading working days settings...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Settings
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {error}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Calendar grid logic
  const selectedMonth = form.watch('month');
  const year = new Date().getFullYear();
  const monthIndex = MONTHS.indexOf(selectedMonth);

  // Calculate all days in the selected month
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Calculate working days (excluding weekends)
  let totalWorkingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      totalWorkingDays++;
    }
  }

  // Calculate leave days for the selected month
  const leavesForMonth = leaves.filter((leave: any) => {
    const leaveStart = new Date(leave.date);
    return leaveStart.getMonth() === monthIndex && leaveStart.getFullYear() === year;
  });
  const totalLeaveDays = leavesForMonth.length;

  const finalWorkingDays = totalWorkingDays - totalLeaveDays;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Working Days (Excl. Weekends)</h3>
              <p className="text-2xl font-bold text-blue-700">{totalWorkingDays}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Leave Days in Month</h3>
              <p className="text-2xl font-bold text-amber-600">{totalLeaveDays}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Final Working Days</h3>
              <p className="text-2xl font-bold text-green-600">{finalWorkingDays}</p>
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
