import { useState, useEffect } from 'react';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { db } from '../../../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  where,
  QuerySnapshot,
  DocumentData,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  Calendar,
  momentLocalizer,
  Event as CalendarEvent,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { TeamParticipation, Event } from '../../types';

interface UserProps {}

interface CalendarEventExtended extends CalendarEvent {
  eventId: string;
  state: string;
  userId: string;
}

const User: React.FC<UserProps> = () => {
  const [events, setEvents] = useState<CalendarEventExtended[]>([]);
  const { user } = useUserAuth();
  const localizer = momentLocalizer(moment);

  const [eventDeatil, setEventDeatil] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const eventsRef = collection(db, 'teamParticipation');
      const q = query(eventsRef, where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const fetchedEvents: CalendarEventExtended[] = snapshot.docs.map(
            (doc) => {
              const data = doc.data() as TeamParticipation;
              console.log('data', data);
              const start = moment(
                `${data.date} ${data.startTime}`,
                'YYYY-MM-DD HH:mm'
              ).toDate();
              const end = moment(
                `${data.date} ${data.endTime}`,
                'YYYY-MM-DD HH:mm'
              ).toDate();
              return {
                title: data.courtName,
                start,
                end,
                eventId: data.eventId,
                state: data.state as 'pending' | 'accept' | 'decline',
                userId: data.userId,
              };
            }
          );
          setEvents(fetchedEvents);
          console.log('日曆事件:', fetchedEvents);
        }
      );

      return () => unsubscribe();
    };

    fetchEvents();
  }, [user]);

  const handleSelectEvent = async (event: CalendarEventExtended) => {
    // const eventRef = doc(db, 'events', event.eventId);
    // console.log(eventRef);
    try {
      const eventRef = doc(db, 'events', event.eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setEventDeatil({ id: eventSnap.id, ...eventSnap.data() } as Event);
      } else {
        console.log('Event not found');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    if (!eventDeatil) return;
    alert(`
      id: ${eventDeatil.id};
      場地: ${eventDeatil.court};
      發起人: ${eventDeatil.createUserId};
      日期: ${eventDeatil.date};
      起始時間: ${eventDeatil.startTime};
      結束時間: ${eventDeatil.endTime};
      網高: ${eventDeatil.netHeight};
      友善程度: ${eventDeatil.friendlinessLevel};
      能力: ${eventDeatil.level};
      是否有冷氣: ${eventDeatil.isAC ? '有' : '沒有'};
      尋找人數: ${eventDeatil.findNum};
      總費用: ${eventDeatil.totalCost};
      備註: ${eventDeatil.notes};
      隊員名單: ${eventDeatil.playerList};
      活動狀態: ${eventDeatil.eventStatus};
      活動建立日期: ${eventDeatil.createdEventAt};
      申請人名單: ${eventDeatil.applicationList};
    `);
  };

  const eventStyleGetter = (event: CalendarEventExtended) => {
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
        // borderRadius: '5px',
        opacity: 0.8,
        color: '#FFFFFF',
        // border: 'none',
        // display: 'block'
      },
    };
  };

  const containerStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '500px',
    width: '80%',
    margin: '0 auto',
    padding: '20px 0',
  };

  // const calendarStyle: React.CSSProperties = {
  //   height: '100%',
  //   width: '100%',
  // };

  return (
    <div>
      <h1>User</h1>
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
