import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Event, User, Option, Court, FilterState } from '../../types';
import Select from 'react-select';
import { findUserById } from '../../firebase';

interface EventProps {}

const Event: React.FC<EventProps> = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<Event[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [courts, setCourts] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Option | null>(null);

  const [filteredEventList, setFilteredEventList] = useState<Event[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    city: '',
    court:'',
    date: '',
    startTime: '',
    endTime: '',
    level: '',
  });
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      const courtsRef = collection(db, 'courts');
      const snapshot = await getDocs(courtsRef);
      const allCourts: Court[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Court)
      );

      const uniqueCities = Array.from(
        new Set(allCourts.map((court) => court.city))
      );
      setCities(uniqueCities.map((city) => ({ value: city, label: city })));
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCourts = async () => {
      if (selectedCity) {
        const courtsRef = collection(db, 'courts');
        const snapshot = await getDocs(courtsRef);
        const allCourts: Court[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Court)
        );

        const filteredCourts = allCourts.filter(
          (court) => court.city === selectedCity.value
        );
        setCourts(
          filteredCourts.map((court) => ({
            value: court.id,
            label: court.name,
          }))
        );
      } else {
        setCourts([]);
      }
    };

    fetchCourts();
  }, [selectedCity]);

  const handleCityChange = (selectedOption: Option | null) => {
    setSelectedCity(selectedOption);
    setSelectedCourt(null);
    setFilterState((prevData) => ({
      ...prevData,
      city: selectedOption ? selectedOption.value : '',
      court: '',
    }));
  };

  const handleCourtChange = async (selectedOption: Option | null) => {
    setSelectedCourt(selectedOption);
    if (selectedOption) {
      const courtRef = doc(db, 'courts', selectedOption.value);
      const courtDoc = await getDoc(courtRef);
      if (courtDoc.exists()) {
        const courtData = { id: courtDoc.id, ...courtDoc.data() } as Court;
        setFilterState((prevData) => ({
          ...prevData,
          court: courtData.name,
        }));
      }
    } else {
      setFilterState((prevData) => ({
        ...prevData,
        court: '',
      }));
    }
  };

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
      const endTimeDate = event.endTimeStamp.toDate();
      const hours = endTimeDate.getHours().toString().padStart(2, '0');
      const minutes = endTimeDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      return (
        (!filterState.city || event.court.city === filterState.city) &&
        (!filterState.court || event.court.name === filterState.court) &&
        (!filterState.date || event.date === filterState.date) &&
        (!filterState.startTime || event.startTime >= filterState.startTime) &&
        (!filterState.endTime || formattedTime <= filterState.endTime) &&
        (!filterState.level || event.level === filterState.level)
      );
    });
    setFilteredEventList(filteredList);
  }, [filterState, eventList]);

  const fetchUserData = useCallback(async () => {
    if (user) {
      const data = await findUserById(user.id);
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
      <div>
          <div>
            <label>城市</label>
            <Select
              value={selectedCity}
              onChange={handleCityChange}
              options={cities}
              isClearable
              placeholder="請選擇城市"
              // styles={{
              //   container: (provided) => ({
              //     ...provided,
              //   }),
              // }}
            />
          </div>
          <div>
            <label>球場</label>
            <Select
              value={selectedCourt}
              onChange={handleCourtChange}
              options={courts}
              isDisabled={!selectedCity}
              isClearable
              placeholder="請選擇球場"
            />
          </div>
        </div>
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
              {event.date} {event.startTimeStamp.toDate().toLocaleTimeString()}~
              {event.endTimeStamp.toDate().toLocaleTimeString()} {event.level}
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
