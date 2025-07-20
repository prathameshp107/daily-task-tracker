import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Task, Project } from "@/lib/types";
import { projectService } from "@/lib/services";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface TaskFormData {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note: string;
  status: 'todo' | 'in-progress' | 'done';
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
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

  // Load projects from service
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load projects:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
        });
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [toast]);

  // Update form data when task prop changes (for edit mode)
  useEffect(() => {
    if (task) {
      setFormData({
        taskId: task.taskId || task._id || '',
        taskType: task.type || task.taskType || '',
        description: task.description || '',
        totalHours: task.estimatedHours || task.totalHours || 0,
        approvedHours: task.actualHours || task.approvedHours || 0,
        project: task.project || task.projectName || '',
        month: task.month || new Date().toLocaleString('default', { month: 'long' }),
        note: task.note || '',
        status: task.status || 'todo',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.description.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Task description is required.',
        });
        return;
      }

      if (!formData.project) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please select a project.',
        });
        return;
      }

      onSubmit(formData);
    } catch (err) {
      console.error('Failed to submit task:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save task. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const taskTypes = [
    'Development', 'Testing', 'Deployment', 'Design', 'Documentation', 'Meeting'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taskId">Task ID</Label>
          <Input
            id="taskId"
            value={formData.taskId}
            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            placeholder="Enter task ID"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskType">Task Type</Label>
          <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalHours">Total Hours</Label>
          <Input
            id="totalHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.totalHours}
            onChange={(e) => setFormData({ ...formData, totalHours: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="approvedHours">Approved Hours</Label>
          <Input
            id="approvedHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.approvedHours}
            onChange={(e) => setFormData({ ...formData, approvedHours: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'todo' | 'in-progress' | 'done') => setFormData({ ...formData, status: value })}>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select 
            value={formData.project} 
            onValueChange={(value) => setFormData({ ...formData, project: value })}
            disabled={projectsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select project"} />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading projects...
                </div>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project._id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Add any additional notes"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || projectsLoading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
