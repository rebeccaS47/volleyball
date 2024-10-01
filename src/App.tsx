import { RouterProvider } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import UserAuthProvider from './context/userAuthContext';
import router from './routes';
function App() {
  return (
    <>      
    <GlobalStyle />
      <UserAuthProvider>
          <RouterProvider router={router} />
      </UserAuthProvider>
    </>
  );
}

export default App;

const GlobalStyle = createGlobalStyle`
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
