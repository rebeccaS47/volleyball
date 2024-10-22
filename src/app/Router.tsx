import { createBrowserRouter } from 'react-router-dom';
import RedirectIfLoggedIn from './RedirectIfLoggedIn';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import HoldEvent from '../pages/Home/HoldEvent';
import User from '../pages/User';
import ProtectedRoutes from '../components/ProtectedRoutes';
import Approval from '../pages/Approval';
import Layout from './Layout';
import Feedback from '../pages/Feedback';
import Chat from '../pages/Chat';

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
            <Login />
          </RedirectIfLoggedIn>
        ),
      },
      {
        path: '/signup',
        element: (
          <RedirectIfLoggedIn>
            <Signup />
          </RedirectIfLoggedIn>
        ),
      },
    ],
  },
]);

export default router;
