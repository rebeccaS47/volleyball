import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import {
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface HoldEventProps {}
interface Court {
  id: string;
  name: string;
  city: string;
  address: string;
  isInDoor: boolean;
  hasAC: boolean;
}

interface FormData {
  courtId: string | null;
  createUserId: string;
  date: string;
  startTime: string;
  endTime: string;
  friendlinessLevel: string;
  level: string;
  isAC: boolean;
  totalCost: number;
  notes: string;
}

const HoldEvent: React.FC<HoldEventProps> = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<number>();
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    courtId: null,
    createUserId: user?.uid || '',
    date: '',
    startTime: '',
    endTime: '',
    friendlinessLevel: '',
    level: '',
    isAC: false,
    totalCost: 0,
    notes: '',
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
      await addDoc(eventCollectionRef, {
        ...formData,
        createdEventAt: serverTimestamp(),
      });
      alert('活動建立成功');
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleCourtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(e.target.value);
    if (selectedIndex === -1) {
      setFormData((prevData) => ({ ...prevData, courtId: null }));
    } else {
      const selectedCourt = filteredCourts[selectedIndex];
      setFormData((prevData) => ({ ...prevData, courtId: selectedCourt.id }));
    }
    setSelectedCourt(selectedIndex);
  };

  const getCourtList = useCallback(async () => {
    try {
      const courtCollectionRef = collection(db, 'courts');
      const data = await getDocs(courtCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Court[];
      setCourts(filteredData);

      const citySet = new Set<string>();
      filteredData.forEach((court) => {
        citySet.add(court.city);
      });
      setCities(Array.from(citySet));
      console.log('cities', Array.from(citySet));
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getCourtList();
  }, [getCourtList]);

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
      <div>
        <h1>HoldEvent</h1>
        <label>選擇球場</label>
        <select
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedCourt(-1);
          }}
        >
          <option value="">選擇城市</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          id="court"
          name="court"
          value={
            formData.courtId === null
              ? '-1'
              : filteredCourts.findIndex(
                  (court) => court.id === formData.courtId
                )
          }
          onChange={handleCourtChange}
        >
          <option value="-1">選擇場地</option>
          {filteredCourts.map((court, index) => (
            <option key={court.id} value={index}>
              {court.name}
            </option>
          ))}
        </select>
        {selectedCourt !== undefined && selectedCourt !== -1 ? (
          <p>
            地址: {filteredCourts[selectedCourt].city}
            {filteredCourts[selectedCourt].address}
          </p>
        ) : null}
      </div>
      <div>
        <label>日期</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
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

      <div>
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
      <div>
        <label>分級</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleInputChange}
        >
          <option value="">請選擇分級</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>
      </div>
      <div>
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
        <label>總金額</label>
        <input
          type="number"
          name="totalCost"
          value={formData.totalCost}
          onChange={handleInputChange}
        />
      </div>

      <div>
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
