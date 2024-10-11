import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Error from './pages/Error';
import Home from './pages/Home';
import Court from './pages/Court';
import CourtDetail from './pages/Court/CourtDetail';
import HoldEvent from './pages/Home/HoldEvent';
import UserInfo from './pages/User/info';
import User from './pages/User';
import ProtectedRoutes from './components/ProtectedRoutes';
import Approval from './pages/Approval';
import Layout from './Layout';
import Feedback from './pages/Feedback';
import Chat from './pages/Chat';

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
          {
            path: '/feedback',
            element: <Feedback />,
          },
          {
            path: '/chat',
            element: <Chat />,
          },
        ],
      },
      {
        path: '/',
        element: <Home />,
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
