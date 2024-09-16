import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import { getDocs, collection } from 'firebase/firestore';

interface CourtProps {}
interface Court {
  id: string;
  name: string;
  city: string;
  address: string;
  isInDoor: boolean;
  hasAC: boolean;
}

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
    <div>
      <h1>Court</h1>
      {courtList.map((court) => (
        <div key={court.id}>
          <h2>{court.name}</h2>
          <p>{court.city}{court.address}</p>
        </div>
      ))}
    </div>
  );
};

export default Court;
