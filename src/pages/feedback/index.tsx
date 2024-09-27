import { useState, useEffect } from 'react';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { db } from '../../../firebaseConfig.ts';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { findUserById } from '../../firebase.ts';
import type { Event, Feedback } from '../../types.ts';

interface FeedbackProps {}

interface UserName {
  id: string;
  name: string;
}
const Feedback: React.FC<FeedbackProps> = () => {
  const [closedEvents, setClosedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserAuth();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    eventId: '',
    userId: '',
    courtName: '',
    friendlinessLevel: '',
    level: '',
    grade: 0,
    note: '',
    date: '',
    startTimeStamp: null,
    endTimeStamp: null,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [userNames, setUserNames] = useState<UserName[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);

  useEffect(() => {
    const fetchClosedEvents = async () => {
      if (!user) return;
      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('createUserId', '==', user.uid),
          where('endTimeStamp', '<', Timestamp.now())
        );

        const querySnapshot = await getDocs(q);
        const fetchedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push({ id: doc.id, ...doc.data() } as Event);
        });

        setClosedEvents(fetchedEvents);
        console.log('closedEvent: ', fetchedEvents);
      } catch (err) {
        setError(
          'Error fetching events: ' +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClosedEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      fetchUserNames(selectedEvent.playerList);
    }
  }, [selectedEvent]);

  const fetchUserNames = async (userIds: string[]) => {
    setLoadingNames(true);
    try {
      const names = await Promise.all(
        userIds.map(async (id) => {
          const user = await findUserById(id);
          return { id, name: user ? user.name : 'Unknown User' };
        })
      );
      setUserNames(names);
      console.log('搜到名字', names);
    } catch (error) {
      console.error('Error fetching user names:', error);
    } finally {
      setLoadingNames(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedPlayer(null);
    resetFeedbackForm(event);
  };

  const handlePlayerClick = (player: string) => {
    setSelectedPlayer(player);
    if (selectedEvent) {
      resetFeedbackForm(selectedEvent, player);
    }
  };

  const resetFeedbackForm = async (event: Event, player: string = '') => {
    const initialFeedback = {
      eventId: event.id,
      userId: player,
      courtName: event.court.name,
      friendlinessLevel: '',
      level: '',
      grade: 0,
      note: '',
      date: event.date,
      startTimeStamp: event.startTimeStamp,
      endTimeStamp: event.endTimeStamp,
    };

    setFeedback(initialFeedback);
    setFormErrors({});

    if (player) {
      try {
        const docRef = doc(db, 'history', `${event.id}_${player}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeedback({
            ...initialFeedback,
            friendlinessLevel: data.friendlinessLevel || '',
            level: data.level || '',
            grade: data.grade || 0,
            note: data.note || '',
          });
        }
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    }
  };

  const handleFeedbackChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({
      ...prev,
      [name]: name === 'grade' ? (value === '' ? 0 : parseInt(value)) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!feedback.friendlinessLevel)
      errors.friendlinessLevel = '請選擇友善程度';
    if (!feedback.level) errors.level = '請選擇分級';
    if (feedback.grade === 0) errors.grade = '請輸入分數';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitFeedback = async () => {
    if (!validateForm()) return;
    if (!selectedEvent || !selectedPlayer) return;

    try {
      const feedbackDocRef = doc(
        db,
        'history',
        `${selectedEvent.id}_${selectedPlayer}`
      );
      await setDoc(feedbackDocRef, { ...feedback });

      alert('回饋提交成功！');
      setSelectedPlayer(null);
      if (selectedEvent) {
        resetFeedbackForm(selectedEvent);
      }
    } catch (error) {
      console.error('提交回饋時出錯:', error);
      alert('提交回饋失敗。請再試一次。');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Feedback</h1>
      {closedEvents.length === 0 ? (
        <p>沒有找到已結束的活動。</p>
      ) : (
        <ul>
          {closedEvents.map((event) => (
            <li key={event.id} onClick={() => handleEventClick(event)}>
              {event.date}&nbsp;&nbsp;&nbsp;{' '}
              {event.startTimeStamp.toDate().toLocaleTimeString()}~
              {event.endTimeStamp.toDate().toLocaleTimeString()}
              &nbsp;&nbsp;&nbsp;&nbsp;{event.court.name}
            </li>
          ))}
        </ul>
      )}

      {selectedEvent && (
        <div>
          <h3>{selectedEvent.date} 活動的參與者名單</h3>
          {loadingNames ? (
            <p>正在加載用戶名稱...</p>
          ) : (
            <ul>
              {userNames
                //.filter((item) => item.id !== user?.uid)
                .map((user) => (
                  <li key={user.id} onClick={() => handlePlayerClick(user.id)}>
                    {user.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      {selectedPlayer && (
        <div>
          <h3>回饋表單</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitFeedback();
            }}
            style={{
              opacity: user?.uid === selectedPlayer ? 0.5 : 1,
              pointerEvents: user?.uid === selectedPlayer ? 'none' : 'auto',
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <label>友善程度：</label>
              <select
                name="friendlinessLevel"
                value={feedback.friendlinessLevel}
                onChange={handleFeedbackChange}
              >
                <option value="">請選擇友善程度</option>
                {['A', 'B', 'C', 'D', 'E'].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {formErrors.friendlinessLevel && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {' '}
                  {formErrors.friendlinessLevel}
                </span>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>技術水平：</label>
              <select
                name="level"
                value={feedback.level}
                onChange={handleFeedbackChange}
              >
                <option value="">請選擇技術水平</option>
                {['A', 'B', 'C', 'D', 'E'].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {formErrors.level && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {' '}
                  {formErrors.level}
                </span>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>分數：</label>
              <input
                type="number"
                name="grade"
                value={feedback.grade}
                onChange={handleFeedbackChange}
                min="0"
                max="100"
              />
              {formErrors.grade && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {' '}
                  {formErrors.grade}
                </span>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>備註：</label>
              <textarea
                name="note"
                value={feedback.note}
                onChange={handleFeedbackChange}
              />
            </div>
            <button type="submit">提交回饋</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Feedback;
