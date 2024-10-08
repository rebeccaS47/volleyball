import React, { useState } from 'react';
import { useUserAuth } from '../../context/userAuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

interface InfoProps {}

const Info: React.FC<InfoProps> = () => {
  const { firebaseUser, updateUser } = useUserAuth();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file || !firebaseUser || !firebaseUser.email) {
      alert('Please fill all fields');
      return;
    }

    try {
      setUploading(true);
      const fileRef = ref(storage, `userPhotos/${firebaseUser.uid}}`);
      await uploadBytes(fileRef, file);
      const imgURL = await getDownloadURL(fileRef);

      const userData = {
        name: name,
        imgURL: imgURL,
        id: firebaseUser.uid,
        email: firebaseUser.email,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      updateUser(userData);

      alert('成功上傳!');
      navigate('/');
    } catch (error) {
      console.error('Error uploading data: ', error);
      alert('Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Info</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="file">Upload Photo:</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Info;
