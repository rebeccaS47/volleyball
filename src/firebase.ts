import { db } from '../firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import type { User, Event, Feedback } from './types';

export const handleUserNameList = async (
  playerList: string[]
): Promise<string[]> => {
  const names = await Promise.all(
    playerList.map(async (playerId) => {
      const data = await findUserById(playerId);
      return data ? data.name : '';
    })
  );
  return names;
};

export const findUserById = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user document:', error);
    return null;
  }
};

export const feedbackFetchClosedEvents = async (
  userId: string
): Promise<Event[]> => {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('createUserId', '==', userId),
    where('endTimeStamp', '<', Timestamp.now())
  );

  const querySnapshot = await getDocs(q);
  const fetchedEvents: Event[] = [];
  querySnapshot.forEach((doc) => {
    fetchedEvents.push({ id: doc.id, ...doc.data() } as Event);
  });

  return fetchedEvents;
};

export const submitFeedback = async (
  selectedEventId: string,
  selectedPlayerId: string,
  feedback: Feedback
): Promise<void> => {
  const feedbackDocRef = doc(
    db,
    'history',
    `${selectedEventId}_${selectedPlayerId}`
  );
  await setDoc(feedbackDocRef, { ...feedback });
};

export const getPlayerFeedback = async (
  eventId: string,
  playerId: string
): Promise<Feedback | null> => {
  const docRef = doc(db, 'history', `${eventId}_${playerId}`);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Feedback;
  } else {
    return null;
  }
};
