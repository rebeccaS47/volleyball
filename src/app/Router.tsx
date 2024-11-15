import { createBrowserRouter } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import ProtectedRoutes from '../components/ProtectedRoutes';
import Approval from '../pages/Approval';
import Chat from '../pages/Chat';
import Feedback from '../pages/Feedback';
import Home from '../pages/Home';
import HoldEvent from '../pages/Home/HoldEvent';
import User from '../pages/User';
import Layout from './Layout';
import RedirectIfLoggedIn from './RedirectIfLoggedIn';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <Home />,
    children: [
      {
        element: <ProtectedRoutes />,
        children: [
          { path: '/holdevent', element: <HoldEvent /> },
          { path: '/approval', element: <Approval /> },
          { path: '/user', element: <User /> },
          { path: '/feedback', element: <Feedback /> },
          { path: '/chat', element: <Chat /> },
        ],
      },
      { path: '/', element: <Home /> },
      {
        path: '/login',
        element: (
          <RedirectIfLoggedIn>
            <AuthCard />
          </RedirectIfLoggedIn>
        ),
      },
    ],
  },
]);

export default router;
