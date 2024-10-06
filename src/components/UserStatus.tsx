import { useState } from 'react';
import { useUserAuth } from '../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import MailIcon from '@mui/icons-material/Mail';

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
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: '2vw',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {user ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{ fontSize: 'large', color: 'var(--color-secondary)' }}
          >
            Hi, {user.name}
          </Typography>
          <IconButton
            size="large"
            aria-label="show 4 new mails"
            sx={{ color: 'var(--color-secondary)'}}
            onClick={() => {
              navigate('/chat');
            }}
          >
            <Badge badgeContent={0} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleClick}
            size="small"
            // sx={{ ml: 2 }}
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
          </Menu>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
          <Typography
            sx={{ fontSize: 'large', color: 'var(--color-secondary)', padding: '12px'}}
          >
            Hi, there
          </Typography>
          <Avatar
            onClick={() => {
              navigate('/login');
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default UserStatus;
