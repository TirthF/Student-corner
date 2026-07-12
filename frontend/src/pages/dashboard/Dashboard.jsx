import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error(`Access denied: you don't have permission to access ${location.state.from}.`, { id: 'unauthorized' });
      // Clear the state so the toast doesn't re-fire on re-render
      window.history.replaceState({}, document.title);
    }
  }, []);

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
}
