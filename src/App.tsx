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
    /* background-color: var(--color-primary); */
    font-family: 'SweiGothicCJK', sans-serif;
    font-weight: 400;
  }
  
    :root{
    /* --color-primary: #c95933; */
    --color-primary: #0080cc;
    --color-secondary: #ffc100;
    --color-tertiary: #36678c;
    --color-light: #faf3e7;
    --color-dark: #262626;
    --color-darkblue: #104265;
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

@font-face {
  font-family: 'SweiGothicCJK';
  src: url('/SweiGothicCJKsc-Bold.ttf') format('truetype');
  font-weight: 700; 
  font-style: normal;
}

@font-face {
  font-family: 'SweiGothicCJK';
  src: url('/SweiGothicCJKsc-Regular.ttf') format('truetype');
  font-weight: 400; 
  font-style: normal;
}
`;
