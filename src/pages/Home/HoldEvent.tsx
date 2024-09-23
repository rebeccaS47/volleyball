import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Court, Event } from '../../types';
import { useCityCourtContext } from '../../context/useCityCourtContext';
import { CitySelector } from '../../components/CitySelector';
import { CourtSelector } from '../../components/CourtSelector';

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
    createUserId: user?.uid || '',
    date: '',
    startTime: '',
    endTime: '',
    netHeight: '',
    friendlinessLevel: '',
    level: '',
    isAC: false,
    findNum: 0,
    totalCost: 0,
    notes: '',
    playerList: [],
    eventStatus: 'hold',
    createdEventAt: '',
    applicationList: [],
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
      const eventCollectionRef = collection(db, 'events');
      const docRef = await addDoc(eventCollectionRef, {
        ...formData,
        createdEventAt: serverTimestamp(),
        applicationList: [],
        playerList: [user?.uid],
        eventStatus: 'hold',
      });

      await updateDoc(docRef, { id: docRef.id });
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
        <span> ~ </span>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          required
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
