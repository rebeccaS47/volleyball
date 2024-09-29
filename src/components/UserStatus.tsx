import { useState } from 'react';
import { useUserAuth } from '../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Link,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Logout } from '@mui/icons-material';

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

  const handleClickProfile = () => {
    navigate('/user');
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {user ? (
        <>
          <Typography variant="subtitle1">Hi, {user.name}</Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar src={user.imgURL} alt={user.name} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  width: 150,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClickProfile}>
              <Avatar /> &nbsp;&nbsp;Profile
            </MenuItem>
            <MenuItem onClick={logOut}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              &nbsp;&nbsp;Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Link href="/login" underline="none" color="primary">
          Login
        </Link>
      )}
    </Box>
  );
};

export default UserStatus;
