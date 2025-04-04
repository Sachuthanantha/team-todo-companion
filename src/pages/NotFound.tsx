
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this is a project route that was not found
  const isProjectRoute = location.pathname.startsWith('/project/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Page not found</p>
        
        {isProjectRoute && (
          <p className="text-gray-600 mb-6">
            The project you're looking for might have been removed or doesn't exist.
          </p>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">Return to Dashboard</Link>
          </Button>
          
          {isProjectRoute && (
            <Button variant="outline" asChild className="w-full">
              <Link to="/projects">View All Projects</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
