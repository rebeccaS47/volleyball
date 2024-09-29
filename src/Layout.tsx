import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import UserStatus from './components/UserStatus';

const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <NavBar />
      <UserStatus />
      {/* marginLeft: '280px', */}
      <main style={{  flexGrow: 1, padding: '50px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
