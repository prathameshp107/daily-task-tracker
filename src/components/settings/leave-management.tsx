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
  leaveDate: z.date(),
  notes: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveEntry {
  id: string;
  leaveType: string;
  leaveDate: Date;
  notes?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function LeaveManagement() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaveDatePopoverOpen, setLeaveDatePopoverOpen] = useState(false);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: '',
      leaveDate: new Date(),
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
          leaveDate: new Date(leave.leaveDate as string),
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
      leaveType: data.leaveType,
      leaveDate: data.leaveDate,
      notes: data.notes,
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

  const getLeavesByMonth = (monthName: string) => {
    const monthIndex = MONTHS.indexOf(monthName);
    return leaves.filter(leave => {
      return (
        leave.leaveDate.getMonth() === monthIndex &&
        leave.leaveDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const currentMonthLeaves = getLeavesByMonth(selectedMonth);
  const totalLeavesCount = currentMonthLeaves.length;
  const totalLeaveDays = currentMonthLeaves.length;

  const total = 20; // This would typically come from user settings
  const used = leaves.length;
  const remaining = total - used;
  const leaveBalance = {
    total,
    used,
    remaining,
  };

  return (
    <div className="space-y-6">
      {/* Month Dropdown at the top for all sections */}
      <div className="flex gap-2 items-center mb-4">
        <span className="text-sm font-medium">Month:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {MONTHS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Available Days</h3>
          <p className="text-2xl font-bold">{leaveBalance.total} days</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Leave Days</h3>
          <p className="text-2xl font-bold text-amber-600">{leaveBalance.used} days</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
          <p className="text-2xl font-bold text-green-600">{leaveBalance.remaining} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Add Leave</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="new-password">
              {/* Leave type dropdown at the top of the form */}
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
              <FormField
                control={form.control}
                name="leaveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Leave Date</FormLabel>
                    <Popover open={leaveDatePopoverOpen} onOpenChange={setLeaveDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={val => {
                            field.onChange(val);
                            if (val) setLeaveDatePopoverOpen(false);
                          }}
                          initialFocus
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                Add Leave
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h3 className="text-lg font-medium">Add Leaves</h3>
          </div>
          <div className="flex gap-4 mb-2">
            <div className="p-2 bg-blue-50 rounded text-blue-700 text-xs font-medium">
              Total Leaves: {totalLeavesCount}
            </div>
            <div className="p-2 bg-green-50 rounded text-green-700 text-xs font-medium">
              Total Days on Leave: {totalLeaveDays}
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
                      {format(new Date(leave.leaveDate), 'PPP')}
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
              <p className="text-muted-foreground">No leaves scheduled for {selectedMonth} {date.getFullYear()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
