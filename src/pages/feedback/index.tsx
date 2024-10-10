import { useState, useEffect } from 'react';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import { db } from '../../../firebaseConfig.ts';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { findUserById } from '../../firebase.ts';
import type { Event, Feedback } from '../../types.ts';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  SelectChangeEvent,
  ThemeProvider,
  createTheme,
  Snackbar,
} from '@mui/material';
import styled from 'styled-components';

interface FeedbackProps {}

interface UserName {
  id: string;
  name: string;
}
const Feedback: React.FC<FeedbackProps> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [closedEvents, setClosedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserAuth();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    eventId: '',
    userId: '',
    courtName: '',
    friendlinessLevel: '',
    level: '',
    grade: '',
    note: '',
    date: '',
    startTimeStamp: null,
    endTimeStamp: null,
  });

  const [userNames, setUserNames] = useState<UserName[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClosedEvents = async () => {
      if (!user) return;
      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('createUserId', '==', user.id),
          where('endTimeStamp', '<', Timestamp.now())
        );

        const querySnapshot = await getDocs(q);
        const fetchedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push({ id: doc.id, ...doc.data() } as Event);
        });

        setClosedEvents(fetchedEvents);
        console.log('closedEvent: ', fetchedEvents);
      } catch (err) {
        setError(
          'Error fetching events: ' +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClosedEvents();
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      fetchUserNames(selectedEvent.playerList);
    }
  }, [selectedEvent]);

  const fetchUserNames = async (userIds: string[]) => {
    setLoadingNames(true);
    try {
      const names = await Promise.all(
        userIds.map(async (id) => {
          const user = await findUserById(id);
          return { id, name: user ? user.name : 'Unknown User' };
        })
      );
      setUserNames(names);
      console.log('搜到名字', names);
    } catch (error) {
      console.error('Error fetching user names:', error);
    } finally {
      setLoadingNames(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedPlayer(null);
    resetFeedbackForm(event);
    setActiveStep(1);
  };

  const handlePlayerClick = (player: string) => {
    setSelectedPlayer(player);
    if (selectedEvent) {
      resetFeedbackForm(selectedEvent, player);
    }
    setActiveStep(2);
  };

  const resetFeedbackForm = async (event: Event, player: string = '') => {
    const initialFeedback = {
      eventId: event.id,
      userId: player,
      courtName: event.court.name,
      friendlinessLevel: '',
      level: '',
      grade: '',
      note: '',
      date: event.date,
      startTimeStamp: event.startTimeStamp,
      endTimeStamp: event.endTimeStamp,
    };

    setFeedback(initialFeedback as Feedback);

    if (player) {
      try {
        const docRef = doc(db, 'history', `${event.id}_${player}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeedback({
            ...initialFeedback,
            friendlinessLevel: data.friendlinessLevel || '',
            level: data.level || '',
            grade: data.grade || '',
            note: data.note || '',
          });
        }
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    }
  };

  const handleFeedbackChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;

    setFeedback((prev) => ({
      ...prev,
      [name]: name === 'grade' ? (value === '' ? '' : parseInt(value)) : value,
    }));
  };

  const handleSubmitFeedback = async () => {
    if (!selectedEvent || !selectedPlayer) return;
    try {
      const feedbackDocRef = doc(
        db,
        'history',
        `${selectedEvent.id}_${selectedPlayer}`
      );
      await setDoc(feedbackDocRef, { ...feedback });

      showSnackbar('回饋提交成功！');
      setSelectedPlayer(null);
      setActiveStep(0);
      if (selectedEvent) {
        resetFeedbackForm(selectedEvent);
      }
    } catch (error) {
      console.error('提交回饋時出錯:', error);
      showSnackbar('提交回饋失敗。請再試一次。');
    }
  };

  const steps = [
    {
      label: '選擇其中一場次',
      content: (
        <Box>
          {closedEvents.length > 0
            ? closedEvents.map((event) => (
                <Button
                  key={event.id}
                  variant="outlined"
                  onClick={() => handleEventClick(event)}
                  sx={{
                    margin: '5px',
                    backgroundColor:
                      selectedEvent?.id === event.id
                        ? 'rgba(241, 183, 9, 0.3)'
                        : 'transparent',
                    color: 'var(--color-dark)',
                    '&:hover': {
                      backgroundColor:
                        selectedEvent?.id === event.id
                          ? 'transparent'
                          : 'rgba(241, 183, 9, 0.3)',
                    },
                  }}
                >
                  {event.date} {event.court.name}
                </Button>
              ))
            : '目前還無任何已結束的活動'}
        </Box>
      ),
    },
    {
      label: '選擇其中一隊員',
      content: (
        <Box>
          {loadingNames ? (
            <Typography>正在加載用戶名稱...</Typography>
          ) : (
            userNames
              .filter((item) => item.id !== user?.id)
              .map((user) => (
                <Button
                  key={user.id}
                  variant="outlined"
                  onClick={() => handlePlayerClick(user.id)}
                  sx={{
                    margin: '5px',
                    backgroundColor:
                      selectedPlayer === user.id
                        ? 'rgba(241, 183, 9, 0.3)'
                        : 'transparent',
                    '&:hover': {
                      backgroundColor:
                        selectedPlayer === user.id
                          ? 'gba(241, 183, 9, 0.3r)'
                          : 'transparent',
                    },
                  }}
                >
                  {user.name}
                </Button>
              ))
          )}
        </Box>
      ),
    },
    {
      label: '填寫回饋',
      content: (
        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          <FormControl fullWidth margin="normal">
            <InputLabel>友善程度 *</InputLabel>
            <Select
              name="friendlinessLevel"
              label="友善程度 *"
              value={feedback.friendlinessLevel}
              onChange={handleFeedbackChange}
            >
              {['A', 'B', 'C', 'D', 'E'].map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>技術能力 *</InputLabel>
            <Select
              name="level"
              label="技術能力 *"
              value={feedback.level}
              onChange={handleFeedbackChange}
            >
              {['A', 'B', 'C', 'D', 'E'].map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="分數 *"
            name="grade"
            type="number"
            value={feedback.grade}
            onChange={(e) => {
              const { value } = e.target;
              const regex = /^(100|[1-9][0-9]?|0)$/;
              if (regex.test(value) || value === '') {
                handleFeedbackChange(e);
              }
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="備註"
            name="note"
            multiline
            rows={4}
            value={feedback.note}
            onChange={handleFeedbackChange}
          />
        </Box>
      ),
    },
  ];

  const theme = createTheme({
    palette: {
      primary: {
        main: '#f1b709',
      },
    },
    components: {
      MuiStepIcon: {
        styleOverrides: {
          root: {
            '&.Mui-active': {
              color: '#f1b709',
            },
          },
          text: {
            fill: 'var(--color-light)',
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          label: {
            '&.Mui-active': {
              color: '#f1b709',
            },
            fontSize: '1.2rem',
          },
        },
      },
    },
  });

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            maxWidth: 800,
            m: '32px auto',
            // border: '1px solid rgb(204, 204, 204)',
            // borderRadius: '4px',
            padding: '20px',
          }}
        >
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  {step.content}
                  <Box sx={{ mb: 2 }}>
                    <div style={{ display: 'flex' }}>
                      <ContinueButton
                        variant="contained"
                        onClick={() => {
                          if (index === steps.length - 1) {
                            handleSubmitFeedback();
                          } else {
                            setActiveStep(index + 1);
                          }
                        }}
                        sx={{ mt: 1, mr: 1, ml: 0.5 }}
                        disabled={
                          (index === 0 && !selectedEvent) ||
                          (index === 1 && !selectedPlayer) ||
                          (index === steps.length - 1 &&
                            (!feedback.friendlinessLevel ||
                              !feedback.level ||
                              feedback.grade === ''))
                        }
                      >
                        {index === steps.length - 1 ? '提交回饋' : '繼續'}
                      </ContinueButton>
                      <ReturnButton
                        disabled={index === 0}
                        onClick={() => setActiveStep(index - 1)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        返回
                      </ReturnButton>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </ThemeProvider>
      <StyledSnackbar
        open={open}
        autoHideDuration={800}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SnackbarContent>{message}</SnackbarContent>
      </StyledSnackbar>
    </>
  );
};

export default Feedback;

const ContinueButton = styled(Button)`
  &.MuiButton-root {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 50px;
    padding: 10px 16px;
    background-color: var(--color-secondary);
    color: var(--color-dark);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    border: 2px solid var(--color-dark);
    border-radius: 14px;
    box-shadow: -4px 3px 0 0 var(--color-dark);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      box-shadow: -2px 1px 0 0 var(--color-dark);
      background-color: var(--color-light);
      transform: translateY(-2px);
      transform: translateX(-1px);
    }
  }
`;

const ReturnButton = styled(Button)`
  &.MuiButton-root {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 50px;
    padding: 10px 16px;
    background-color: var(--color-primary);
    color: var(--color-light);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    border: 2px solid var(--color-dark);
    border-radius: 14px;
    box-shadow: -4px 3px 0 0 var(--color-dark);
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      box-shadow: -2px 1px 0 0 var(--color-dark);
      background-color: var(--color-light);
      color: var(--color-dark);
      transform: translateY(-2px);
      transform: translateX(-1px);
    }
  }
`;

const StyledSnackbar = styled(Snackbar)`
  &.MuiSnackbar-root {
    z-index: 1400;
  }
`;

const SnackbarContent = styled.div`
  padding: 10px 16px;
  width: 200px;
  border-radius: 4px;
  font-weight: 500;
  color: var(--color-light);
  background-color: rgb(0 0 0 / 65%);
`;
