import { RouterProvider } from 'react-router-dom';
import { Global, css } from '@emotion/react';
import UserAuthProvider from './context/userAuthContext';
import router from './routes';
import { CityCourtProvider } from './context/CityCourtContext';
function App() {
  return (
    <>
      <Global styles={globalStyles}/>
      <UserAuthProvider>
        <CityCourtProvider>
          <RouterProvider router={router} />
        </CityCourtProvider>
      </UserAuthProvider>
    </>
  );
}

export default App;

const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  body {
    padding: 0;
    margin: 0;
    /* font-family: 'Noto Sans TC', sans-serif; */
  }
  
    :root{
    /* --primary-color: rgba(244, 67, 54, 1); */
  }

  p {
    margin: 0;
  }

  a{
    text-decoration: none;
  }

  button{
    cursor: pointer;
    border: none;
  }

  th, td {
  padding: 15px;
}

`;
