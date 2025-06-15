
import { useState } from 'react';
import { Task } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { 
  CheckSquare, 
  Plus, 
  Search,
  ClipboardList,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface ProjectTasksSectionProps {
  filteredTasks: Task[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const ProjectTasksSection = ({
  filteredTasks,
  searchTerm,
  setSearchTerm,
  onAddTask,
  onEditTask
}: ProjectTasksSectionProps) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-primary" />
          Tasks
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'board' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('board')}
            >
              Board View
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
      
      {/* Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="To Do"
            status="todo"
            emptyMessage="No tasks to do yet"
            icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            filteredTasks={filteredTasks}
          />
          <TaskColumn
            title="In Progress"
            status="inProcess"
            emptyMessage="No tasks in progress"
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            filteredTasks={filteredTasks}
          />
          <TaskColumn
            title="Completed"
            status="completed"
            emptyMessage="No completed tasks yet"
            icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            filteredTasks={filteredTasks}
          />
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <>
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={onEditTask} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-secondary/50 rounded-lg">
              {searchTerm ? (
                <>
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No tasks found matching "{searchTerm}"</p>
                  <Button onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No tasks in this project yet</p>
                  <Button onClick={onAddTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Task
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
