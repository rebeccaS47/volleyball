import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useUserAuth } from '../../context/userAuthContext';
import { auth, provider } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import styled from 'styled-components';
import { Card, TextField, Button, Typography } from '@mui/material';
import google from '../../assets/google.svg';
import type { User } from '../../types.ts';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUser } = useUserAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData: User = {
        name: user.displayName || 'Anonymous',
        imgURL: user.photoURL || '',
        id: user.uid,
        email: user.email || 'No email',
      };

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, userData);
      }
      updateUser(userData as User);
      navigate('/');
    } catch (error) {
      setError('Failed to log in with Google.');
      console.error(error);
    }
  };

  return (
    <LoginCard>
      <Typography variant="h4" gutterBottom>
        登入
      </Typography>
      <Form onSubmit={handleLogin}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" fullWidth>
          登入
        </Button>
      </Form>
      <Typography variant="body2" style={{ marginTop: '5px' }}>
        還沒有帳號?{' '}
        <a
          href="/signup"
          style={{ color: 'black', textDecoration: 'underline' }}
        >
          註冊
        </a>
      </Typography>
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
        <img src={google} style={{ width: '20px', marginRight: '5px' }} />
        Sign in with Google
      </SocialLoginButton>
    </LoginCard>
  );
};

export default Login;

const LoginCard = styled(Card)`
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

const SocialLoginButton = styled(Button)`
  margin-top: 30px;
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
