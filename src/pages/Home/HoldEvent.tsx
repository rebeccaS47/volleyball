import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Court, Event } from '../../types';
import { useCityCourtContext } from '../../context/useCityCourtContext';
import { CitySelector } from '../../components/CitySelector';
import { CourtSelector } from '../../components/CourtSelector';
import UserSelector from '../../components/UserSelector';

interface HoldEventProps {}

const HoldEvent: React.FC<HoldEventProps> = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<number>();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const { cities, courts } = useCityCourtContext();

  const [formData, setFormData] = useState<Event>({
    id: '',
    court: {
      id: '',
      name: '',
      city: '',
      address: '',
      isInDoor: false,
      hasAC: false,
    },
    createUserId: user?.id || '',
    date: '',
    startTime: '',
    duration: 0,
    netHeight: '',
    friendlinessLevel: '',
    level: '',
    isAC: false,
    findNum: 0,
    totalCost: 0,
    notes: '',
    playerList: [],
    createdEventAt: Timestamp.now(),
    applicationList: [],
    endTimeStamp: Timestamp.now(),
    startTimeStamp: Timestamp.now(),
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    try {
      const [year, month, day] = formData.date.split('-').map(Number);

      const [startHours, startMinutes] = formData.startTime
        .split(':')
        .map(Number);

      const startDate = new Date(
        year,
        month - 1,
        day,
        startHours,
        startMinutes
      );
      const startTimeStamp = Timestamp.fromDate(startDate);

      const endDate = new Date(
        startDate.getTime() + formData.duration * 60 * 60 * 1000
      );
      const endTimeStamp = Timestamp.fromDate(endDate);

      const eventCollectionRef = collection(db, 'events');
      const docRef = await addDoc(eventCollectionRef, {
        ...formData,
        createdEventAt: serverTimestamp(),
        applicationList: [],
        playerList: [formData.createUserId, ...formData.playerList],
        startTimeStamp,
        endTimeStamp,
      });
      await updateDoc(docRef, { id: docRef.id });

      await Promise.all(
        [formData.createUserId, ...formData.playerList].map(
          async (playerId) => {
            const participationRef = doc(
              db,
              'teamParticipation',
              `${docRef.id}_${playerId}`
            );
            await setDoc(participationRef, {
              eventId: docRef.id,
              userId: playerId,
              courtName: formData.court.name,
              state: 'accept',
              date: formData.date,
              startTimeStamp,
              endTimeStamp,
            });
          }
        )
      );

      alert('活動建立成功');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleCourtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(e.target.value);
    if (selectedIndex === -1) {
      setFormData((prevData) => ({
        ...prevData,
        court: {
          id: '',
          name: '',
          city: '',
          address: '',
          isInDoor: false,
          hasAC: false,
        },
      }));
    } else {
      const selectedCourt = filteredCourts[selectedIndex];
      setFormData((prevData) => ({
        ...prevData,
        court: {
          id: selectedCourt.id,
          name: selectedCourt.name,
          city: selectedCourt.city,
          address: selectedCourt.address,
          isInDoor: selectedCourt.isInDoor,
          hasAC: selectedCourt.hasAC,
        },
      }));
    }
    setSelectedCourt(selectedIndex);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setSelectedCourt(-1);
  };

  const handleUserSelect = (selectedUsers: string[]) => {
    setFormData((prevData) => ({
      ...prevData,
      playerList: selectedUsers,
    }));
  };

  useEffect(() => {
    if (selectedCity) {
      const filtered = courts.filter((court) => court.city === selectedCity);
      setFilteredCourts(filtered);
      console.log('filtered', filtered);
    } else {
      setFilteredCourts([]);
    }
  }, [selectedCity, courts]);

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '10px' }}>
        <h1>HoldEvent</h1>
        <label>選擇球場</label>
        <CitySelector
          cities={cities}
          selectedCity={selectedCity}
          onChange={handleCityChange}
        />
        <CourtSelector
          filteredCourts={filteredCourts}
          selectedCourt={selectedCourt}
          onChange={handleCourtChange}
        />
        {selectedCourt !== undefined && selectedCourt !== -1 ? (
          <p>
            地址: {filteredCourts[selectedCourt].city}
            {filteredCourts[selectedCourt].address}
          </p>
        ) : null}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>日期</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>時間</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="duration">活動時長(hr): {formData.duration}</label>
        <input
          id="duration"
          type="range"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          min="1"
          max="12"
          // step="0.5"
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>網高</label>
        <label>
          <input
            type="radio"
            name="netHeight"
            value="女網"
            checked={formData.netHeight === '女網'}
            onChange={handleInputChange}
          />
          女網
        </label>
        <label>
          <input
            type="radio"
            name="netHeight"
            value="男網"
            checked={formData.netHeight === '男網'}
            onChange={handleInputChange}
          />
          男網
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>友善程度</label>
        <select
          name="friendlinessLevel"
          value={formData.friendlinessLevel}
          onChange={handleInputChange}
        >
          <option value="">請選擇友善程度</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>分級</label>
        <select
          name="level"
          value={formData.level}
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
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            name="isAC"
            checked={formData.isAC}
            onChange={handleInputChange}
          />
          是否有開冷氣
        </label>
      </div>
      <div>
        <label>內建名單</label>
        <UserSelector
          onSelect={handleUserSelect}
          currentUserId={formData.createUserId}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>找尋人數</label>
        <input
          type="number"
          name="findNum"
          value={formData.findNum}
          onChange={handleInputChange}
          required
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>總金額</label>
        <input
          type="number"
          name="totalCost"
          value={formData.totalCost}
          onChange={handleInputChange}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>備註</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit">建立活動</button>
    </form>
  );
};

export default HoldEvent;
