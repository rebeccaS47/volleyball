import SettingsIcon from '@mui/icons-material/Settings';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { SyncLoader } from 'react-spinners';
import styled from 'styled-components';
import { db, storage } from '../../../firebaseConfig.ts';
import EventDetail from '../../components/EventDetail';
import HistoryDetail from '../../components/HistoryDetail.tsx';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import {
  fetchUserData,
  fetchUserHistory,
  listenToEventsForUserCalendar,
} from '../../firebase.ts';
import type { CalendarEvent, Event, History, User } from '../../types.ts';

interface UserProps {}

const User: React.FC<UserProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { user, updateUser } = useUserAuth();
  const localizer = momentLocalizer(moment);
  const [eventDetail, setEventDetail] = useState<Event | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

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

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchUserData(user.id);
        setUserData(data);
        setNewDisplayName(data.name);
        setImgURL(data.imgURL);

        const unsubscribe = listenToEventsForUserCalendar(user.id, setEvents);

        const historyItems = await fetchUserHistory(user.id);
        setHistoryData({ [user.id]: historyItems });

        return unsubscribe;
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生載入錯誤');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      setError(err instanceof Error ? err.message : '上傳時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    try {
      const eventRef = doc(db, 'events', event.eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEventDetail({ id: eventSnap.id, ...eventSnap.data() } as Event);
        setModalIsOpen(true);
      } else {
        throw new Error('沒有找到任何活動');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '抓取資料時發生錯誤');
      return;
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEventDetail(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    let color = '';
    switch (event.state) {
      case 'pending':
        backgroundColor = '#515050ce';
        color = '#FFFFFF';
        break;
      case 'accept':
        backgroundColor = 'rgba(255, 191, 0)';
        color = '#000000';
        break;
      case 'decline':
        backgroundColor = 'rgba(0, 129, 204)';
        color = '#FFFFFF';
        break;
      default:
        backgroundColor = '#FFFFFF';
    }
    return {
      style: {
        backgroundColor,
        opacity: 0.8,
        color: color,
      },
    };
  };

  if (loading) {
    return (
      <LoadingContainer>
        <SyncLoader
          margin={10}
          size={20}
          speedMultiplier={0.8}
          color="var(--color-secondary)"
        />
      </LoadingContainer>
    );
  }
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <div>
      <UserProfileContainer>
        <ProfileImage src={imgURL} alt="User profile" />
        {isEditing ? (
          <EditContainer>
            <StyledInput
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <ButtonContainer>
              <StyledButton onClick={handleUpdate}>儲存 </StyledButton>
              <StyledButton
                onClick={() => {
                  setIsEditing(false);
                  setNewImgFile(null);
                  setNewDisplayName(userData.name);
                  setImgURL(userData.imgURL);
                }}
              >
                取消
              </StyledButton>
            </ButtonContainer>
          </EditContainer>
        ) : (
          <>
            <UserInfoContainer>
              <UserName>{userData.name}</UserName>
              {user && (
                <HistoryDetail userHistory={historyData[user.id] || []} />
              )}
            </UserInfoContainer>
            <SettingsIcon
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsEditing(true)}
            />
          </>
        )}
      </UserProfileContainer>
      <Container>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          step={15}
          timeslots={4}
        />
      </Container>
      {eventDetail && (
        <EventDetail
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          event={eventDetail}
          hasApplyBtn={false}
        />
      )}
    </div>
  );
};

export default User;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.9);
`;

const Container = styled.div`
  overflow: auto;
  height: 500px;
  margin: 0 auto;
  padding: 20px 0;
  z-index: 0;
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.img`
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin: 20px;
`;

const EditContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const StyledInput = styled.input`
  margin-bottom: 10px;
  border-radius: 15px;
  width: fit-content;
  padding: 5px 10px;
`;

const FileInput = styled.input`
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledButton = styled.button`
  padding: 5px 10px;
  border-radius: 15px;
`;

const UserInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserName = styled.h1`
  margin-right: 10px;
  margin-bottom: 5px;
`;
