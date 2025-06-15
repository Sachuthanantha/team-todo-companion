
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project, Task, TeamMember, useApp } from '@/context/AppContext';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ProjectHeader } from '@/components/projects/details/ProjectHeader';
import { ProjectStats } from '@/components/projects/details/ProjectStats';
import { ProjectInfoCards } from '@/components/projects/details/ProjectInfoCards';
import { ProjectTasksSection } from '@/components/projects/details/ProjectTasksSection';
import { ProjectFilesSection } from '@/components/projects/files/ProjectFilesSection';
import { ProjectNotesSection } from '@/components/projects/notes/ProjectNotesSection';

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
      <ProjectHeader 
        project={project}
        onEditProject={handleEditProject}
        onDeleteProject={() => setDeleteDialogOpen(true)}
      />
      
      <ProjectStats 
        projectTasks={projectTasks}
        teamMembersOnProject={teamMembersOnProject}
      />
      
      <ProjectInfoCards 
        project={project}
        teamMembersOnProject={teamMembersOnProject}
        projectClients={projectClients}
      />
      
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files & Documentation</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-6">
          <ProjectTasksSection 
            filteredTasks={filteredTasks}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        </TabsContent>
        
        <TabsContent value="files" className="space-y-6">
          <ProjectFilesSection projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <ProjectNotesSection projectId={project.id} />
        </TabsContent>
      </Tabs>
      
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
