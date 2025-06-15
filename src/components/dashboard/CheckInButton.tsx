
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Clock, LogIn, LogOut, Coffee, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CheckInButton = () => {
  const [currentStatus, setCurrentStatus] = useState<'checked-out' | 'checked-in' | 'on-break' | 'on-leave'>('checked-out');
  const { toast } = useToast();

  const handleStatusChange = (status: typeof currentStatus, label: string) => {
    setCurrentStatus(status);
    toast({
      title: `Status Updated`,
      description: `You are now ${label.toLowerCase()}`,
    });
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'checked-in':
        return 'bg-green-500 hover:bg-green-600';
      case 'on-break':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'on-leave':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getCurrentLabel = () => {
    switch (currentStatus) {
      case 'checked-in':
        return 'Checked In';
      case 'on-break':
        return 'On Break';
      case 'on-leave':
        return 'On Leave';
      default:
        return 'Checked Out';
    }
  };

  const getCurrentIcon = () => {
    switch (currentStatus) {
      case 'checked-in':
        return <LogIn className="h-4 w-4" />;
      case 'on-break':
        return <Coffee className="h-4 w-4" />;
      case 'on-leave':
        return <Calendar className="h-4 w-4" />;
      default:
        return <LogOut className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={`${getStatusColor()} text-white`}>
          {getCurrentIcon()}
          <span className="ml-2">{getCurrentLabel()}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleStatusChange('checked-in', 'Checked In')}
          className="cursor-pointer"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('checked-out', 'Checked Out')}
          className="cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Check Out
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('on-break', 'On Break')}
          className="cursor-pointer"
        >
          <Coffee className="h-4 w-4 mr-2" />
          Break
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('on-leave', 'On Leave')}
          className="cursor-pointer"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
