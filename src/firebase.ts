import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from './types';

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
