import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Event, User } from '../../types';
import { CitySelector } from '../../components/CitySelector';
import { useCityCourtContext } from '../../context/useCityCourtContext';
import { findUserById } from '../../firebase';

interface EventProps {}

interface FilterState {
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  level: string;
}

const Event: React.FC<EventProps> = () => {
  const { user } = useUserAuth();
  const { cities } = useCityCourtContext();
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<Event[]>([]);
  const [filteredEventList, setFilteredEventList] = useState<Event[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    city: '',
    date: '',
    startTime: '',
    endTime: '',
    level: '',
  });
  const [userData, setUserData] = useState<User | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterState((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getEventList = useCallback(async () => {
    try {
      const eventCollectionRef = collection(db, 'events');
      const now = Timestamp.now();
      const q = query(
        eventCollectionRef,
        where('startTimeStamp', '>=', now),
        orderBy('date', 'asc'),
        orderBy('startTimeStamp', 'asc')
      );
      const data = await getDocs(q);
      // const data = await getDocs(eventCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Event[];
      setEventList(filteredData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const filterEvents = useCallback(async () => {
    const filteredList = eventList.filter((event) => {
      return (
        (!filterState.city || event.court.city === filterState.city) &&
        (!filterState.date || event.date === filterState.date) &&
        (!filterState.startTime || event.startTime >= filterState.startTime) &&
        (!filterState.endTime || event.endTime <= filterState.endTime) &&
        (!filterState.level || event.level === filterState.level) 
      );
    });
    setFilteredEventList(filteredList);
  }, [filterState, eventList]);

  const fetchUserData = useCallback(async () => {
    if (user) {
      const data = await findUserById(user.uid);
      setUserData(data);
    } else {
      setUserData(null);
    }
  }, [user]);

  useEffect(() => {
    getEventList();
    fetchUserData();
  }, [getEventList, fetchUserData]);

  useEffect(() => {
    filterEvents();
  }, [filterState, eventList, filterEvents]);

  return (
    <div>
      <h1>Hi, {userData === null ? 'there' : userData.name}</h1>
      <div style={{ display: 'flex' }}>
        <CitySelector
          cities={cities}
          selectedCity={filterState.city}
          onChange={handleInputChange}
        />
        <div>
          <label>日期</label>
          <input
            type="date"
            name="date"
            value={filterState.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>時間</label>
          <input
            type="time"
            name="startTime"
            value={filterState.startTime}
            onChange={handleInputChange}
            required
          />
          <span> ~ </span>
          <input
            type="time"
            name="endTime"
            value={filterState.endTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>分級</label>
          <select
            name="level"
            value={filterState.level}
            onChange={handleInputChange}
          >
            <option value="">請選擇分級</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
      </div>
      <br />
      <br />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {filteredEventList.map((event) => (
          <div
            data-eventid={event.id}
            key={event.id}
            onClick={() => navigate(`/eventdetail/${event.id}`)}
            style={{
              border: '1px solid black',
              padding: '10px',
              width: '350px',
              margin: '10px',
            }}
          >
            <p>
              {event.date} {event.startTime}~{event.endTime}
              {event.level}
            </p>
            <p>場地:{event.court.name}</p>
            <p>
              地址:{event.court.city}
              {event.court.address}
            </p>
            <p>
              價格/人:
              {Math.round(event.totalCost / event.findNum)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Event;
