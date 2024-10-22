import { Button, Card, TextField, Typography } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../../../firebaseConfig';
import google from '../../assets/google.svg';
import { useUserAuth } from '../../context/userAuthContext';
import { signInWithGoogleAndSyncUser } from '../../firebase.ts';

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
    } catch {
      setError('登入失敗，請檢查您的email及密碼是否正確');
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

  return (
    <LoginCard>
      <h1>登入</h1>
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
        <LoginButton type="submit">登入</LoginButton>
      </Form>
      <Typography variant="body2" style={{ marginTop: '10px' }}>
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
        style={{ color: 'black' }}
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
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const SocialLoginButton = styled(Button)`
  margin-top: 30px;
  &::before,
  &::after,
  & > ::before,
  & > ::after {
    content: '';
    position: absolute;
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 12px;
  }

  &::before {
    top: 0;
    left: 0;
    border-bottom-right-radius: 100%;
    background-color: var(--color-secondary);
  }

  &::after {
    top: 0;
    right: 0;
    border-bottom-left-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::before {
    bottom: 0;
    left: 0;
    border-top-right-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::after {
    bottom: 0;
    right: 0;
    border-top-left-radius: 100%;
    background-color: var(--color-secondary);
  }
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

const LoginButton = styled.button`
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
