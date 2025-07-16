import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "./task-list";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: Omit<Task, 'completed'>) => void;
  onCancel?: () => void;
}

type TaskFormData = Omit<Task, 'completed'> & {
  taskId: string;
};

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const taskTypes = [
    'Development', 'Testing', 'Deployment', 'Design', 'Documentation', 'Meeting'
  ];

  const [formData, setFormData] = useState<TaskFormData>({
    taskId: '',
    taskType: '',
    description: '',
    totalHours: 0,
    approvedHours: 0,
    project: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    note: '',
    status: 'todo',
  });

  // Update form data when task prop changes (for edit mode)
  useEffect(() => {
    if (task) {
      setFormData({
        taskId: task.taskId,
        taskType: task.taskType,
        description: task.description,
        totalHours: task.totalHours,
        approvedHours: task.approvedHours,
        project: task.project,
        month: task.month,
        note: task.note || '',
        status: task.status,
      });
    } else {
      // Reset form for new task
      setFormData({
        taskId: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        taskType: '',
        description: '',
        totalHours: 0,
        approvedHours: 0,
        project: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        note: '',
        status: 'todo',
      });
    }
  }, [task]);

  const handleInputChange = (field: keyof Omit<TaskFormData, 'status' | 'month' | 'taskType'>) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === 'totalHours' || field === 'approvedHours'
        ? Number(e.target.value) || 0
        : e.target.value;
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

  const handleSelectChange = (field: 'status' | 'month' | 'taskType', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'status' ? value as Task['status'] : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalHours: Number(formData.totalHours) || 0,
      approvedHours: Number(formData.approvedHours) || 0,
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {task ? 'Edit Task' : 'Add New Task'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskId">Task ID</Label>
              <Input
                id="taskId"
                value={formData.taskId}
                onChange={handleInputChange('taskId')}
                placeholder="e.g., TASK-123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => handleSelectChange('taskType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleSelectChange('month', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalHours">Total Hours</Label>
              <Input
                id="totalHours"
                type="number"
                value={formData.totalHours}
                onChange={handleInputChange('totalHours')}
                min="0"
                step="0.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvedHours">Approved Hours</Label>
              <Input
                id="approvedHours"
                type="number"
                value={formData.approvedHours}
                onChange={handleInputChange('approvedHours')}
                min="0"
                step="0.5"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={handleInputChange('project')}
                placeholder="Project name"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Task description"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Notes (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={handleInputChange('note')}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {task ? 'Update Task' : 'Add Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
