import { useCallback, useEffect, useMemo, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import styled from 'styled-components';
import EventCard from '../../components/EventCard.tsx';
import EventDetail from '../../components/EventDetail';
import {
  fetchCourtDetails,
  fetchDropdownCities,
  fetchDropdownCourts,
  fetchHomeEventList,
} from '../../firebase.ts';
import type { Event, FilterState, Option } from '../../types';

const Event: React.FC = () => {
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

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  }, []);

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
    if (name === 'endTime') {
      if (filterState.startTime && value < filterState.startTime) {
        return;
      }
    }
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

  const filterEvents = useCallback(() => {
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

  const renderedEventList = useMemo(() => {
    return filteredEventList.map((event) => (
      <EventCard key={event.id} event={event} onClick={handleEventClick} />
    ));
  }, [filteredEventList, handleEventClick]);

  const currentSelectedEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return (
      filteredEventList.find((event) => event.id === selectedEvent.id) ||
      selectedEvent
    );
  }, [selectedEvent, filteredEventList]);

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
        <InputWrapper>
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
        </InputWrapper>
        <InputWrapper>
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
        </InputWrapper>
        <InputWrapper>
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
        </InputWrapper>
        <InputWrapper>
          <FilterInput
            type="date"
            name="date"
            value={filterState.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </InputWrapper>
        <InputWrapper>
          <FilterInput
            type="time"
            name="startTime"
            value={filterState.startTime}
            onChange={handleInputChange}
          />
        </InputWrapper>
        <InputWrapper>
          <FilterInput
            type="time"
            name="endTime"
            value={filterState.endTime}
            onChange={handleInputChange}
            min={filterState.startTime}
          />
        </InputWrapper>
      </FilterContainer>
      <br />
      <EventListContainer>
        {isLoading ? (
          <LoadingContainer>
            <SyncLoader
              margin={10}
              size={20}
              speedMultiplier={0.8}
              color="var(--color-secondary)"
            />
          </LoadingContainer>
        ) : filteredEventList.length === 0 ? (
          <EmptyContainer>暫無相關活動</EmptyContainer>
        ) : (
          renderedEventList
        )}
      </EventListContainer>
      <EventDetail
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        event={currentSelectedEvent}
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

const EmptyContainer = styled.div`
  color: var(--color-dark);
  background-color: var(--color-light);
  margin: 0 auto;
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

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  background-color: var(--color-light);
  padding: 15px;
  border-radius: 15px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;

  &:hover {
    cursor: pointer;
  }
`;

const StyledSelect = styled.select`
  padding: 8px;
  border-radius: 10px;
  border: none;
  background-color: white;
  width: 100%;
  height: 40px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:focus {
    outline: none;
    border-color: var(--color-secondary);
  }

  &:disabled {
    background-color: var(--color-light);
    cursor: not-allowed;
  }
`;

const FilterInput = styled.input`
  padding: 8px;
  border-radius: 10px;
  border: none;
  background-color: white;
  width: 100%;
  height: 40px;

  &:focus {
    outline: none;
    border-color: var(--color-secondary);
  }
`;
