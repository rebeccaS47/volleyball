import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import styled from 'styled-components';
import { Card, TextField, Button, Typography } from '@mui/material';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp } = useUserAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await signUp(email, password);
      navigate('/info');
    } catch (error) {
      setError('Failed to create an account.');
      console.error(error);
    }
  };

  return (
    <SignupCard>
      <Typography variant="h4" gutterBottom>
        Sign Up
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
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" fullWidth>
          Sign Up
        </Button>
      </Form>
      <Divider>
        <Hr />
        <span>or</span>
        <Hr />
      </Divider>
      <Typography variant="body2">
        Already have an account?{' '}
        <a
          href="/login"
          style={{ color: 'black', textDecoration: 'underline' }}
        >
          Log in
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
