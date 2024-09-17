import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';

interface EventProps {}

const Event: React.FC<EventProps> = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.log('Error : ', error);
    }
  };
  return (
    <div>
      <h1>Event</h1>
      <h2>Hi, {user ? user.displayName : 'there'}</h2>
      <button onClick={handleLogout}>Logout</button>
      <br /><br />
      <button onClick={() => navigate('/holdevent')}>發起活動</button>
    </div>
  );
};

export default Event;
