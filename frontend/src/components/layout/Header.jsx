import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Shield } from 'lucide-react';
import '../../styles/components/header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <Shield className="logo-icon" />
          VoteSecure
        </Link>

        <nav className="nav">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="user-menu">
          <div className="user-info">
            <User className="user-icon" />
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;