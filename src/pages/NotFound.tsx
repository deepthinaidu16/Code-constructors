
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-lg">
          <FileSearch className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-6xl font-bold mb-4 gradient-heading">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! It seems like the page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
