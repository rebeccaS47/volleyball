import * as React from 'react';
import { UserLogIn } from '../../types.ts';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/userAuthContext.tsx';

interface LoginProps {}

const initialValue: UserLogIn = {
  email: '',
  password: '',
};

const Login: React.FC<LoginProps> = () => {
  const { googleSignIn, logIn } = useUserAuth();
  const navigate = useNavigate();
  const [userLogInInfo, setuserLogInInfo] =
    React.useState<UserLogIn>(initialValue);

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
      console.log('The user info is : ', userLogInInfo);
      await logIn(userLogInInfo.email, userLogInInfo.password);
      navigate('/');
    } catch (error) {
      console.log('Error : ', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
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
            value={userLogInInfo.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setuserLogInInfo({
                ...userLogInInfo,
                email: e.target.value,
              })
            }
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={userLogInInfo.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setuserLogInInfo({
                ...userLogInInfo,
                password: e.target.value,
              })
            }
          />
        </div>
        <button type="submit">Login</button>
        <p>
          Don't have an account ? <Link to="/signup">Sign up</Link>
        </p>
      </form>
      <br />
    </div>
  );
};

export default Login;
