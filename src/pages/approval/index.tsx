import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useUserAuth } from '../../context/userAuthContext.tsx';
import type { Event, User } from '../../types';
import { findUserById } from '../../firebase';
import HistoryDetail from '../../components/HistoryDetail';

interface ApplicantData {
  name: string;
  averageGrade: number;
  history: User['history'];
}

interface ApprovalProps {}

const Approval: React.FC<ApprovalProps> = () => {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [applicantData, setApplicantData] = useState<{
    [key: string]: ApplicantData;
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

      const applicantDataPromises = Array.from(applicants).map(
        async (applicantId) => {
          const applicantUser = await findUserById(applicantId);
          if (applicantUser) {
            const averageGrade = calculateAverageGrade(applicantUser.history);
            return {
              id: applicantId,
              name: applicantUser.name,
              averageGrade,
              history: applicantUser.history,
            };
          }
          return null;
        }
      );

      const applicantDataResults = await Promise.all(applicantDataPromises);
      const newApplicantData = applicantDataResults.reduce(
        (acc, result) => {
          if (result) {
            acc[result.id] = {
              name: result.name,
              averageGrade: result.averageGrade,
              history: result.history,
            };
          }
          return acc;
        },
        {} as { [key: string]: ApplicantData }
      );

      setApplicantData(newApplicantData);
      setEventList(events);
      console.log('監聽到的 events:', events);
      console.log('申請者資料ApplicantData:', newApplicantData);
    });

    return () => unsubscribe();
  }, [user]);

  const calculateAverageGrade = (history: User['history']): number => {
    if (!history) return 0;
    const grades = Object.values(history).map((item) => item.grade);
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return grades.length > 0 ? sum / grades.length : 0;
  };

  const handleAccept = async (applicant: string) => {
    console.log(applicant);
  };
  const handleReject = async (applicant: string) => {
    console.log(applicant);
  };

  return (
    <div>
      {eventList.map((event) =>
        event.applicationList.length === 0 ? null : (
          <div key={event.id}>
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
                {event.applicationList.map((applicantId, index) => (
                  <tr key={index}>
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
                      {applicantData[applicantId]?.averageGrade.toFixed(2)}
                      <br />
                      <HistoryDetail
                        userHistory={applicantData[applicantId]?.history || {}}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleAccept(applicantId)}>
                        接受
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleReject(applicantId)}>
                        拒絕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Approval;
