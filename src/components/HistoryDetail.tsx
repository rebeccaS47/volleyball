import { useState } from 'react';
import type { History } from '../types';
import Modal from 'react-modal';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

const HistoryDetail: React.FC<{ userHistory: History[] }> = ({
  userHistory,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const hasHistory = Object.keys(userHistory).length > 0;
  return (
    <>
      <button onClick={() => setModalIsOpen(true)} style={{display: 'flex', alignItems: 'flex-end'
      }}>點擊看更多
        <ManageSearchIcon />
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="歷史記錄詳情"
        style={customModalStyles}
      >
        <h2>過往詳細記錄</h2>
        {hasHistory ? (
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>地點</th>
                {/* <th>時間</th> */}
                <th>友善度</th>
                <th>等級</th>
                <th>評分</th>
                <th>備註</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(userHistory).map(([key, item]) => (
                <tr key={key}>
                  <td>{item.date}</td>
                  <td>{item.courtName}</td>
                  {/* <td>
                    {item.startTimeStamp.toDate().toLocaleTimeString()}
                    {item.endTimeStamp.toDate().toLocaleTimeString()}
                  </td> */}
                  <td>{item.friendlinessLevel}</td>
                  <td>{item.level}</td>
                  <td>{item.grade}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>還未有任何紀錄</p>
        )}
        <br />
        <center>
          <button onClick={() => setModalIsOpen(false)}>關閉</button>
        </center>
      </Modal>
    </>
  );
};
export default HistoryDetail;

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '80%',
    maxHeight: '80%',
    overflow: 'auto',
  },
};
