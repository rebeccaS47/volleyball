import CloseIcon from '@mui/icons-material/Close';
import { Snackbar } from '@mui/material';
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { db } from '../../firebaseConfig';
import { useUserAuth } from '../context/userAuthContext.tsx';
import { handleUserNameList } from '../firebase';
import type { Event } from '../types';

interface EventDetailProps {
  isOpen: boolean;
  onRequestClose: () => void;
  event: Event | null;
  hasApplyBtn: boolean;
}

const EventDetail: React.FC<EventDetailProps> = ({
  isOpen,
  onRequestClose,
  event,
  hasApplyBtn,
}) => {
  const [playerNames, setPlayerNames] = useState<string>('');
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const hasApplied = event?.applicationList.find(
    (applicant) => applicant === user?.id
  );
  const isPlayer = event?.playerList.find((player) => player === user?.id);
  const isFull = event?.findNum === 0;

  useEffect(() => {
    if (event === null) return;
    if (event.playerList) {
      handleUserNameList(event.playerList).then((namesArray) => {
        setPlayerNames(namesArray.filter((name) => name !== '').join(', '));
      });
    }
  }, [event]);

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const handleApply = async () => {
    if (!user) {
      showSnackbar('請先登入');
      navigate('/login');
      return;
    }
    if (!event) return;
    if (event.id) {
      try {
        const docRef = doc(db, 'events', event.id);
        await updateDoc(docRef, {
          applicationList: arrayUnion(user.id),
        });

        const participationRef = doc(
          db,
          'teamParticipation',
          `${event.id}_${user.id}`
        );
        await setDoc(participationRef, {
          eventId: event.id,
          userId: user.id,
          courtName: event.court.name,
          state: 'pending',
          date: event.date,
          startTimeStamp: event.startTimeStamp,
          endTimeStamp: event.endTimeStamp,
        });

        showSnackbar('成功申請');
      } catch (error) {
        console.error('申請失敗: ', error);
        showSnackbar('申請失敗，請稍後再試');
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Event Details"
        style={{
          overlay: {
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            borderRadius: '5px',
            position: 'relative',
          },
        }}
      >
        {event && (
          <>
            <StyledCloseIcon onClick={onRequestClose} />
            <EventTitle>{event.court.name}</EventTitle>
            <EventInfo>
              <Label>日期</Label>
              <Value>{event.date}</Value>
            </EventInfo>
            <EventInfo>
              <Label>時間</Label>
              <Value>
                {event.startTimeStamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ~{' '}
                {event.endTimeStamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Value>
            </EventInfo>
            <EventInfo>
              <Label>地點</Label>
              <Value>
                {event.court.city}
                {event.court.address}
              </Value>
            </EventInfo>
            <EventInfo>
              <Label>場地</Label>
              <Value>
                {event.court.isInDoor ? '室內' : '室外'}場{' '}
                {event.isAC ? '有' : '沒有'}冷氣
              </Value>
            </EventInfo>
            <EventInfo>
              <Label>費用</Label>
              <Value>{event.averageCost}/人</Value>
            </EventInfo>
            <Divider />
            <EventInfo>
              <Label>友善程度</Label>
              <Value>
                {event.friendlinessLevel
                  ? event.friendlinessLevel
                  : '無特別規定'}
              </Value>
            </EventInfo>
            <EventInfo>
              <Label>分級</Label>
              <Value>{event.level ? event.level : '無特別規定'}</Value>
            </EventInfo>
            <Divider />
            <EventInfo>
              <Label>隊員名單</Label>
              <Value>{playerNames}</Value>
            </EventInfo>
            <EventInfo>
              <Label>剩餘名額</Label>
              <Value>{event.findNum}</Value>
            </EventInfo>
            {hasApplyBtn && (
              <>
                {hasApplied ? (
                  <DisabledButton>您已申請，審核中...</DisabledButton>
                ) : isPlayer ? (
                  <DisabledButton>您已是球員</DisabledButton>
                ) : isFull ? (
                  <DisabledButton>名額已滿</DisabledButton>
                ) : (
                  <ApplyButton onClick={handleApply}>申請加入</ApplyButton>
                )}
              </>
            )}
          </>
        )}
      </Modal>
      <StyledSnackbar
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <SnackbarContent>{message}</SnackbarContent>
      </StyledSnackbar>
    </>
  );
};

export default EventDetail;

const EventTitle = styled.h1`
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
`;

const EventInfo = styled.p`
  margin: 10px 0;
  display: flex;
`;

const Label = styled.span`
  width: 100px;
  flex-shrink: 0;
`;

const Value = styled.span`
  flex-grow: 1;
`;

const Divider = styled.br`
  margin: 15px 0;
`;

const ApplyButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  margin-top: 30px;
  background-color: var(--color-secondary);
  color: var(--color-dark);
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
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
`;

const DisabledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  margin-top: 30px;
  background-color: darkgray;
  color: var(--color-light);
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
  border: 2px solid var(--color-dark);
  border-radius: 14px;
  box-shadow: -4px 3px 0 0 var(--color-dark);
  cursor: not-allowed;
`;

const StyledCloseIcon = styled(CloseIcon)(() => ({
  width: '40px',
  height: '40px',
  position: 'absolute',
  top: '15px',
  right: '15px',
  cursor: 'pointer',
  border: '2px solid var(--color-dark)',
  borderRadius: '10px',
  boxShadow: '-2px 2px 0 0 var(--color-dark)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',

  '&:hover': {
    boxShadow: '-2px 1px 0 0 var(--color-dark)',
    backgroundColor: 'var(--color-light)',
    color: 'var(--color-dark)',
    transform: 'translateY(2px) translateX(-1px)',
  },
}));

const StyledSnackbar = styled(Snackbar)`
  &.MuiSnackbar-root {
    z-index: 1400;
  }
`;

const SnackbarContent = styled.div`
  padding: 10px 16px;
  width: 200px;
  border-radius: 4px;
  color: var(--color-dark);
  font-weight: 500;
  background-color: var(--color-light);
`;
