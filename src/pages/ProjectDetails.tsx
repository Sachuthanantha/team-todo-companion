
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project, Task, TeamMember, useApp } from '@/context/AppContext';
import { 
  Briefcase, 
  ArrowLeft, 
  Users, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Pencil,
  MoreHorizontal,
  Trash2,
  Search,
  ClipboardList,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProjectDialog } from '@/components/projects/ProjectDialog';

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    tasks, 
    teamMembers, 
    getTeamMembersByIds,
    deleteProject,
    clients
  } = useApp();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [teamMembersOnProject, setTeamMembersOnProject] = useState<TeamMember[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [projectClients, setProjectClients] = useState<any[]>([]);
  
  useEffect(() => {
    if (projectId) {
      // Get project details
      const foundProject = projects.find(p => p.id === projectId);
      setProject(foundProject || null);
      
      if (foundProject) {
        // Get tasks for this project
        const projectTasksList = tasks.filter(task => foundProject.tasks.includes(task.id));
        setProjectTasks(projectTasksList);
        
        // Get unique team members assigned to this project's tasks
        const uniqueTeamMemberIds = Array.from(
          new Set(projectTasksList.flatMap(task => task.assignedTo))
        );
        setTeamMembersOnProject(getTeamMembersByIds(uniqueTeamMemberIds));
        
        // Get clients for this project
        if (foundProject.clients && foundProject.clients.length > 0) {
          const projectClientList = clients.filter(client => 
            foundProject.clients?.includes(client.id)
          );
          setProjectClients(projectClientList);
        } else {
          setProjectClients([]);
        }
      }
    }
  }, [projectId, projects, tasks, clients, getTeamMembersByIds]);
  
  // Filter tasks based on search term
  useEffect(() => {
    if (projectTasks.length > 0) {
      const filtered = projectTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks([]);
    }
  }, [projectTasks, searchTerm]);
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };
  
  const handleEditProject = () => {
    setEditProjectDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (project) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  // Calculate task statistics
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'inProcess');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  const completionPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0;
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-9 w-9">
                <Link to="/projects">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="bg-primary/10 p-2 rounded-md">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">{project.name}</h1>
            </div>
            <p className="text-muted-foreground mt-2 ml-14">
              {project.description}
            </p>
          </div>
          
          <div className="flex items-center gap-3 ml-14 md:ml-0">
            <Button 
              variant="outline" 
              onClick={handleEditProject}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-semibold">{projectTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-semibold">{teamMembersOnProject.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-semibold">{completionPercentage}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="py-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">To Do</span>
              <Badge variant="outline">{projectTasks.filter(task => task.status === 'todo').length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">In Progress</span>
              <Badge variant="outline">{projectTasks.filter(task => task.status === 'inProcess').length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <Badge variant="outline">{projectTasks.filter(task => task.status === 'completed').length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Start Date</div>
              <div className="font-medium">
                {project.startDate 
                  ? format(new Date(project.startDate), 'MMMM d, yyyy') 
                  : 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">End Date</div>
              <div className="font-medium">
                {project.deadline 
                  ? format(new Date(project.deadline), 'MMMM d, yyyy')
                  : 'Not set'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembersOnProject.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teamMembersOnProject.map(member => (
                  <div key={member.id} className="flex items-center p-2 bg-card rounded-lg border">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No team members assigned</div>
            )}
          </CardContent>
        </Card>
        
        {/* Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectClients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {projectClients.map(client => (
                  <div key={client.id} className="flex items-center p-2 bg-card rounded-lg border">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback>
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No clients assigned</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks Section */}
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
              <Button onClick={handleAddTask}>
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
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              filteredTasks={filteredTasks}
            />
            <TaskColumn
              title="In Progress"
              status="inProcess"
              emptyMessage="No tasks in progress"
              icon={<Clock className="h-5 w-5 text-muted-foreground" />}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              filteredTasks={filteredTasks}
            />
            <TaskColumn
              title="Completed"
              status="completed"
              emptyMessage="No completed tasks yet"
              icon={<CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
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
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
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
                    <Button onClick={handleAddTask}>
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
      
      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        initialTask={selectedTask}
        defaultProjectId={project.id}
      />
      
      {/* Edit Project Dialog */}
      <ProjectDialog
        open={editProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
        initialProject={project}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and remove all its task associations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetails;
