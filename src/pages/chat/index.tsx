import { ArrowLeft } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useUserAuth } from '../../context/userAuthContext';
import {
  addChatMessage,
  listenToMessages,
  listenToTeamParticipations,
} from '../../firebase.ts';
import type { Message, TeamParticipation } from '../../types';

const Chat: React.FC = () => {
  const { user } = useUserAuth();
  const [groupChats, setgroupChats] = useState<TeamParticipation[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToTeamParticipations(
      user.id,
      (participations) => {
        setgroupChats(participations);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) return;

    const unsubscribe = listenToMessages(selectedEventId, (messages) => {
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedEventId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedEventId) return;

    await addChatMessage(newMessage, user, selectedEventId);
    setNewMessage('');
  };

  const handleGroupChatSelect = async (eventId: string) => {
    setSelectedEventId(eventId);
    if (isMobile) {
      setShowChatWindow(true);
    }
  };

  return (
    <ChatContainer>
      {(!isMobile || (isMobile && !showChatWindow)) && (
        <>
          <GroupList>
            {groupChats.map((groupChat) => (
              <GroupItem
                key={groupChat.eventId}
                $selected={selectedEventId === groupChat.eventId}
                onClick={() => handleGroupChatSelect(groupChat.eventId)}
              >
                <EventDate>{groupChat.date}</EventDate>
                <EventTime>
                  {groupChat.startTimeStamp.toDate().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {groupChat.endTimeStamp.toDate().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </EventTime>
                <CourtName>{groupChat.courtName}</CourtName>
              </GroupItem>
            ))}
          </GroupList>
          {!selectedEventId && !isMobile && (
            <EmptyStateMessage>請選擇左側任一聊天室...</EmptyStateMessage>
          )}
        </>
      )}
      {selectedEventId && (!isMobile || (isMobile && showChatWindow)) && (
        <ChatWindow>
          <ChatHeader>
            {isMobile && (
              <BackButton
                onClick={() => {
                  setShowChatWindow(false);
                }}
              >
                <ArrowLeft />
              </BackButton>
            )}
            聊天室
          </ChatHeader>
          <MessageList>
            {messages.map((message, index) => (
              <MessageBubble key={index} $isUser={message.userId === user?.id}>
                <UserImage
                  src={message.userImgURL}
                  alt={message.userName}
                  $isUser={message.userId === user?.id}
                />
                <div>
                  {message.userId !== user?.id && (
                    <OthersName>{message.userName}</OthersName>
                  )}
                  <MessageContent $isUser={message.userId === user?.id}>
                    {message.text}
                  </MessageContent>
                  <Timestamp $isUser={message.userId === user?.id}>
                    {message.createdAt?.toDate().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Timestamp>
                </div>
              </MessageBubble>
            ))}
          </MessageList>
          <ChatForm onSubmit={handleSubmit}>
            <ChatInput
              type="text"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder="請輸入..."
            />
            <SendButton type="submit">傳送</SendButton>
          </ChatForm>
        </ChatWindow>
      )}
    </ChatContainer>
  );
};

export default Chat;

const ChatContainer = styled.div`
  display: flex;
  height: 85vh;
  min-width: 300px;
  margin-top: 20px;
`;

const GroupList = styled.div`
  min-width: 300px;
  padding: 10px;
  overflow-y: auto;

  @media (max-width: 600px) {
    margin: 0px auto;
    width: 100%;
  }
`;

const GroupItem = styled.div<{ $selected: boolean }>`
  padding: 10px;
  background-color: ${(props) => (props.$selected ? '#e9ebee' : 'white')};
  cursor: pointer;
  border-bottom: 1px solid darkgray;

  &:hover {
    background-color: #f5f6f7;
  }
`;

const EventDate = styled.p`
  padding: 10px 5px;
  font-weight: 700;
  font-size: 20px;
`;

const EventTime = styled.p`
  padding: 5px;
`;

const CourtName = styled.p`
  padding: 5px;
`;

const EmptyStateMessage = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatWindow = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dddfe2;
  border-radius: 8px;
  margin: 10px;

  @media (max-width: 600px) {
    margin: 0px;
    border-radius: 15px;
  }
`;

const ChatHeader = styled.div`
  padding: 10px 16px;
  background-color: #f5f6f7;
  border-bottom: 1px solid #dddfe2;
  font-weight: bold;
  display: flex;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  @media (max-width: 600px) {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 10px;
`;

const MessageList = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  display: flex;
  margin-bottom: 10px;
  flex-direction: ${(props) => (props.$isUser ? 'row-reverse' : 'row')};
`;

const OthersName = styled.div`
  font-size: 0.8em;
  color: #8e8e8e;
`;

const UserImage = styled.img<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: fill;
  margin: ${(props) => (props.$isUser ? '0 0 0 10px' : '0 10px 0 0')};
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  margin-left: auto;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  width: fit-content;
  min-height: auto;
  padding: 8px 12px;
  border-radius: 18px;
  background-color: ${(props) =>
    props.$isUser ? 'var(--color-secondary)' : '#f1f0f0'};
  margin-left: ${(props) => (props.$isUser ? 'auto' : '0px')};
  color: ${(props) => (props.$isUser ? 'white' : 'black')};
`;

const Timestamp = styled.div<{ $isUser: boolean }>`
  font-size: 0.8em;
  color: #8e8e8e;
  margin-top: 4px;
  text-align: ${(props) => (props.$isUser ? 'right' : 'left')};
`;

const ChatForm = styled.form`
  display: flex;
  padding: 10px;
  border-top: 1px solid #dddfe2;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 8px 20px;
  border: 1px solid #dddfe2;
  border-radius: 20px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background-color: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background-color: #0077e5;
  }
`;
