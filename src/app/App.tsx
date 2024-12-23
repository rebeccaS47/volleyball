import { RouterProvider } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import UserAuthProvider from '../context/userAuthContext.tsx';
import Router from './Router.tsx';
function App() {
  return (
    <>
      <GlobalStyle />
      <UserAuthProvider>
        <RouterProvider router={Router} />
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
    padding: 20px 30px;
    margin: 0;
    font-family: 'SweiGothicCJK', sans-serif;
    font-weight: 400;

    @media (max-width: 768px) {
      padding: 20px 15px;
    }
  }
  
    :root{
    --color-primary: rgba(0, 129, 204);
    --color-secondary: rgba(242, 186, 21);
    --color-light: #f8f8f8;
    --color-lighthover: #eaeaea;
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
