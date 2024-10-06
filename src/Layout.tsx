import { Outlet } from 'react-router-dom';
import Header from './components/Header';

const Layout: React.FC = () => {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
