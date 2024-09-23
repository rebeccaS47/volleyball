import { Link, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';
interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = () => {
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;
  const { logOut } = useUserAuth();

  const handleLogout = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await logOut();
    } catch (error) {
      console.log('Error : ', error);
    }
  };
  return (
    <nav style={navStyle}>
      <Link to="/" style={isActive('/') ? activeLinkStyle : linkStyle}>
        Home
      </Link>
      <Link
        to="/holdevent"
        style={isActive('/holdevent') ? activeLinkStyle : linkStyle}
      >
        Hold Event
      </Link>
      <Link
        to="/approval"
        style={isActive('/approval') ? activeLinkStyle : linkStyle}
      >
        Approval
      </Link>
      <Link
        to="/feedback"
        style={isActive('/feedback') ? activeLinkStyle : linkStyle}
      >
        Feedback
      </Link>
      <Link to="/user" style={isActive('/user') ? activeLinkStyle : linkStyle}>
        User
      </Link>
      <div style={logoutStyle} onClick={handleLogout}>
        Logout
      </div>
    </nav>
  );
};

export default NavBar;

const navStyle: React.CSSProperties = {
  backgroundColor: '#f3f2e8',
  color: 'black',
  width: '280px',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
};

const linkStyle: React.CSSProperties = {
  color: 'black',
  textDecoration: 'none',
  padding: '15px 25px',
  fontSize: '18px',
  transition: 'background-color 0.3s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: 'white',
  backgroundColor: '#838181',
};

const logoutStyle: React.CSSProperties = {
  ...linkStyle,
  marginTop: 'auto',
  backgroundColor: '#cfcdbb',
  textAlign: 'center',
  cursor: 'pointer',
};
