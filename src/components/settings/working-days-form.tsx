'use client';

import { useState, useEffect } from 'react';
import { format, getDaysInMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';
import { DateRange } from 'react-day-picker';

const workingDaysSchema = z.object({
  month: z.string().min(1, 'Select a month'),
  workingRange: z.object({ from: z.date().optional(), to: z.date().optional() }),
  workHours: z.object({
    start: z.string().min(1, 'Required'),
    end: z.string().min(1, 'Required'),
  }),
  timezone: z.string().min(1, 'Required'),
  totalWorkingDays: z.number().min(0, 'Total working days'),
});

type WorkingDaysFormValues = z.infer<typeof workingDaysSchema>;

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

export function WorkingDaysForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);

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
    // In a real app, you might fetch this from an API
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

    // Load saved settings
    const savedSettings = localStorage.getItem('workingDaysSettingsByMonth');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const month = MONTHS[new Date().getMonth()];
        if (parsed[month]) {
          form.reset(parsed[month]);
        }
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, [form]);

  const onSubmit = (data: WorkingDaysFormValues) => {
    setIsLoading(true);
    // Save per month
    setTimeout(() => {
      const saved = localStorage.getItem('workingDaysSettingsByMonth');
      let allSettings = {};
      if (saved) {
        allSettings = JSON.parse(saved);
      }
      allSettings[data.month] = data;
      localStorage.setItem('workingDaysSettingsByMonth', JSON.stringify(allSettings));
      setIsLoading(false);
      toast({
        title: 'Settings saved',
        description: `Your working days for ${data.month} have been updated.`,
      });
    }, 1000);
  };

  // Calendar grid logic
  const selectedMonth = form.watch('month');
  const year = new Date().getFullYear();
  const monthIndex = MONTHS.indexOf(selectedMonth);

  // Calculate all days in the selected month
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
  const workingDays = allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  const totalWorkingDays = workingDays.length;

  // Fetch leave days for the selected month from localStorage (same as LeaveManagement)
  let totalLeaveDays = 0;
  try {
    const savedLeaves = localStorage.getItem('leaveManagement');
    if (savedLeaves) {
      const parsedLeaves = JSON.parse(savedLeaves);
      const leavesForMonth = parsedLeaves.filter((leave: any) => {
        const leaveStart = new Date(leave.startDate);
        return leaveStart.getMonth() === monthIndex && leaveStart.getFullYear() === year;
      });
      totalLeaveDays = leavesForMonth.reduce((sum: number, leave: any) => sum + leave.days, 0);
    }
  } catch (e) {
    totalLeaveDays = 0;
  }

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
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
