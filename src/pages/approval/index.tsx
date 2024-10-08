import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig.ts';
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
import type { Event, History } from '../../types.ts';
import { findUserById } from '../../firebase.ts';
import HistoryDetail from '../../components/HistoryDetail.tsx';
import styled from 'styled-components';

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
    const q = query(eventsRef, where('createUserId', '==', user.id));

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
    <TableWrapper>
      <StyledTable>
        <thead>
          <StyledTr>
            <StyledTh>活動時間</StyledTh>
            <StyledTh>活動地點</StyledTh>
            <StyledTh>申請人</StyledTh>
            <StyledTh>平均分數</StyledTh>
            <StyledTh>決定</StyledTh>
          </StyledTr>
        </thead>
        <tbody>
          {eventList.flatMap((event) =>
            event.applicationList.length > 0
              ? event.applicationList.map((applicantId, index) => (
                  <StyledTr key={`${event.id}-${index}`}>
                    {index === 0 && (
                      <>
                        <StyledTd rowSpan={event.applicationList.length}>
                          {event.date}
                          {/* {" "}{event.startTimeStamp.toDate().toLocaleTimeString() } */}
                            {/* '~' +
                            event.endTimeStamp.toDate().toLocaleTimeString()} */}
                        </StyledTd>
                        <StyledTd rowSpan={event.applicationList.length}>
                          {event.court.name}
                        </StyledTd>
                      </>
                    )}
                    <StyledTd>
                      {applicantData[applicantId]?.name || 'Loading...'}
                    </StyledTd>
                    <StyledTd>
                      {calculateAverageGrade(
                        historyData[applicantId] || []
                      ).toFixed(2)}
                      <HistoryDetail
                        userHistory={historyData[applicantId] || []}
                      />
                    </StyledTd>
                    <StyledTd>
                      <AcceptButton
                        onClick={() => handleAccept(applicantId, event.id)}
                      >
                        接受
                      </AcceptButton>
                      <DeclineButton
                        onClick={() => handleDecline(applicantId, event.id)}
                      >
                        拒絕
                      </DeclineButton>
                    </StyledTd>
                  </StyledTr>
                ))
              : []
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default Approval;

const TableWrapper = styled.div`
  padding: 32px 0px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 600px) {
    padding: 10px 0px;
  }
`;

const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 800px;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px;
  /* background-color: #f2f2f2; */
  /* border-bottom: 2px dashed #ffc100; */
  border-bottom: 2px dashed;
  border-image: repeating-linear-gradient(
      to right,
      #0080cc 0,
      #0080cc 8px,
      transparent 8px,
      transparent 25px
    )
    1 20;
  white-space: nowrap;
  font-size: 24px;
`;

const StyledTd = styled.td`
  text-align: left;
  padding: 8px;
  position: relative;
  white-space: nowrap;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -1px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-image: linear-gradient(
      to bottom,
      #0080cc 50%,
      rgba(255, 255, 255, 0) 50%
    );
    background-position: center;
    background-size: 2px 25px;
    background-repeat: repeat-y;
  }
`;

const StyledTr = styled.tr`
  ${StyledTd} {
    border-bottom: 2px dashed;
    border-image: repeating-linear-gradient(
        to right,
        #0080cc 0,
        #0080cc 8px,
        transparent 8px,
        transparent 25px
      )
      1 20;
  }
`;

const Button = styled.button`
  padding: 5px 10px;
  margin: 2px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

const AcceptButton = styled(Button)`
  background-color: #ffc100;
  color: white;
`;

const DeclineButton = styled(Button)`
  /* background-color: #0086d6; */
  background-color: #ffc100;
  color: white;
`;
