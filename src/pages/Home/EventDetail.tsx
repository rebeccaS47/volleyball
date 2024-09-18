import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import type { Event } from '../../types';
import { useUserAuth } from '../../context/userAuthContext.tsx';

interface EventDetailProps {}

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const fetchEvent = useCallback(async () => {
    if (eventId) {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ ...docSnap.data(), id: docSnap.id } as Event);
        } else {
          console.log('沒有該document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      } finally {
        setLoading(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleApply = async () => {
    console.log('eventDetail', { event });
    if (!user) {
      alert('請先登入');
      navigate('/login');
      return;
    }
    if (event?.playerList.includes(user?.uid)) {
      alert('你已是隊員');
      return;
    }
    if (event?.applicationList.includes(user?.uid)) {
      alert('你已申請過');
      return;
    }
    if (event?.id) {
      try {
        const docRef = doc(db, 'events', event.id);
        await updateDoc(docRef, {
          applicationList: arrayUnion(user.uid),
        });
        alert('成功申請');
        fetchEvent();
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>EventDetail</h1>
      {event ? (
        <div>
          <p>場地:{event.court.name}</p>
          <p>
            地址:{event.court.city}
            {event.court.address}
          </p>
          <p>
            時間:{event.date}
            {'  '}
            {event.startTime}~{event.endTime}
          </p>
          <p>網高:{event.netHeight}</p>
          <p>友善程度:{event.friendlinessLevel}</p>
          <p>分級:{event.level}</p>
          <p>室內室外:{event.court.isInDoor ? '室內' : '室外'}</p>
          <p>有無冷氣:{event.isAC ? '有' : '沒有'}</p>
          <p>
            價格:
            {Math.round(
              event.totalCost / (event.findNum + event.playerList.length)
            )}
          </p>
          <p>隊員名單:{event.playerList}</p>
          <p>剩餘名額:{event.findNum - (event.playerList.length + 1)}</p>
        </div>
      ) : (
        <p>沒有這個活動</p>
      )}
      <button onClick={handleApply}>申請加入</button>
    </div>
  );
};

export default EventDetail;
