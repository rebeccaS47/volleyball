import { useState, useEffect } from 'react';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { db, storage } from '../../../firebaseConfig.ts';
import {
  collection,
  onSnapshot,
  query,
  where,
  QuerySnapshot,
  DocumentData,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type {
  TeamParticipation,
  Event,
  User,
  History,
  CalendarEvent,
} from '../../types.ts';
import HistoryDetail from '../../components/HistoryDetail.tsx';

interface UserProps {}

const User: React.FC<UserProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { user, updateUser } = useUserAuth();
  const localizer = momentLocalizer(moment);
  const [eventDeatil, setEventDeatil] = useState<Event | null>(null);

  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newImgFile, setNewImgFile] = useState<File | null>(null);
  const [imgURL, setImgURL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [historyData, setHistoryData] = useState<{
    [key: string]: History[];
  }>({});
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const data = userDoc.data() as User;
          setUserData(data);
          setNewDisplayName(data.name);
          setImgURL(data.imgURL);
        } else {
          throw new Error('User document not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      const eventsRef = collection(db, 'teamParticipation');
      const q = query(eventsRef, where('userId', '==', user.id));
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const fetchedEvents: CalendarEvent[] = snapshot.docs
            .map((doc) => {
              const data = doc.data() as TeamParticipation;
              return {
                title: data.courtName,
                start: new Date(data.startTimeStamp.seconds * 1000),
                end: new Date(data.endTimeStamp.seconds * 1000),
                eventId: data.eventId,
                state: data.state,
                userId: data.userId,
              };
            })
            .filter((event): event is CalendarEvent => event !== null);
          setEvents(fetchedEvents);
        }
      );

      return () => unsubscribe();
    };

    const fetchHistory = async () => {
      if (user) {
        const historyRef = collection(db, 'history');
        const q = query(historyRef, where('userId', '==', user.id));

        try {
          const querySnapshot = await getDocs(q);
          const items: History[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ ...doc.data() } as History);
          });
          setHistoryData({ [user.id]: items });
        } catch (error) {
          console.error('Error fetching history: ', error);
        }
      }
    };

    fetchUserData();
    fetchEvents();
    fetchHistory();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImgFile(e.target.files[0]);
      const localURL = URL.createObjectURL(e.target.files[0]);
      setImgURL(localURL);
    }
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!newImgFile || !user)
      throw new Error('No photo selected or user not logged in');

    const storageRef = ref(storage, `userPhotos/${user.id}`);
    await uploadBytes(storageRef, newImgFile);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) return;

      const updates: { name?: string; imgURL?: string } = {};

      if (newDisplayName !== userData?.name) {
        updates.name = newDisplayName;
      }

      if (newImgFile) {
        const photoURL = await uploadPhoto();
        updates.imgURL = photoURL;
        setImgURL(photoURL);
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', user.id), updates);
        updateUser(updates);
        setUserData((prev) => (prev ? { ...prev, ...updates } : null));
      }

      setIsEditing(false);
      setNewImgFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while updating'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    try {
      console.log('event', event);
      const eventRef = doc(db, 'events', event.eventId);
      const eventSnap = await getDoc(eventRef);
      console.log('snap', eventSnap.data(), 'id: ', eventSnap.id);
      if (eventSnap.exists()) {
        setEventDeatil({ id: eventSnap.id, ...eventSnap.data() } as Event);
      } else {
        throw new Error('Event not found');
      }
    } catch (err) {
      console.error(err);
      return;
    }

    if (!eventDeatil) return;
    // 發起人: ${eventDeatil.createUserId}
    // 隊員名單: ${eventDeatil.playerList}
    // 動建立日期: ${eventDeatil.createdEventAt}
    // 申請人名單: ${eventDeatil.applicationList}
    alert(`
      活動id: ${eventDeatil.id}
      場地: ${eventDeatil.court.name}
      日期: ${eventDeatil.date}
      起始時間: ${eventDeatil.startTime}
      結束時間: ${eventDeatil.endTimeStamp.toDate().toLocaleString()}
      網高: ${eventDeatil.netHeight}
      友善程度: ${eventDeatil.friendlinessLevel}
      能力: ${eventDeatil.level}
      是否有冷氣: ${eventDeatil.isAC ? '有' : '沒有'}
      尋找人數: ${eventDeatil.findNum}
      總費用: ${eventDeatil.totalCost}
      備註: ${eventDeatil.notes}
    `);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    switch (event.state) {
      case 'pending':
        backgroundColor = '#515050ce';
        break;
      case 'accept':
        backgroundColor = '#357835';
        break;
      case 'decline':
        backgroundColor = '#ad6771';
        break;
      default:
        backgroundColor = '#FFFFFF';
    }
    return {
      style: {
        backgroundColor,
        opacity: 0.8,
        color: '#FFFFFF',
      },
    };
  };

  const containerStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '500px',
    // width: '80%',
    margin: '0 auto',
    padding: '20px 0',
  };

  // const calendarStyle: React.CSSProperties = {
  //   height: '100%',
  //   width: '100%',
  // };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={imgURL}
          alt="User profile"
          style={{
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            marginRight: '20px',
          }}
        />
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
            <div>
              <button onClick={handleUpdate} style={{ marginRight: '10px' }}>
                儲存{' '}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewImgFile(null);
                  setNewDisplayName(userData.name);
                  setImgURL(userData.imgURL);
                }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ marginRight: '10px' }}> {userData.name}</h1>
              <button
                style={{ marginRight: '10px' }}
                onClick={() => setIsEditing(true)}
              >
                編輯
              </button>
            </div>
            <div>
              {user && (
                <HistoryDetail userHistory={historyData[user.id] || []} />
              )}
            </div>
          </>
        )}
      </div>
      <div style={containerStyle}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          step={15}
          timeslots={4}
          // style={calendarStyle}
        />
      </div>
    </div>
  );
};

export default User;
