import { useState, useEffect, useCallback } from 'react';
import type { Event, Option, FilterState } from '../../types';
import {
  fetchDropdownCities,
  fetchDropdownCourts,
  fetchCourtDetails,
  fetchHomeEventList,
} from '../../firebase.ts';
import styled from 'styled-components';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventDetail from '../../components/EventDetail';
import { SyncLoader } from 'react-spinners';

interface EventProps {}

const Event: React.FC<EventProps> = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  useEffect(() => {
    const loadDroupdownCities = async () => {
      const cityOptions = await fetchDropdownCities();
      setCities(cityOptions);
    };
    loadDroupdownCities();
  }, []);

  useEffect(() => {
    const loadDroupdownCourts = async () => {
      const courtOptions = await fetchDropdownCourts(selectedCity);
      setCourts(courtOptions);
    };
    loadDroupdownCourts();
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
      const courtData = await fetchCourtDetails(courtOption.value);
      if (courtData) {
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

  const fetchEventList = useCallback(() => {
    setIsLoading(true);
    try {
      const unsubscribe = fetchHomeEventList((events) => {
        setEventList(events);
        setIsLoading(false);
      });

      return unsubscribe;
    } catch {
      setIsLoading(false);
      return undefined;
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
    const unsubscribe = fetchEventList();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchEventList]);

  useEffect(() => {
    if (!isLoading) {
      filterEvents();
    }
  }, [filterState, eventList, filterEvents, isLoading]);

  return (
    <IndexContainer>
      <FilterContainer>
        <div>
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
        </div>
        <div>
          <FilterInput
            type="date"
            name="date"
            value={filterState.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
          />{' '}
          <FilterInput
            type="time"
            name="startTime"
            value={filterState.startTime}
            onChange={handleInputChange}
          />{' '}
          <FilterInput
            type="time"
            name="endTime"
            value={filterState.endTime}
            onChange={handleInputChange}
          />
        </div>
      </FilterContainer>
      <br />
      <EventListContainer>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              width: '100vw',
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <SyncLoader
              margin={10}
              size={20}
              speedMultiplier={0.8}
              color="var(--color-secondary)"
            />
          </div>
        ) : filteredEventList.length === 0 ? (
          <div
            style={{
              color: 'var(--color-dark)',
              backgroundColor: 'var(--color-light)',
              margin: '0 auto',
            }}
          >
            暫無相關活動
          </div>
        ) : (
          filteredEventList.map((event) => (
            <EventCard
              data-eventid={event.id}
              key={event.id}
              onClick={() => handleEventClick(event)}
            >
              <EventTitle>{event.court.name}</EventTitle>
              <EventInfo>
                <CalendarMonthIcon />
                {event.date}
              </EventInfo>
              <EventInfo>
                <AccessTimeIcon />
                {event.startTimeStamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ~{' '}
                {event.endTimeStamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </EventInfo>
              <EventInfo>
                <AttachMoneyIcon />
                {event.averageCost} /人
              </EventInfo>
              <EventInfoAddress>
                <LocationOnIcon />
                {event.court.city}
                {event.court.address}
              </EventInfoAddress>
            </EventCard>
          ))
        )}
      </EventListContainer>
      <EventDetail
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        event={selectedEvent}
        hasApplyBtn={true}
      />
    </IndexContainer>
  );
};

export default Event;

const IndexContainer = styled.div`
  padding: 20px 0px;
  @media (max-width: 480px) {
    paddingx: 10px;
  }
`;

const EventListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  border-radius: 15px;
  justify-content: flex-start;
  @media (max-width: 768px) {
    gap: 5px;
  }
`;

const EventCard = styled.div`
  background-color: #f8f8f8;
  box-sizing: content-box;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  width: calc(33.333% - 62px);
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
    border-radius: 12px;
  }

  &::before {
    top: 0;
    left: 0;
    border-bottom-right-radius: 100%;
    background-color: var(--color-secondary);
  }

  &::after {
    top: 0;
    right: 0;
    border-bottom-left-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::before {
    bottom: 0;
    left: 0;
    border-top-right-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::after {
    bottom: 0;
    right: 0;
    border-top-left-radius: 100%;
    background-color: var(--color-secondary);
  }

  @media (max-width: 1024px) {
    width: calc(50% - 70px);
    padding: 1.5rem 1.8rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem 4rem;
  }
`;

const EventInfo = styled.p`
  padding: 12px 24px 0px;
  font-size: 1.2rem;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const EventInfoAddress = styled.p`
  padding: 24px 24px 0px;
  font-size: 16px;
  color: gray;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const EventTitle = styled.h3`
  margin: 0px;
  padding: 0px 0px 28px 0px;
  font-size: 2rem;
  text-align: center;
  color: var(--color-dark);
`;

const FilterInput = styled.input`
  min-height: 40px;
  min-width: 70px;
  max-width: 100px;
  border: none;
  background-color: transparent;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 10px;
  border-radius: 5px;
  width: fit-content;
  margin: 32px auto;
`;

const StyledSelect = styled.select`
  padding: 5px;
  margin-right: 5px;
  border: none;
  background-color: transparent;

  &:focus {
    outline: none;
    border-color: #a0a0a0;
    box-shadow: 0 0 0 1px #a0a0a0;
  }
`;
