import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { db } from '../../firebaseConfig';
import type { Option, User } from '../types';

const UserSelect: React.FC<{
  onSelect: (selectedUsers: string[]) => void;
  currentUserId: string;
}> = ({ onSelect, currentUserId }) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userOptions: Option[] = userSnapshot.docs
        .map((doc) => {
          const userData = doc.data() as User;
          return { value: userData.id, label: `${userData.name} (${userData.email})` };
        })
        .filter((option) => option.value !== currentUserId);
      setOptions(userOptions);
    };

    fetchUsers();
  }, [currentUserId]);

  const handleChange = (selectedOptions: MultiValue<Option>) => {
    const selectedUserIds = selectedOptions.map((option) => option.value);
    onSelect(selectedUserIds);
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      isMulti={true}
      placeholder="請選擇內建隊員"
      styles={customStyles}
    />
  );
};

export default UserSelect;

const customStyles: StylesConfig<Option, true> = {
  option: (provided) => ({
    ...provided,
    padding: 12,
  }),
};