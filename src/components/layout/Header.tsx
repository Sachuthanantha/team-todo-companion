
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

export const Header = () => {
  const quote = "The best way to predict the future is to create it.";
  const { teamMembers, getCurrentUserId } = useApp();
  const currentUserId = getCurrentUserId();
  const currentUser = teamMembers.find(member => member.id === currentUserId);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div>
        <p className="text-sm italic text-muted-foreground">{quote}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={currentUser?.avatar} alt="User avatar" />
            <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {currentUser?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => alert('Sign out clicked')}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
