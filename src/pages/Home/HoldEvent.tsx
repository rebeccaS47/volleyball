import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Court, Event, Option } from '../../types';
import Select, { SingleValue } from 'react-select';
import UserSelector from '../../components/UserSelector';

interface HoldEventProps {}

const HoldEvent: React.FC<HoldEventProps> = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState<Option[]>([]);
  const [courts, setCourts] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Option | null>(null);

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

  const handleCityChange = (selectedOption: Option | null) => {
    setSelectedCity(selectedOption);
    setSelectedCourt(null);
    setFormData((prevData) => ({
      ...prevData,
      city: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleCourtChange = async (selectedOption: Option | null) => {
    setSelectedCourt(selectedOption);
    if (selectedOption) {
      const courtRef = doc(db, 'courts', selectedOption.value);
      const courtDoc = await getDoc(courtRef);
      if (courtDoc.exists()) {
        const courtData = { id: courtDoc.id, ...courtDoc.data() } as Court;
        setFormData((prevData) => ({
          ...prevData,
          court: courtData,
        }));
      }
    } else {
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
    }
  };

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

  const handleSelectChange = (
    selectedOption: SingleValue<Option>,
    { name }: { name: string }
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? selectedOption.value : '',
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

  const handleUserSelect = (selectedUsers: string[]) => {
    setFormData((prevData) => ({
      ...prevData,
      playerList: selectedUsers,
    }));
  };

  return (
    <>
      <center>
        <h1>HoldEvent</h1>
      </center>
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: '30px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '600px',
          margin: '0px auto',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <FormSection>
          <FormField>
            <LabelText>城市</LabelText>
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
          </FormField>
          <FormField>
            <LabelText>球場</LabelText>
            <Select
              value={selectedCourt}
              onChange={handleCourtChange}
              options={courts}
              isDisabled={!selectedCity}
              isClearable
              placeholder="請選擇球場"
            />
          </FormField>
        </FormSection>
        {formData.court && (
          <div
            style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '5px' }}
          >
            {formData.court.city + formData.court.address}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
          }}
        >
          <LabelText>日期</LabelText>
          <InputText
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <FormSection>
          <FormField>
            <LabelText>時間</LabelText>
            <InputText
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </FormField>
          <FormField>
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
          </FormField>
        </FormSection>
        <FormSection>
          <div>
            <LabelText>網高</LabelText>
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
          <FormField>
            <label>
              <input
                type="checkbox"
                name="isAC"
                checked={formData.isAC}
                onChange={handleInputChange}
              />
              是否有開冷氣
            </label>
          </FormField>
        </FormSection>
        <FormSection>
          <FormField>
            <LabelText>友善程度</LabelText>
            <Select
              name="friendlinessLevel"
              value={levelOptions.find(
                (option) => option.value === formData.friendlinessLevel
              )}
              onChange={(option, actionMeta) =>
                handleSelectChange(option, actionMeta as { name: string })
              }
              options={levelOptions}
              isClearable
              placeholder="請選擇友善程度"
              styles={{
                placeholder: (provided) => ({
                  ...provided,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }),
              }}
            />
          </FormField>
          <FormField>
            <LabelText>分級</LabelText>
            <Select
              name="level"
              value={levelOptions.find(
                (option) => option.value === formData.level
              )}
              onChange={(option, actionMeta) =>
                handleSelectChange(option, actionMeta as { name: string })
              }
              options={levelOptions}
              isClearable
              placeholder="請選擇分級"
            />
          </FormField>
        </FormSection>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
          }}
        >
          <LabelText>內建名單</LabelText>
          <UserSelector
            onSelect={handleUserSelect}
            currentUserId={formData.createUserId}
          />
        </div>
        <FormSection>
          <FormField>
            <LabelText>找尋人數</LabelText>
            <InputText
              type="number"
              name="findNum"
              value={formData.findNum}
              onChange={handleInputChange}
              required
            />
          </FormField>
          <FormField>
            <LabelText>總金額</LabelText>
            <InputText
              type="number"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleInputChange}
            />
          </FormField>
        </FormSection>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
          }}
        >
          <LabelText>備註</LabelText>
          <TextArea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit">建立活動</button>
      </form>
    </>
  );
};

export default HoldEvent;

const FormSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 49%;
`;

const InputText = styled.input`
  box-sizing: border-box;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  height: 38px;
  padding: 0 10px;
`;

const TextArea = styled.textarea`
  box-sizing: border-box;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  height: 100px;
  padding: 0 10px;
`;

const LabelText = styled.label`
  font-size: 15px;
`;
