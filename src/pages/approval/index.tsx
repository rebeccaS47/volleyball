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
import { SyncLoader } from 'react-spinners';

interface ApplicantData {
  name: string;
}

interface ApprovalProps {}

const Approval: React.FC<ApprovalProps> = () => {
  const [loading, setLoading] = useState(true);
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

  const handleAccept = async (
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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <SyncLoader
          margin={10}
          size={20}
          speedMultiplier={0.8}
          color="var(--color-secondary)"
        />
      </div>
    );
  }

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
        <Tbody>
          {Object.keys(applicantData).length === 0 ? (
            <StyledTr>
              <StyledTd
                colSpan={5}
                style={{
                  textAlign: 'center',
                  padding: '32px',
                  fontSize: '20px',
                }}
              >
                暫無待審核資料
              </StyledTd>
            </StyledTr>
          ) : (
            eventList.flatMap((event) =>
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
                          onClick={() =>
                            handleAccept(
                              applicantId,
                              event.id,
                              Number(event.findNum)
                            )
                          }
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
            )
          )}
        </Tbody>
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
  width: 100%;
  min-width: 800px;
`;

const Tbody = styled.tbody`
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 16px;
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
  padding: 8px 16px;
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
      #262626 50%,
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
        #262626 0,
        #262626 8px,
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 10px 16px;
  background-color: var(--color-secondary);
  color: var(--color-dark);
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
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

const DeclineButton = styled(Button)`
  margin-top: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  padding: 10px 16px;
  background-color: var(--color-primary);
  color: var(--color-light);
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  border: 2px solid var(--color-dark);
  border-radius: 14px;
  box-shadow: -4px 3px 0 0 var(--color-dark);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: -2px 1px 0 0 var(--color-dark);
    background-color: var(--color-light);
    color: var(--color-dark);
    transform: translateY(-2px);
    transform: translateX(-1px);
  }
`;
