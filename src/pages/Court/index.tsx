import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import { getDocs, collection } from 'firebase/firestore';
import type { Court } from '../../types';

interface CourtProps {}

const Court: React.FC<CourtProps> = () => {
  const [courtList, setCourtList] = useState<Court[]>([]);

  const getCourtList = useCallback(async () => {
    try {
      const courtCollectionRef = collection(db, 'courts');
      const data = await getDocs(courtCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Court[];
      setCourtList(filteredData);
      console.log(filteredData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getCourtList();
  }, [getCourtList]);

  return (
    <>
      <h1>Court</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {courtList.map((court) => (
          <div
            key={court.id}
            style={{
              border: '1px solid black',
              padding: '10px',
              width: '350px',
              margin: '10px',
            }}
          >
            <h2>{court.name}</h2>
            <p>
              {court.city}
              {court.address}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Court;
