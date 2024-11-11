import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import volleyBall from '../assets/volleyball.png';
import UserStatus from './UserStatus';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { path: '/', label: '活動列表' },
    { path: '/holdevent', label: '發起活動' },
    { path: '/approval', label: '審核' },
    { path: '/feedback', label: '回饋' },
  ];

  return (
    <>
      <HeaderContainer>
        <Nav>
          <LogoContainer>
            <Logo onClick={() => navigate('/')}>
              揪排球
              <Img src={volleyBall} />
            </Logo>
          </LogoContainer>
          <HamburgerButton onClick={toggleMenu}>
            <MenuIcon />
          </HamburgerButton>
          <MenuItems $isOpen={isMenuOpen}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                $isActive={location.pathname === item.path}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuItems>
        </Nav>
        <UserStatus />
      </HeaderContainer>
      <BlurOverlay $isOpen={isMenuOpen} onClick={toggleMenu} />
    </>
  );
};

export default Header;

const BlurOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease-in-out;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

const HeaderContainer = styled.header`
  position: relative;
  padding: 0px 5px;
  background-color: var(--color-light);
  border: 2px solid var(--color-light);
  display: flex;
  justify-content: space-between;
  height: 70px;
  border-radius: 15px;
  z-index: 2;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 15px 0 20px;
  order: 1;

  @media (max-width: 768px) {
    order: 2;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const Img = styled.img`
  width: 40px;
`;
const MenuItems = styled.ul<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
  order: 2;

  @media (max-width: 768px) {
    position: absolute;
    flex-direction: column;
    top: 68px;
    left: 0;
    width: 100%;
    order: 3;
    z-index: 2;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    max-height: ${({ $isOpen }) => ($isOpen ? '300px' : '0')};
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  }
`;

const MenuItem = styled.div<{ $isActive: boolean }>`
  height: 70px;
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  border-radius: 15px;
  font-size: large;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-secondary)' : 'var(--color-light)'};
  color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--color-dark)')};

  &:hover {
    background-color: var(--color-secondary);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    text-align: center;
    border: 1px solid #eaeaea;
    width: 100%;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  order: 1;

  @media (max-width: 768px) {
    display: block;
  }
`;
