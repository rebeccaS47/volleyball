import React, { useState, useEffect } from 'react';
import Select,{MultiValue}  from 'react-select';
import { collection, getDocs } from 'firebase/firestore';
import {db} from '../../firebaseConfig';
import type { Option, User } from '../types';


const UserSelect: React.FC<{ onSelect: (selectedUsers: string[]) => void; currentUserId: string }> = ({ onSelect,currentUserId  }) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {

    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userOptions: Option[] = userSnapshot.docs.map(doc => {
        const userData = doc.data() as User;
        return { value: userData.id, label: userData.name };
      })
      .filter(option => option.value !== currentUserId);
      setOptions(userOptions);
    };

    fetchUsers();
  }, [currentUserId]);


  const handleChange = (selectedOptions: MultiValue<Option>) => {
    const selectedUserIds = selectedOptions.map(option => option.value);
    onSelect(selectedUserIds);
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      isMulti={true}
      placeholder="Select a user"
      styles={{
        container: (provided) => ({
          ...provided,
          width: '300px',
        }),
      }}
    />
  );
};

export default UserSelect;