import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import styled from 'styled-components';
import { Card, TextField, Typography } from '@mui/material';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { User } from '../../types';
import DefaultPhoto from '../../assets/defaultPhoto.png';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp, updateUser } = useUserAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('請輸入相同密碼');
      return;
    }
    try {
      const userCredential = await signUp(email, password);

      const response = await fetch(DefaultPhoto);
      const defaultPhotoBlob = await response.blob();
      const storageRef = ref(storage, `userPhotos/${userCredential.uid}`);
      await uploadBytes(storageRef, defaultPhotoBlob);
      const downloadURL = await getDownloadURL(storageRef);

      const userData = {
        name: name,
        imgURL: downloadURL,
        id: userCredential.uid,
        email: userCredential.email,
      };

      await setDoc(doc(db, 'users', userCredential.uid), userData);
      updateUser(userData as User);
      alert('成功註冊!');
      navigate('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/weak-password') {
          setError('密碼至少需要六位字');
        } else if (error.code === 'auth/email-already-in-use') {
          setError('該電子郵件已被使用');
        } else if (error.code === 'auth/invalid-email') {
          setError('請輸入有效的電子郵件');
        } else {
          setError('註冊失敗，請稍後再試');
        }
      } else {
        setError('註冊失敗，請稍後再試');
      }
      console.error(error);
    }
  };

  return (
    <SignupCard>
      <Typography variant="h4" gutterBottom>
        註冊
      </Typography>
      <Form onSubmit={handleSignup}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="名稱"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="密碼"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="確認密碼"
          type="password"
          variant="outlined"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <ErrorText>{error}</ErrorText>}
        <SignupButton type="submit">註冊</SignupButton>
      </Form>
      <Divider>
        <Hr />
        <span>or</span>
        <Hr />
      </Divider>
      <Typography variant="body2">
        已經有帳號嗎?{' '}
        <a
          href="/login"
          style={{ color: 'black', textDecoration: 'underline' }}
        >
          登入
        </a>
      </Typography>
    </SignupCard>
  );
};

export default Signup;

const SignupCard = styled(Card)`
  width: 300px;
  padding: 20px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(204, 204, 204);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  width: 100%;
`;

const Hr = styled.hr`
  flex-grow: 1;
  border: none;
  height: 1px;
  background-color: rgb(204, 204, 204);
  margin: 0 10px;
`;

const ErrorText = styled.div`
  color: red;
`;

const SignupButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background-color: var(--color-secondary);
  color: var(--color-dark);
  font-weight: 500;
  font-size: 20px;
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

// const StyledTitle = styled.h1`
//   color: var(--color-secondary);
//   font-weight: bold;
//   text-shadow: -6px 6px 0px black;
//   -webkit-text-stroke: 1px black;
//   font-size: 3rem;
//   margin: 0;
//   padding: 10px;
// `;