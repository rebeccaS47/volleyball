import * as React from 'react';
import { UserSignIn } from '../../types.ts';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';

const initialValue: UserSignIn = {
  email: '',
  password: '',
  confirmPassword: '',
};

interface SignupProps {}

const Signup: React.FC<SignupProps> = () => {
  const [userInfo, setUserInfo] = React.useState<UserSignIn>(initialValue);
  const navigate = useNavigate();
  const { googleSignIn, signUp } = useUserAuth();

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate('/');
    } catch (error) {
      console.log('Error : ', error);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('The user info is : ', userInfo);
      await signUp(userInfo.email, userInfo.password);
      navigate('/');
    } catch (error) {
      console.log('Error : ', error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Signup</h1>
      <div>
        <p>Sign In With Google To Continue</p>
        <button onClick={handleGoogleSignIn}>Sign In With Google</button>
      </div>
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          placeholder="123@example.com"
          value={userInfo.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUserInfo({ ...userInfo, email: e.target.value })
          }
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={userInfo.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUserInfo({ ...userInfo, password: e.target.value })
          }
        />
      </div>
      <div>
        <label htmlFor="confirmpassword">Confirm password</label>
        <input
          id="confirmpassword"
          type="password"
          placeholder="Confirm password"
          value={userInfo.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUserInfo({
              ...userInfo,
              confirmPassword: e.target.value,
            })
          }
        />
      </div>
      <button type="submit">Sign Up</button>
      <div>
        <p>
          Already have an account ? <Link to="/login">Login</Link>
        </p>
      </div>
    </form>
  );
};

export default Signup;
