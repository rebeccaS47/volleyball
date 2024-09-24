import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';

const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <NavBar />
      {/* marginLeft: '280px', */}
      <main style={{  flexGrow: 1, padding: '50px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
