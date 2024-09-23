import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';

const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <NavBar />
      <main style={{ marginLeft: '280px', flexGrow: 1, padding: '50px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
