import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Error from './pages/error';
import Home from './pages/home';
import EventDetail from './pages/home/EventDetail';
import Court from './pages/court';
import CourtDetail from './pages/court/CourtDetail';
import HoldEvent from './pages/home/HoldEvent';
import UserInfo from './pages/user/info';
import User from './pages/user';
import ProtectedRoutes from './components/ProtectedRoutes';
import Approval from './pages/approval';
import Layout from './Layout';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        element: <ProtectedRoutes />,
        children: [
          {
            path: '/holdevent',
            element: <HoldEvent />,
          },
          {
            path: '/approval',
            element: <Approval />,
          },
          {
            path: '/user',
            element: <User />,
          },
        ],
      },
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/eventdetail/:eventId',
        element: <EventDetail />,
      },
      {
        path: '/court',
        element: <Court />,
      },
      {
        path: '/courtdetail',
        element: <CourtDetail />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/info',
        element: <UserInfo />,
      },
    ],
  },
]);

export default router;
