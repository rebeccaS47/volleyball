import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext';
import type { TeamParticipation, Message } from '../../types';

interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
  const { user } = useUserAuth();
  const [groupChats, setgroupChats] = useState<TeamParticipation[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = collection(db, 'messages');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'teamParticipation'),
      where('userId', '==', user.id),
      where('state', '==', 'accept')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const participationsData: TeamParticipation[] = [];
      querySnapshot.forEach((doc) => {
        participationsData.push(doc.data() as TeamParticipation);
      });
      setgroupChats(participationsData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) return;

    const queryMessages = query(
      messagesRef,
      where('roomId', '==', selectedEventId),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), roomId: doc.id } as Message);
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedEventId, messagesRef]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newMessage === '') return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: user?.name,
      userImgURL: user?.imgURL,
      roomId: selectedEventId,
    });
    setNewMessage('');
  };

  const handleGroupChatSelect = async (eventId: string) => {
    setSelectedEventId(eventId);
  };

  return (
    <>
      <h1>Chat</h1>
      <div style={{ display: 'flex' }}>
        <div>
          {groupChats.map((groupChat) => (
            <div
              key={groupChat.eventId}
              style={{
                width: '300px',
                margin: '10px',
                cursor: 'pointer',
                backgroundColor:
                  selectedEventId === groupChat.eventId ? 'lightgray' : 'white',
              }}
              onClick={() => handleGroupChatSelect(groupChat.eventId)}
            >
              <p>日期: {groupChat.date}</p>
              <p>
                時間: {groupChat.startTimeStamp.toDate().toLocaleTimeString()} -{' '}
                {groupChat.endTimeStamp.toDate().toLocaleTimeString()}
              </p>
              <p>場地: {groupChat.courtName}</p>
              <p>eventId: {groupChat.eventId}</p>
              <hr />
            </div>
          ))}
        </div>
        <div>
          {selectedEventId && (
            <>
              <p>Group Chat</p>
              <div
                style={{
                  border: '1px solid black',
                  height: '300px',
                  width: '300px',
                  borderRadius: '10px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ flexGrow: 1, padding: '10px' }}>
                  {messages.map((message, index) => (
                    <div key={index}>
                      <strong>{message.user}: </strong>
                      {message.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="new-message-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Type your message here..."
                  />
                  <button type="submit" className="send-button">
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
