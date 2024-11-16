import { Button, Card, Snackbar, TextField } from '@mui/material';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth, db, storage } from '../../firebaseConfig';
import DefaultPhoto from '../assets/defaultPhoto.png';
import google from '../assets/google.svg';
import { useUserAuth } from '../context/userAuthContext';
import { signInWithGoogleAndSyncUser } from '../firebase.ts';
import type { User } from '../types';

const AuthCard: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('chris0205@gmail.com');
  const [password, setPassword] = useState('123123');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp, updateUser } = useUserAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch {
      setError('登入失敗，請檢查您的email及密碼是否正確');
    }
  };

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
      showSnackbar('成功註冊!');
      setTimeout(() => {
        navigate('/');
      }, 800);
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
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userData = await signInWithGoogleAndSyncUser();
      updateUser(userData);
      navigate('/');
    } catch {
      setError('使用 Google 登錄失敗');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    if (isLogin) {
      setEmail('');
      setPassword('');
    } else {
      setEmail('chris0205@gmail.com');
      setPassword('123123');
    }
    setName('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  return (
    <>
      <AuthContainer>
        <TabContainer>
          <Tab $active={isLogin} onClick={() => isLogin || switchMode()}>
            登入帳號
          </Tab>
          <Tab $active={!isLogin} onClick={() => isLogin && switchMode()}>
            註冊帳號
          </Tab>
        </TabContainer>

        <Form onSubmit={isLogin ? handleLogin : handleSignup}>
          <StyledTextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isLogin && (
            <StyledTextField
              label="名稱"
              variant="outlined"
              fullWidth
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <StyledTextField
            label="密碼"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <StyledTextField
              label="確認密碼"
              type="password"
              variant="outlined"
              fullWidth
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          {error && <ErrorText>{error}</ErrorText>}
          <AuthButton type="submit">{isLogin ? '登入' : '註冊'}</AuthButton>
        </Form>

        {isLogin && (
          <>
            <Divider>
              <Hr />
              <span>or</span>
              <Hr />
            </Divider>
            <SocialLoginButton
              variant="outlined"
              fullWidth
              onClick={handleGoogleLogin}
            >
              <GoogleIcon src={google} />
              Sign in with Google
            </SocialLoginButton>
          </>
        )}
      </AuthContainer>
      <StyledSnackbar
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SnackbarContent>{message}</SnackbarContent>
      </StyledSnackbar>
    </>
  );
};

export default AuthCard;

const AuthContainer = styled(Card)`
  max-width: 500px;
  padding: 0 20px 40px 20px;
  margin: 100px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(204, 204, 204);
  border-radius: 15px !important;
`;

const TabContainer = styled.div`
  display: flex;
  width: calc(100% + 40px);
  margin: 0 -20px;
  margin-bottom: 20px;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Tab = styled.div<{ $active: boolean }>`
  flex: 1;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? 'var(--color-secondary)' : '#fff'};
  font-size: 20px;
  font-weight: ${(props) => (props.$active ? 'bold' : 'normal')};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.$active ? 'var(--color-secondary)' : '#f5f5f5'};
  }
`;

const Form = styled.form`
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const StyledTextField = styled(TextField)`
  & .MuiFormLabel-root {
    &.Mui-focused {
      color: black;
    }
  }
`;

const ErrorText = styled.div`
  color: red;
  text-align: center;
`;

const GoogleIcon = styled.img`
  width: 20px;
  margin-right: 5px;
`;

const SocialLoginButton = styled(Button)`
  margin-top: 30px;
  color: black !important;
  border-color: var(--color-secondary) !important;
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

const AuthButton = styled.button`
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
