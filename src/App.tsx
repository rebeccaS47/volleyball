import { createGlobalStyle } from 'styled-components';
import { Routes, Route } from "react-router-dom";

import Event from './pages/Home/Event'
import EventDetail from './pages/Home/EventDetail'
import HoldEvent from './pages/Home/HoldEvent'
import Court from './pages/Court/Court'
import CourtDetail from './pages/Court/CourtDetail'

function App() {

  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Event />}/>
          <Route path="/eventdetail" element={<EventDetail />}/>
          <Route path="/holdevent" element={<HoldEvent />}/>
          <Route path="/court" element={<Court />}/>
          <Route path="/courtdetail" element={<CourtDetail />}/>
      </Routes>
    </>
  )
}

export default App

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    padding: 0;
    margin: 0;
    /* font-family: 'Noto Sans TC', sans-serif; */
  }

  /* #root {

    @media screen and (max-width: 1279px) {
      
    }
  } */

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
`;
