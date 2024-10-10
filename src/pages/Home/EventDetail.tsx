import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebaseConfig';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { Event } from '../../types';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { handleUserNameList } from '../../firebase';

interface EventDetailProps {}

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerNames, setPlayerNames] = useState<string>('');

  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const eventData = { ...docSnap.data(), id: docSnap.id } as Event;
          setEvent(eventData);
          setLoading(false);

          if (eventData.playerList) {
            handleUserNameList(eventData.playerList).then((namesArray) => {
              setPlayerNames(
                namesArray.filter((name) => name !== '').join(', ')
              );
            });
          }
        } else {
          console.log('沒有該document!');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching document: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  const handleApply = async () => {
    console.log('eventDetail', { event });
    if (!user) {
      alert('請先登入');
      navigate('/login');
      return;
    }
    if (!event) return;
    if (event.playerList.includes(user?.id)) {
      alert('你已是隊員');
      return;
    }
    if (event.applicationList.includes(user?.id)) {
      alert('你已申請過');
      return;
    }
    if (event.id) {
      try {
        const docRef = doc(db, 'events', event.id);
        await updateDoc(docRef, {
          applicationList: arrayUnion(user.id),
        });

        const participationRef = doc(
          db,
          'teamParticipation',
          `${event.id}_${user.id}`
        );
        await setDoc(participationRef, {
          eventId: event.id,
          userId: user.id,
          courtName: event.court.name,
          state: 'pending',
          date: event.date,
          startTimeStamp: event.startTimeStamp,
          endTimeStamp: event.endTimeStamp,
        });

        alert('成功申請');
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
            {event.startTimeStamp.toDate().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            ~
            {event.endTimeStamp.toDate().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p>網高:{event.netHeight}</p>
          <p>友善程度:{event.friendlinessLevel}</p>
          <p>分級:{event.level}</p>
          <p>室內室外:{event.court.isInDoor ? '室內' : '室外'}</p>
          <p>有無冷氣:{event.isAC ? '有' : '沒有'}</p>
          <p>
            價格:
            {/* {Math.round(
              event.totalCost / (event.findNum + event.playerList.length)
            )} */}
            {Math.round(event.totalCost / event.findNum)}
          </p>
          <p>隊員名單:{playerNames}</p>
          <p>剩餘名額:{event.findNum - event.playerList.length}</p>
        </div>
      ) : (
        <p>沒有這個活動</p>
      )}
      <button onClick={handleApply}>申請加入</button>
    </div>
  );
};

export default EventDetail;
