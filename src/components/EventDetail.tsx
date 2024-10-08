import Modal from 'react-modal';
import { useEffect, useState } from 'react';
import type { Event } from '../types';
import { handleUserNameList } from '../firebase';
import { useUserAuth } from '../context/userAuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import CloseIcon from '@mui/icons-material/Close';
import styled from 'styled-components';

interface EventDetailProps {
  isOpen: boolean;
  onRequestClose: () => void;
  event: Event | null;
}

const EventDetail: React.FC<EventDetailProps> = ({
  isOpen,
  onRequestClose,
  event,
}) => {
  const [playerNames, setPlayerNames] = useState<string>('');
  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (event === null) return;
    if (event.playerList) {
      handleUserNameList(event.playerList).then((namesArray) => {
        setPlayerNames(namesArray.filter((name) => name !== '').join(', '));
      });
    }
  }, [event]);

  const handleApply = async () => {
    console.log('eventDetail', { event });
    if (!user) {
      alert('請先登入');
      navigate('/login');
      return;
    }
    if (!event) return;
    if (event.playerList.includes(user?.id)) {
      alert('你已是隊員');
      return;
    }
    if (event.applicationList.includes(user?.id)) {
      alert('你已申請過');
      return;
    }
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

        alert('成功申請');
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Event Details"
      style={{
        overlay: {
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
          position: 'relative', // 添加這行以支持絕對定位的子元素
        },
      }}
    >
      {event && (
        <>
          <CloseIcon
            onClick={onRequestClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              cursor: 'pointer',
            }}
          />
          <EventTitle>{event.court.name}</EventTitle>
          <EventInfo>
            <Label>日期</Label>
            <Value>{event.date}</Value>
          </EventInfo>
          <EventInfo>
            <Label>時間</Label>
            <Value>
              {event.startTimeStamp.toDate().toLocaleTimeString()} ~{' '}
              {event.endTimeStamp.toDate().toLocaleTimeString()}
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
            <Label>費用</Label>
            <Value>{Math.round(event.totalCost / event.findNum)} /人</Value>
          </EventInfo>
          <Divider />
          <EventInfo>
            <Label>友善程度</Label>
            <Value>{event.friendlinessLevel}</Value>
          </EventInfo>
          <EventInfo>
            <Label>分級</Label>
            <Value>{event.level}</Value>
          </EventInfo>
          <Divider />
          <EventInfo>
            <Label>場地</Label>
            <Value>{event.court.isInDoor ? '室內' : '室外'}場  {event.isAC ? '有' : '沒有'}冷氣</Value>
          </EventInfo>
          {/* <EventInfo>
            <Label>室內室外</Label>
            <Value>{event.court.isInDoor ? '室內' : '室外'}</Value>
          </EventInfo>
          <EventInfo>
            <Label>有無冷氣</Label>
            <Value>{event.isAC ? '有' : '沒有'}</Value>
          </EventInfo> */}
          <Divider />
          <EventInfo>
            <Label>隊員名單</Label>
            <Value>{playerNames}</Value>
          </EventInfo>
          <EventInfo>
            <Label>剩餘名額</Label>
            <Value>{event.findNum - event.playerList.length}</Value>
          </EventInfo>
          <ApplyButton onClick={handleApply}>申請加入</ApplyButton>
        </>
      )}
    </Modal>
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
  /* border: none; */
  /* border-top: 1px solid #e0e0e0; */
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
