import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import UserStatus from './UserStatus';
import volleyBall from '../assets/volleyball.png';
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
    <HeaderContainer>
      <Nav>
        <LogoContainer>
          <Logo onClick={() => navigate('/')}>
            揪排球
            <img src={volleyBall} style={{ width: '40px' }} />
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
  );
};

export default Header;

const HeaderContainer = styled.header`
  background-color: var(--color-light);
  border: 2px solid var(--color-light);
  /* padding: 10px 0px; */
  border-radius: 15px;
  @media (max-width: 768px) {
    display: flex;
    height: 70px;
  }
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
  /* height: 70px; */
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const MenuItems = styled.ul<{ $isOpen: boolean }>`
  display: flex;
  list-style-type: none;
  margin: 0;
  padding: 0;
  order: 2;

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 90px;
    left: 0;
    width: 100%;
    /* background-color: var(--color-light); */
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    order: 3;
    z-index: 2;
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
  /* text-shadow: ${({ $isActive }) =>
    $isActive ? '1px 1px 2px #aaa, -1px -1px 2px #aaa' : ''}; */

  &:hover {
    background-color: var(--color-secondary);
  }

  @media (max-width: 768px) {
    margin: 0px 15px;
    padding: 1rem;
    text-align: center;
    border: 1px solid #eaeaea;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  order: 1;

  @media (max-width: 768px) {
    display: block;
  }
`;
