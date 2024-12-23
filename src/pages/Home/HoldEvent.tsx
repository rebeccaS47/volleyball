import { Snackbar } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';
import styled from 'styled-components';
import UserSelector from '../../components/UserSelector';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import {
  createEvent,
  fetchCourtDetails,
  fetchDropdownCities,
  fetchDropdownCourts,
} from '../../firebase.ts';
import type { Event, Option } from '../../types';

const HoldEvent: React.FC = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState<Option[]>([]);
  const [courts, setCourts] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Option | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const levelOptions: Option[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
  ];

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
    findNum: '',
    totalCost: '',
    averageCost: 0,
    notes: '',
    playerList: [],
    createdEventAt: Timestamp.now(),
    applicationList: [],
    endTimeStamp: Timestamp.now(),
    startTimeStamp: Timestamp.now(),
  });

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (!selectedCity) newErrors.city = '城市為必填項';
    if (!selectedCourt) newErrors.court = '球場為必填項';
    if (!formData.date) {
      newErrors.date = '日期為必填項';
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate <= tomorrow) {
        newErrors.date = '日期必須在明天之後';
      }
    }
    if (!formData.startTime) newErrors.startTime = '時間為必填項';
    if (formData.duration === 0) newErrors.duration = '活動時長為必填項';
    if (!formData.netHeight) newErrors.netHeight = '網高為必填項';
    if (formData.findNum === '') newErrors.findNum = '找尋人數為必填項';
    if (formData.totalCost === '') newErrors.totalCost = '總金額為必填項';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCityChange = (selectedOption: Option | null) => {
    setSelectedCity(selectedOption);
    setSelectedCourt(null);
    setFormData((prevData) => ({
      ...prevData,
      city: selectedOption ? selectedOption.value : '',
    }));
    if (selectedOption) {
      setErrors((prev) => ({ ...prev, city: '' }));
    }
  };

  const handleCourtChange = async (selectedOption: Option | null) => {
    setSelectedCourt(selectedOption);
    if (selectedOption) {
      const courtData = await fetchCourtDetails(selectedOption.value);
      if (courtData) {
        setFormData((prevData) => ({
          ...prevData,
          court: courtData,
        }));
        setErrors((prev) => ({ ...prev, court: '' }));
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    let isValidNumber = false;

    if (name === 'findNum') {
      isValidNumber = /^(1[0-9]|20|[1-9])$/.test(value);
      if (!isValidNumber && value !== '') return;
    }

    if (name === 'totalCost') {
      isValidNumber = /^(0|[1-9]\d*)$/.test(value);
      if (!isValidNumber && value !== '') return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (
    selectedOption: SingleValue<Option>,
    { name }: { name: string }
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? selectedOption.value : '',
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await createEvent(formData);
        showSnackbar('活動建立成功！');
      } catch (error) {
        console.error(error);
        showSnackbar('活動建立失敗，請稍後再試。');
      }
    }
  };

  const handleUserSelect = (selectedUsers: string[]) => {
    setFormData((prevData) => ({
      ...prevData,
      playerList: selectedUsers,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  return (
    <>
      <HoldEventContainer>
        <Form onSubmit={handleSubmit}>
          <FormTitle>活動表單</FormTitle>
          <FormSection>
            <FormField>
              <SelectLabelText>
                城市 *{errors.city && <ErrorText>{errors.city}</ErrorText>}
              </SelectLabelText>
              <Select
                value={selectedCity}
                onChange={handleCityChange}
                options={cities}
                isClearable
                placeholder="請選擇城市"
              />
            </FormField>
            <FormField>
              <SelectLabelText>
                球場 *{errors.court && <ErrorText>{errors.court}</ErrorText>}
              </SelectLabelText>
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
            <CourtAddress>
              {formData.court.city + formData.court.address}
            </CourtAddress>
          )}
          <InputContainer>
            <LabelText>
              日期 *{errors.date && <ErrorText>{errors.date}</ErrorText>}
            </LabelText>
            <InputText
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </InputContainer>
          <FormSection>
            <FormField>
              <LabelText>
                時間 *
                {errors.startTime && <ErrorText>{errors.startTime}</ErrorText>}
              </LabelText>
              <InputText
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </FormField>
            <FormField>
              <LabelText htmlFor="duration">
                活動時長(hr) *: {formData.duration}
                {errors.duration && <ErrorText>{errors.duration}</ErrorText>}
              </LabelText>
              <input
                id="duration"
                type="range"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="12"
              />
            </FormField>
          </FormSection>
          <FormSectionRow>
            <div>
              <LabelText>網高 *</LabelText>
              <LabelText>
                <input
                  type="radio"
                  name="netHeight"
                  value="女網"
                  checked={formData.netHeight === '女網'}
                  onChange={handleInputChange}
                />
                女網
              </LabelText>
              <LabelText>
                <input
                  type="radio"
                  name="netHeight"
                  value="男網"
                  checked={formData.netHeight === '男網'}
                  onChange={handleInputChange}
                />
                男網
              </LabelText>
              {errors.netHeight && <ErrorText>{errors.netHeight}</ErrorText>}
            </div>
            <FormFieldRow>
              <LabelText>
                <input
                  type="checkbox"
                  name="isAC"
                  checked={formData.isAC}
                  onChange={handleInputChange}
                />
                有開冷氣
              </LabelText>
            </FormFieldRow>
          </FormSectionRow>
          <FormSection>
            <FormField>
              <SelectLabelText>友善程度</SelectLabelText>
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
              <SelectLabelText>分級</SelectLabelText>
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
          <InputContainer>
            <SelectLabelText>內建名單</SelectLabelText>
            <UserSelector
              onSelect={handleUserSelect}
              currentUserId={formData.createUserId}
            />
          </InputContainer>
          <FormSection>
            <FormField>
              <LabelText>
                找尋人數(1~20) *
                {errors.findNum && <ErrorText>{errors.findNum}</ErrorText>}
              </LabelText>
              <InputText
                type="text"
                name="findNum"
                value={formData.findNum}
                onChange={handleInputChange}
              />
            </FormField>
            <FormField>
              <LabelText>
                總金額 *
                {errors.totalCost && <ErrorText>{errors.totalCost}</ErrorText>}
              </LabelText>
              <InputText
                type="text"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleInputChange}
              />
            </FormField>
          </FormSection>
          <InputContainer>
            <LabelText>備註</LabelText>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </InputContainer>
          <Button type="submit">建立活動</Button>
        </Form>
      </HoldEventContainer>
      <StyledSnackbar
        open={open}
        autoHideDuration={1000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SnackbarContent>{message}</SnackbarContent>
      </StyledSnackbar>
    </>
  );
};

export default HoldEvent;

const HoldEventContainer = styled.div`
  margin: 32px 0px;
  background-color: var(--color-light);
  border-radius: 15px;

  @media (max-width: 600px) {
    padding: 10px 0px;
  }
`;

const Form = styled.form`
  padding: 30px 30px;
  max-width: 800px;
  margin: 0px auto;

  @media (max-width: 600px) {
    padding: 20px 20px;
  }
`;

const FormTitle = styled.h1`
  text-align: center;
  margin-top: 0;
`;

const FormSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    margin-bottom: 8px;
  }
`;

const FormSectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 49%;
  margin-bottom: 5px;

  @media (max-width: 600px) {
    width: 100%;
    margin-bottom: 8px;
  }
`;

const FormFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 49%;
  margin-bottom: 5px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const CourtAddress = styled.div`
  color: gray;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const InputText = styled.input`
  box-sizing: border-box;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  height: 38px;
  padding: 0 10px;
  @media (max-width: 600px) {
    margin-bottom: 8px;
  }
`;

const TextArea = styled.textarea`
  box-sizing: border-box;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  height: 200px;
  padding: 10px;
  resize: none;

  @media (max-width: 600px) {
    height: 100px;
  }
`;

const LabelText = styled.label`
  font-size: 15px;
  margin-bottom: 5px;
  @media (max-width: 600px) {
    margin-bottom: 2px;
  }
`;

const SelectLabelText = styled.label`
  font-size: 15px;
  margin-bottom: 5px;
  @media (max-width: 600px) {
    display: none;
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background-color: var(--color-secondary);
  color: var(--color-dark);
  font-weight: 500;
  font-size: 24px;
  line-height: 24px;
  border: 2px solid var(--color-dark);
  border-radius: 14px;
  box-shadow: -4px 3px 0 0 var(--color-dark);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: -2px 1px 0 0 var(--color-dark);
    background-color: var(--color-light);
    transform: translateY(-2px);
    transform: translateX(-1px);
  }
`;

const ErrorText = styled.span`
  color: red;
  font-size: 12px;
  padding-left: 5px;
`;

const StyledSnackbar = styled(Snackbar)`
  &.MuiSnackbar-root {
    z-index: 1400;
  }
`;

const SnackbarContent = styled.div`
  padding: 10px 16px;
  width: 200px;
  border-radius: 4px;
  font-weight: 500;
  color: var(--color-light);
  background-color: var(--color-dark);
`;
