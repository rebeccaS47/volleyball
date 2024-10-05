import { useNavigate } from 'react-router-dom';
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
import type { Event, Option, Court, FilterState } from '../../types';
import styled from 'styled-components';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface EventProps {}

const Event: React.FC<EventProps> = () => {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<Event[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [courts, setCourts] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Option | null>(null);
  const [filteredEventList, setFilteredEventList] = useState<Event[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    city: '',
    court: '',
    date: '',
    startTime: '',
    endTime: '',
    level: '',
  });

  const levelOptions: Option[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
  ];

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

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityValue = e.target.value;
    const cityOption = cities.find((city) => city.value === cityValue) || null;
    setSelectedCity(cityOption);
    setSelectedCourt(null);
    setFilterState((prevData) => ({
      ...prevData,
      city: cityValue,
      court: '',
    }));
  };

  const handleCourtChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courtValue = e.target.value;
    const courtOption =
      courts.find((court) => court.value === courtValue) || null;
    setSelectedCourt(courtOption);
    if (courtOption) {
      const courtRef = doc(db, 'courts', courtOption.value);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterState((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  useEffect(() => {
    getEventList();
  }, [getEventList]);

  useEffect(() => {
    filterEvents();
  }, [filterState, eventList, filterEvents]);

  return (
    <>
      <FilterContainer>
        <StyledSelect
          value={selectedCity ? selectedCity.value : ''}
          onChange={handleCityChange}
        >
          <option value="">請選擇城市</option>
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </StyledSelect>
        <StyledSelect
          value={selectedCourt ? selectedCourt.value : ''}
          onChange={handleCourtChange}
          disabled={!selectedCity}
        >
          <option value="">請選擇球場</option>
          {courts.map((court) => (
            <option key={court.value} value={court.value}>
              {court.label}
            </option>
          ))}
        </StyledSelect>
        <StyledSelect
          name="level"
          value={filterState.level}
          onChange={handleSelectChange}
        >
          <option value="">請選擇分級</option>
          {levelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
      </FilterContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FilterInput
          type="date"
          name="date"
          value={filterState.date}
          onChange={handleInputChange}
        />
        <FilterInput
          type="time"
          name="startTime"
          value={filterState.startTime}
          onChange={handleInputChange}
        />
        <span> ~ </span>
        <FilterInput
          type="time"
          name="endTime"
          value={filterState.endTime}
          onChange={handleInputChange}
        />
      </div>
      <br />
      <EventListContainer>
        {filteredEventList.length === 0
          ? '暫無相關活動'
          : filteredEventList.map((event) => (
              <EventCard
                data-eventid={event.id}
                key={event.id}
                onClick={() => navigate(`/eventdetail/${event.id}`)}
              >
                <EventTitle>{event.court.name}</EventTitle>
                <EventInfo>{event.date}</EventInfo>
                <EventInfo>
                  {event.startTimeStamp.toDate().toLocaleTimeString()} ~{' '}
                  {event.endTimeStamp.toDate().toLocaleTimeString()}
                </EventInfo>
                <EventInfo>
                  <LocationOnIcon />
                  {event.court.city}
                  {event.court.address}
                </EventInfo>
                <EventInfo>
                  價格/人：${Math.round(event.totalCost / event.findNum)}
                </EventInfo>
              </EventCard>
            ))}
      </EventListContainer>
    </>
  );
};

export default Event;

const EventListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  border-radius: 15px;
  background-color: var(--color-light);
  @media (max-width: 768px) {
    gap: 0px;
  }
`;

const EventCard = styled.div`
  background-color: var(--color-light);
  box-sizing: content-box;
  border: 3px dashed var(--color-primary);
  border-radius: 12px;
  padding: 1.5rem;

  width: calc(33.333% - 70px);
  transition: transform 0.3s ease;
  position: relative;
  overflow: visible;
  cursor: pointer;

  &::before,
  &::after,
  & > ::before,
  & > ::after {
    content: '';
    position: absolute;
    width: 2rem;
    height: 2rem;
    background-color: var(--color-primary);
    /* border: 5px solid var(--color-primary); */
  }

  &::before {
    top: 0;
    left: 0;
    border-bottom-right-radius: 100%;
  }

  &::after {
    top: 0;
    right: 0;
    border-bottom-left-radius: 100%;
  }

  & > ::before {
    bottom: 0;
    left: 0;
    border-top-right-radius: 100%;
  }

  & > ::after {
    bottom: 0;
    right: 0;
    border-top-left-radius: 100%;
  }

  @media (max-width: 1024px) {
    width: calc(50% - 70px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const EventInfo = styled.p`
  margin: 10px 0;
  font-size: 1.2rem;
  /* color: var(--color-dark); */
  color: var(--color-darkblue);
`;

const EventTitle = styled.h3`
  margin: 0 0 15px;
  font-size: 2rem;
  text-align: center;
  color: var(--color-primary);
`;

const FilterInput = styled.input`
  min-height: 38px;
  min-width: 139px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
`;

const StyledSelect = styled.select`
  padding: 5px;
  margin-right: 10px;
  border: none;
  background-color: transparent;

  &:focus {
    outline: none;
    border-color: #a0a0a0;
    box-shadow: 0 0 0 1px #a0a0a0;
  }
`;
