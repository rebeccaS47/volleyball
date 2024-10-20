import { useState } from 'react';
import type { History } from '../types';
import Modal from 'react-modal';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CloseIcon from '@mui/icons-material/Close';
import styled from 'styled-components';

const HistoryDetail: React.FC<{ userHistory: History[] }> = ({
  userHistory,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setModalIsOpen(true)}>
        <ManageSearchIcon />
        點擊看更多
      </Button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="歷史記錄詳情"
        style={customModalStyles}
      >
        <StyledCloseIcon onClick={() => setModalIsOpen(false)} />
        <TitleText>過往詳細記錄</TitleText>

        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>地點</th>
              <th>友善度</th>
              <th>等級</th>
              <th>評分</th>
              <th>備註</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(userHistory).length === 0 ? (
              <tr>
                <Td
                  colSpan={6}
                >
                  暫無任何紀錄
                </Td>
              </tr>
            ) : (
              Object.entries(userHistory).map(([key, item]) => (
                <tr key={key}>
                  <Td>{item.date}</Td>
                  <Td>{item.courtName}</Td>
                  <Td>{item.friendlinessLevel}</Td>
                  <Td>{item.level}</Td>
                  <Td>{item.grade}</Td>
                  <Td>{item.note}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Modal>
    </>
  );
};
export default HistoryDetail;

const TitleText = styled.p`
  display: flex;
  justify-content: center;
  margin: 16px 12px;
  font-size: 28px;
`;

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

const Td = styled.td`
  text-align: center;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  margin-top: 5px;
  padding: 5px 10px;
  border-radius: 15px;
`;

const StyledCloseIcon = styled(CloseIcon)(() => ({
  width: '50px',
  height: '50px',
  position: 'absolute',
  top: '15px',
  right: '15px',
  cursor: 'pointer',
  border: '2px solid var(--color-dark)',
  borderRadius: '10px',
  boxShadow: '-2px 2px 0 0 var(--color-dark)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',

  '&:hover': {
    boxShadow: '-2px 1px 0 0 var(--color-dark)',
    backgroundColor: 'var(--color-light)',
    color: 'var(--color-dark)',
    transform: 'translateY(2px) translateX(-1px)',
  },
}));
