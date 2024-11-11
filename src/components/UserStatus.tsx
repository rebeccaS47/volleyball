import { Logout } from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import LoginIcon from '@mui/icons-material/Login';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserAuth } from '../context/userAuthContext.tsx';

const UserStatus: React.FC = () => {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container>
      {user ? (
        <UserContainer>
          <IconButton
            size="large"
            aria-label="show 4 new mails"
            onClick={() => {
              navigate('/chat');
            }}
          >
            <Badge badgeContent={0} color="error">
              <ChatIcon />
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <StyledAvatar src={user.imgURL} alt={user.name} />
          </IconButton>

          <StyledMenu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                navigate('/user');
              }}
            >
              <Avatar /> &nbsp;&nbsp;個人頁面
            </MenuItem>
            <MenuItem onClick={logOut}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              &nbsp;&nbsp;登出
            </MenuItem>
          </StyledMenu>
        </UserContainer>
      ) : (
        <LoginContainer>
          <LoginIcon />
          <LoginLink to="/login">登入</LoginLink>
        </LoginContainer>
      )}
    </Container>
  );
};

export default UserStatus;

const Container = styled(Box)`
  display: flex;
  align-items: center;
`;

const UserContainer = styled(Box)`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  border: 3px solid white;
`;

const LoginContainer = styled(Box)`
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 50px;
  margin-right: 5px;
`;

const LoginLink = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: 5px;
  height: 1.5rem;
  color: black;
  font-size: large;
`;

const StyledMenu = styled(Menu)`
  .MuiPaper-root {
    overflow: visible;
    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.32));
    margin-top: 1.5px;
    width: 150px;

    .MuiAvatar-root {
      width: 32px;
      height: 32px;
      margin-left: -0.5px;
      margin-right: 1px;
    }

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 20px;
      width: 10px;
      height: 10px;
      background-color: #fff;
      transform: translateY(-50%) rotate(45deg);
      z-index: 0;
    }
  }
`;
