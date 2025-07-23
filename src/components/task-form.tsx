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
  projectId: string; // <-- use projectId instead of project name
  month: string;
  note: string;
  status: 'todo' | 'in-progress' | 'done';
  taskNumber: string;
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
    projectId: '', // <-- use projectId
    month: new Date().toLocaleString('default', { month: 'long' }),
    note: '',
    status: 'todo',
    taskNumber: '',
  });
  const [totalHoursInput, setTotalHoursInput] = useState('0');
  const [approvedHoursInput, setApprovedHoursInput] = useState('0');
  const [error, setError] = useState("");

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
      // Handle different task object structures for project ID
      let projectId = '';
      if ('projectId' in task && task.projectId) {
        projectId = task.projectId;
      } else if ('project' in task) {
        // If project is an object with _id
        if (typeof task.project === 'object' && task.project && '_id' in task.project) {
          projectId = task.project._id;
        } else if (typeof task.project === 'string') {
          // If project is a string, try to find matching project by name
          const matchingProject = projects.find(p => p.name === task.project);
          projectId = matchingProject?._id || '';
        }
      }

      // Handle notes - check multiple possible sources
      let note = '';
      if ('note' in task && task.note) {
        note = task.note;
      } else if ('description' in task && task.description) {
        note = task.description;
      }

      setFormData({
        taskId: task._id || task.id || '', // Use _id or id for taskId
        taskType: task.type || task.taskType || '', // Use type or taskType
        description: task.description || task.title || '',
        totalHours: task.estimatedHours || task.totalHours || 0,
        approvedHours: task.actualHours || task.approvedHours || 0,
        projectId: projectId,
        month: task.month || new Date().toLocaleString('default', { month: 'long' }),
        note: note,
        status: (task.status === 'pending' ? 'todo' : task.status === 'completed' ? 'done' : task.status) as 'todo' | 'in-progress' | 'done',
        taskNumber: task.taskNumber || '',
      });
      setTotalHoursInput(String(task.estimatedHours || task.totalHours || ''));
      setApprovedHoursInput(String(task.actualHours || task.approvedHours || ''));
    } else {
      // Reset form for new task
      setFormData({
        taskId: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        taskType: '',
        description: '',
        totalHours: 0,
        approvedHours: 0,
        projectId: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        note: '',
        status: 'todo',
        taskNumber: '',
      });
      setTotalHoursInput('');
      setApprovedHoursInput('');
    }
  }, [task, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.taskType) {
        setError("Task type is required");
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Task type is required.',
        });
        return;
      }

      if (!formData.description.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Task description is required.',
        });
        return;
      }

      if (!formData.projectId) {
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
    'Development', 'Testing', 'Deployment', 'Design', 'Documentation', 'Meeting', 'Miscellaneous', 'Live RCA'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remove the Task ID input field from the form UI */}
        {/* <div className="space-y-2">
          <Label htmlFor="taskId">Task ID</Label>
          <Input
            id="taskId"
            value={formData.taskId}
            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            placeholder="Enter task ID"
            disabled
          />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="taskNumber">Task Number</Label>
          <Input
            id="taskNumber"
            value={formData.taskNumber}
            onChange={(e) => setFormData({ ...formData, taskNumber: e.target.value })}
            placeholder="Enter task number"
            required
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
          {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
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
            value={totalHoursInput}
            onChange={(e) => {
              setTotalHoursInput(e.target.value);
              setFormData({ ...formData, totalHours: e.target.value === '' ? 0 : parseFloat(e.target.value) });
            }}
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
            value={approvedHoursInput}
            onChange={(e) => {
              setApprovedHoursInput(e.target.value);
              setFormData({ ...formData, approvedHours: e.target.value === '' ? 0 : parseFloat(e.target.value) });
            }}
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
            value={formData.projectId} 
            onValueChange={(value) => setFormData({ ...formData, projectId: value })}
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
                  <SelectItem key={project._id} value={project._id}>
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
        <Button type="submit" disabled={loading || projectsLoading || !formData.taskType}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
