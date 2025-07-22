'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { leaveService } from '@/lib/services';

const leaveTypes = [
  { id: 'vacation', label: 'Vacation Leave', color: 'bg-blue-500' },
  { id: 'sick', label: 'Sick Leave', color: 'bg-red-500' },
  { id: 'personal', label: 'Personal Leave', color: 'bg-green-500' },
  { id: 'other', label: 'Other', color: 'bg-gray-500' },
];

const leaveSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Leave type is required'),
  notes: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveEntry {
  _id: string;
  date: string;
  type: string;
  notes?: string;
}

export function LeaveManagement() {
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLeave, setCurrentLeave] = useState<LeaveEntry | null>(null);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: '',
      notes: '',
    },
  });

  // Load leaves from service
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        const leavesData = await leaveService.getLeaves();
        setLeaves(leavesData);
      } catch (err) {
        console.error('Failed to load leaves:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load leaves';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  const onSubmit = async (data: LeaveFormValues) => {
    try {
      setSubmitting(true); // Set submitting state during form submission
      if (isEditing && currentLeave) {
        // Update existing leave
        const updatedLeave = await leaveService.updateLeave(currentLeave._id, {
          date: data.date,
          type: data.type,
          notes: data.notes || '',
        });
        
        setLeaves(prevLeaves => prevLeaves.map(leave => 
          leave._id === currentLeave._id ? updatedLeave : leave
        ));
        
        toast({
          title: 'Success',
          description: 'Leave updated successfully.',
        });
      } else {
        // Add new leave
        const newLeave = await leaveService.createLeave({
          date: data.date,
          type: data.type as any,
          notes: data.notes || '',
        });

        setLeaves(prevLeaves => [...prevLeaves, newLeave]);
        toast({
          title: 'Success',
          description: 'Leave added successfully.',
        });
      }
      
      // Reset form and close it
      form.reset({
        date: new Date().toISOString().split('T')[0],
        type: '',
        notes: '',
      });
      setIsFormOpen(false);
      setIsEditing(false);
      setCurrentLeave(null);
    } catch (err) {
      console.error('Failed to save leave:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save leave. Please try again.',
      });
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  const editLeave = (leave: LeaveEntry) => {
    form.reset({
      date: leave.date,
      type: leave.type,
      notes: leave.notes || '',
    });
    setCurrentLeave(leave);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const deleteLeave = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave entry?')) {
      try {
        await leaveService.deleteLeave(id);
        setLeaves(leaves.filter(leave => leave._id !== id));
        toast({
          title: 'Success',
          description: 'Leave deleted successfully.',
        });
      } catch (err) {
        console.error('Failed to delete leave:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete leave. Please try again.',
        });
      }
    }
  };

  const getTypeBadge = (typeId: string) => {
    const type = leaveTypes.find(t => t.id === typeId);
      return (
      <Badge 
        className={`${type?.color || 'bg-gray-500'} text-white`}
        variant="outline"
      >
        {type?.label || typeId}
      </Badge>
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading leaves...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Leaves
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Leave Management</h2>

      <Button onClick={() => {
        setIsFormOpen(true);
        setIsEditing(false);
        setCurrentLeave(null);
        form.reset({
          date: new Date().toISOString().split('T')[0],
          type: '',
          notes: '',
        });
      }} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add New Leave
      </Button>

      {isFormOpen && (
        <div className="mt-6 p-6 border rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">{isEditing ? 'Edit Leave' : 'Add New Leave'}</h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register('date')}
                  className="mt-1"
                />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
                )}
      </div>
        <div>
                <Label htmlFor="type" className="text-sm font-medium">Leave Type</Label>
                <Select 
                  onValueChange={(value) => {
                    form.setValue('type', value);
                    form.clearErrors('type'); // Clear any existing errors
                  }} 
                  value={form.watch('type')}
                  name="type"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                className="mt-1"
              />
            </div>

              <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isEditing ? 'Update Leave' : 'Add Leave'}
              </Button>
            </form>
        </div>
      )}

      <h3 className="text-lg font-medium mb-4">Leave History</h3>
      {leaves.length === 0 ? (
        <p>No leave history yet. Add your first leave!</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave._id}>
                <TableCell>{new Date(leave.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {getTypeBadge(leave.type)}
                </TableCell>
                <TableCell>{leave.notes || 'No notes'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editLeave(leave)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLeave(leave._id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>
          )}
    </div>
  );
}
