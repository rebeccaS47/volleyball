import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import type { Event, History } from '../../types';
import { findUserById } from '../../firebase';
import HistoryDetail from '../../components/HistoryDetail';

interface ApplicantData {
  name: string;
}

interface ApprovalProps {}

const Approval: React.FC<ApprovalProps> = () => {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [applicantData, setApplicantData] = useState<{
    [key: string]: ApplicantData;
  }>({});
  const [historyData, setHistoryData] = useState<{
    [key: string]: History[];
  }>({});

  const { user } = useUserAuth();

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('createUserId', '==', user.uid),
      where('eventStatus', '==', 'hold')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
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
    });

    return () => unsubscribe();
  }, [user]);

  const calculateAverageGrade = (history: History[]): number => {
    if (!history || history.length === 0) return 0;

    const grades = history
      .map((item) => item.grade)
      .filter((grade) => !isNaN(grade));
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return grades.length > 0 ? sum / grades.length : 0;
  };

  const handleAccept = async (applicant: string, eventId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        applicationList: arrayRemove(applicant),
        playerList: arrayUnion(applicant),
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
  const handleDecline = async (applicant: string, eventId: string) => {
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

  return (
    <div>
      <h1>Approval</h1>
      <table border={1}>
        <thead>
          <tr>
            <th>Event 時間</th>
            <th>Event 地點</th>
            <th>申請人</th>
            <th>平均分數</th>
            <th>接受</th>
            <th>拒絕</th>
          </tr>
        </thead>
        <tbody>
          {eventList.flatMap((event) =>
            event.applicationList.length > 0
              ? event.applicationList.map((applicantId, index) => (
                  <tr key={`${event.id}-${index}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={event.applicationList.length}>
                          {event.date +
                            ' ' +
                            event.startTime +
                            '~' +
                            event.endTime}
                        </td>
                        <td rowSpan={event.applicationList.length}>
                          {event.court.name}
                        </td>
                      </>
                    )}
                    <td>{applicantData[applicantId]?.name || 'Loading...'}</td>
                    <td>
                      {calculateAverageGrade(
                        historyData[applicantId] || []
                      ).toFixed(2)}
                      <br />
                      <HistoryDetail
                        userHistory={historyData[applicantId] || []}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleAccept(applicantId, event.id)}
                      >
                        接受
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDecline(applicantId, event.id)}
                      >
                        拒絕
                      </button>
                    </td>
                  </tr>
                ))
              : []
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Approval;
