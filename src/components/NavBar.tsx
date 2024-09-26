import {useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';
interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;
  const { user, logOut } = useUserAuth();

  const handleLogout = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await logOut();
    } catch (error) {
      console.log('Error : ', error);
    }
  };
  return (
    <div
      style={navbarStyles.container}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
    {/* <nav style={navStyle.navbar(isOpen)}>
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
    </nav> */}
    <nav style={navbarStyles.navbar(isOpen)}>
        <Link to="/" style={{...navbarStyles.link, ...(isActive('/') ? navbarStyles.activeLink : {})}}>
          Home
        </Link>
        <Link to="/holdevent" style={{...navbarStyles.link, ...(isActive('/holdevent') ? navbarStyles.activeLink : {})}}>
        Hold Event
        </Link>
        <Link to="/approval" style={{...navbarStyles.link, ...(isActive('/approval') ? navbarStyles.activeLink : {})}}>
          Approval
        </Link>
        <Link to="/feedback" style={{...navbarStyles.link, ...(isActive('/feedback') ? navbarStyles.activeLink : {})}}>
          Feedback
        </Link>
        <Link to="/user" style={{...navbarStyles.link, ...(isActive('/user') ? navbarStyles.activeLink : {})}}>
          User
        </Link>
        <Link to="/chat" style={{...navbarStyles.link, ...(isActive('/chat') ? navbarStyles.activeLink : {})}}>
          Chat
        </Link>
        {user ? <button onClick={handleLogout} style={navbarStyles.btn}>Logout</button>:<Link to="/login" style={navbarStyles.btn}>Login</Link>}
        {/* <button onClick={handleLogout} style={navbarStyles.btn}>
          Logout
        </button> */}
      </nav>
    </div>
  );
};

export default NavBar;

// const navStyle: React.CSSProperties = {
//   backgroundColor: '#f3f2e8',
//   color: 'black',
//   width: '280px',
//   height: '100vh',
//   position: 'fixed',
//   left: 0,
//   top: 0,
//   display: 'flex',
//   flexDirection: 'column',
//   padding: '20px 0',
// };

// const linkStyle: React.CSSProperties = {
//   color: 'black',
//   textDecoration: 'none',
//   padding: '15px 25px',
//   fontSize: '18px',
//   transition: 'background-color 0.3s',
// };

// const activeLinkStyle: React.CSSProperties = {
//   ...linkStyle,
//   color: 'white',
//   backgroundColor: '#838181',
// };

// const logoutStyle: React.CSSProperties = {
//   ...linkStyle,
//   marginTop: 'auto',
//   backgroundColor: '#cfcdbb',
//   textAlign: 'center',
//   cursor: 'pointer',
// };

const navbarStyles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '20px',
    height: '100vh',
    zIndex: 1000,
  },
  navbar: (isOpen: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: isOpen ? 0 : '-270px', // 隱藏時留下 20px 用於觸發
    width: '300px',
    height: '100vh',
    color: 'black',
    backgroundColor: '#f3f2e8',
    transition: 'left 0.3s ease-in-out',
    zIndex: 1000,
    boxShadow: isOpen ? '2px 0 5px rgba(0,0,0,0.3)' : 'none',
  }),
  link: {
    display: 'block',
    color: 'black',
    padding: '15px 25px',
    textDecoration: 'none',
    fontSize: '18px',
    transition: 'background-color 0.3s',
  } as const,
  activeLink: {
    color: 'white',
    backgroundColor: '#838181',
  } as const,
  btn: {
    display: 'block',
    width: '100%',
    padding: '15px 25px',
    backgroundColor: '#cfcdbb',
    color: 'white',
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: 'none',
    fontSize: '18px',
    marginTop: '500px',
  } as const,
};