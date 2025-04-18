import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, User, Lock, Database, Bell } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Auth & Profile Management System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure JWT-based authentication with advanced profile management
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </Button>
          </div>
        </header>
        
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <User className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">User Authentication</h3>
              <p className="text-muted-foreground">
                Secure login, registration, and password reset flows with JWT-based authentication.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <Lock className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">HTTP-Only Cookies</h3>
              <p className="text-muted-foreground">
                Tokens stored in HTTP-only cookies for enhanced security against XSS attacks.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Optimized Database</h3>
              <p className="text-muted-foreground">
                MongoDB queries optimized with proper indexing for fast data retrieval.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-md border border-border">
              <Bell className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Notifications</h3>
              <p className="text-muted-foreground">
                Intuitive notifications powered by Toastify for enhanced user experience.
              </p>
            </div>
          </div>
        </section>
        
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">About This System</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This Auth & Profile Management System is built using the MERN stack (MongoDB, Express.js, React, and Node.js), 
            featuring JWT-based authentication with HTTP-only cookies, and a responsive UI designed with modern best practices.
            It includes comprehensive profile management capabilities and follows security best practices.
          </p>
        </section>
        
        <footer className="text-center text-muted-foreground border-t border-border pt-8">
          <p>© 2025 Auth & Profile Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
