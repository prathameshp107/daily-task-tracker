'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const leaveTypes = [
  { id: 'vacation', name: 'Vacation' },
  { id: 'sick', name: 'Sick Leave' },
  { id: 'personal', name: 'Personal Day' },
  { id: 'holiday', name: 'Public Holiday' },
  { id: 'other', name: 'Other' },
];

const leaveSchema = z.object({
  leaveType: z.string().min(1, 'Required'),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveEntry {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  days: number;
}

export function LeaveManagement() {
  const [date, setDate] = useState<Date>(new Date());
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: '',
      startDate: new Date(),
      endDate: new Date(),
      notes: '',
    },
  });

  useEffect(() => {
    // Load saved leaves
    const savedLeaves = localStorage.getItem('leaveManagement');
    if (savedLeaves) {
      try {
        const parsedLeaves = JSON.parse(savedLeaves);
        // Convert string dates back to Date objects
        const processedLeaves: LeaveEntry[] = parsedLeaves.map((leave: Record<string, unknown>) => ({
          ...leave,
          startDate: new Date(leave.startDate as string),
          endDate: new Date(leave.endDate as string),
        }));
        setLeaves(processedLeaves);
      } catch (e) {
        console.error('Failed to parse saved leaves', e);
      }
    }
  }, []);

  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.filter(day => !isWeekend(day)).length;
  };

  const onSubmit = (data: LeaveFormValues) => {
    const newLeave: LeaveEntry = {
      id: Date.now().toString(),
      ...data,
      days: calculateWorkingDays(data.startDate, data.endDate),
    };

    const updatedLeaves = [...leaves, newLeave];
    setLeaves(updatedLeaves);
    saveLeaves(updatedLeaves);
    form.reset();
    toast('Leave added: Your leave has been scheduled.');
  };

  const deleteLeave = (id: string) => {
    const updatedLeaves = leaves.filter(leave => leave.id !== id);
    setLeaves(updatedLeaves);
    saveLeaves(updatedLeaves);
    toast('Leave deleted: The leave entry has been removed.');
  };

  const saveLeaves = (leavesToSave: LeaveEntry[]) => {
    localStorage.setItem('leaveManagement', JSON.stringify(leavesToSave));
  };

  const getLeavesByMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return leaves.filter(leave => 
      (leave.startDate >= start && leave.startDate <= end) ||
      (leave.endDate >= start && leave.endDate <= end)
    );
  };

  const currentMonthLeaves = getLeavesByMonth(date);
  const leaveBalance = {
    total: 20, // This would typically come from user settings
    used: leaves.reduce((sum, leave) => sum + leave.days, 0),
    remaining: 20 - leaves.reduce((sum, leave) => sum + leave.days, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leave Days</h3>
          <p className="text-2xl font-bold">{leaveBalance.total} days</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Used</h3>
          <p className="text-2xl font-bold text-amber-600">{leaveBalance.used} days</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
          <p className="text-2xl font-bold text-green-600">{leaveBalance.remaining} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Schedule Leave</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selectedDate={field.value}
                            onDateChange={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selectedDate={field.value}
                            onDateChange={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add any additional information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Leave
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Scheduled Leaves</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(prev => addMonths(prev, -1))}
              >
                &larr;
              </Button>
              <div className="px-4 py-2 text-sm font-medium">
                {format(date, 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(prev => addMonths(prev, 1))}
              >
                &rarr;
              </Button>
            </div>
          </div>

          {currentMonthLeaves.length > 0 ? (
            <div className="space-y-2">
              {currentMonthLeaves.map((leave) => (
                <div key={leave.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {leaveTypes.find(t => t.id === leave.leaveType)?.name || leave.leaveType}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                      {' '}({leave.days} {leave.days === 1 ? 'day' : 'days'})
                    </div>
                    {leave.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{leave.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => deleteLeave(leave.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground">No leaves scheduled for {format(date, 'MMMM yyyy')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
