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
import ProtectedRoutes from './components/ProtectedRoutes';
import Approval from './pages/approval';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/holdevent',
        element: <HoldEvent />,
        errorElement: <Error />,
      },
      {
        path: '/approval',
        element: <Approval />,
        errorElement: <Error />,
      },
    ],
  },
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: '/eventdetail/:eventId',
    element: <EventDetail />,
    errorElement: <Error />,
  },
  {
    path: '/court',
    element: <Court />,
    errorElement: <Error />,
  },
  {
    path: '/courtdetail',
    element: <CourtDetail />,
    errorElement: <Error />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <Error />,
  },
  {
    path: '/info',
    element: <UserInfo />,
    errorElement: <Error />,
  },
]);

export default router;
