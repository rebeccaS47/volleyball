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
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import type {
  User,
  Event,
  Feedback,
  Court,
  Option,
  ApplicantData,
  History,
} from './types';

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

export const createEvent = async (formData: Event): Promise<void> => {
  const [year, month, day] = formData.date.split('-').map(Number);
  const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
  const startDate = new Date(year, month - 1, day, startHours, startMinutes);
  const startTimeStamp = Timestamp.fromDate(startDate);
  const endDate = new Date(
    startDate.getTime() + formData.duration * 60 * 60 * 1000
  );
  const endTimeStamp = Timestamp.fromDate(endDate);

  const totalParticipants =
    Number(formData.findNum) + formData.playerList.length + 1;
  const averageCost =
    totalParticipants > 0
      ? Math.round(Number(formData.totalCost) / totalParticipants)
      : 0;

  const eventCollectionRef = collection(db, 'events');
  const docRef = await addDoc(eventCollectionRef, {
    ...formData,
    createdEventAt: serverTimestamp(),
    applicationList: [],
    playerList: [formData.createUserId, ...formData.playerList],
    startTimeStamp,
    endTimeStamp,
    averageCost,
  });

  await updateDoc(docRef, { id: docRef.id });

  await Promise.all(
    [formData.createUserId, ...formData.playerList].map(async (playerId) => {
      const participationRef = doc(
        db,
        'teamParticipation',
        `${docRef.id}_${playerId}`
      );
      await setDoc(participationRef, {
        eventId: docRef.id,
        userId: playerId,
        courtName: formData.court.name,
        state: 'accept',
        date: formData.date,
        startTimeStamp,
        endTimeStamp,
      });
    })
  );
};

export const fetchDropdownCities = async (): Promise<
  { value: string; label: string }[]
> => {
  const courtsRef = collection(db, 'courts');
  const snapshot = await getDocs(courtsRef);
  const allCourts: Court[] = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Court)
  );
  const uniqueCities = Array.from(
    new Set(allCourts.map((court) => court.city))
  );
  return uniqueCities.map((city) => ({ value: city, label: city }));
};

export const fetchDropdownCourts = async (
  selectedCity: Option | null
): Promise<Option[]> => {
  if (!selectedCity) {
    return [];
  }

  const courtsRef = collection(db, 'courts');
  const snapshot = await getDocs(courtsRef);
  const allCourts: Court[] = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Court)
  );

  const filteredCourts = allCourts.filter(
    (court) => court.city === selectedCity.value
  );

  return filteredCourts.map((court) => ({
    value: court.id,
    label: court.name,
  }));
};

export const fetchCourtDetails = async (
  courtId: string
): Promise<Court | null> => {
  const courtRef = doc(db, 'courts', courtId);
  const courtDoc = await getDoc(courtRef);

  if (courtDoc.exists()) {
    return { id: courtDoc.id, ...courtDoc.data() } as Court;
  }

  return null;
};

export const fetchHomeEventList = (onSuccess: (events: Event[]) => void) => {
  const eventCollectionRef = collection(db, 'events');
  const now = Timestamp.now();
  const q = query(
    eventCollectionRef,
    where('startTimeStamp', '>=', now),
    orderBy('date', 'asc'),
    orderBy('startTimeStamp', 'asc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const filteredData = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Event[];
    onSuccess(filteredData);
  });

  return unsubscribe;
};

export const listenToNeedApprovalEvents = (
  userId: string,
  setEventList: (events: Event[]) => void,
  setApplicantData: (data: { [key: string]: ApplicantData }) => void,
  setHistoryData: (data: { [key: string]: History[] }) => void,
  setLoading: (loading: boolean) => void
) => {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('createUserId', '==', userId));

  return onSnapshot(q, async (querySnapshot) => {
    const events: Event[] = [];
    const applicants: Set<string> = new Set();
    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() } as Event;
      events.push(event);
      event.applicationList.forEach((applicantId) =>
        applicants.add(applicantId)
      );
    });

    setEventList(events);

    try {
      const applicantDataPromises = Array.from(applicants).map(
        async (applicantId) => {
          const applicantUser = await findUserById(applicantId);
          if (applicantUser) {
            return {
              id: applicantId,
              name: applicantUser.name,
            };
          }
          return null;
        }
      );

      const historyPromises = Array.from(applicants).map(
        async (applicantId) => {
          const historyRef = collection(db, 'history');
          const historyQuery = query(
            historyRef,
            where('userId', '==', applicantId)
          );
          const historySnapshot = await getDocs(historyQuery);
          const history = historySnapshot.docs.map(
            (doc) => doc.data() as History
          );
          return { id: applicantId, history };
        }
      );

      const [applicantDataResults, historyResults] = await Promise.all([
        Promise.all(applicantDataPromises),
        Promise.all(historyPromises),
      ]);

      const newApplicantData = applicantDataResults.reduce((acc, result) => {
        if (result) {
          acc[result.id] = {
            name: result.name,
          };
        }
        return acc;
      }, {} as { [key: string]: ApplicantData });

      const newHistoryData = historyResults.reduce((acc, result) => {
        acc[result.id] = result.history;
        return acc;
      }, {} as { [key: string]: History[] });

      setApplicantData(newApplicantData);
      setHistoryData(newHistoryData);

      console.log('監聽到的 events:', events);
      console.log('申請者資料:', newApplicantData);
      console.log('歷史數據:', newHistoryData);
    } catch (error) {
      console.error('獲取資料時出錯:', error);
    } finally {
      setLoading(false);
    }
  });
};

export const acceptApplicant = async (
  applicant: string,
  eventId: string,
  findNum: number
) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      applicationList: arrayRemove(applicant),
      playerList: arrayUnion(applicant),
      findNum: typeof findNum === 'number' ? findNum - 1 : 0,
    });

    const participationRef = doc(
      db,
      'teamParticipation',
      `${eventId}_${applicant}`
    );
    await updateDoc(participationRef, {
      state: 'accept',
    });
  } catch (error) {
    console.error('更新參與狀態時發生錯誤:', error);
    throw error;
  }
};

export const declineApplicant = async (applicant: string, eventId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      applicationList: arrayRemove(applicant),
    });

    const participationRef = doc(
      db,
      'teamParticipation',
      `${eventId}_${applicant}`
    );
    await updateDoc(participationRef, {
      state: 'decline',
    });
  } catch (error) {
    console.error('更新參與狀態時發生錯誤:', error);
    throw error;
  }
};
