import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { memo } from 'react';
import styled from 'styled-components';
import type { Event } from '../types';

const EventCard = memo(
  ({ event, onClick }: { event: Event; onClick: (event: Event) => void }) => (
    <EventCardContainer
      className="autoShow"
      data-eventid={event.id}
      key={event.id}
      onClick={() => onClick(event)}
    >
      <EventTitle>{event.court.name}</EventTitle>
      <EventInfo>
        <CalendarMonthIcon />
        {event.date}
      </EventInfo>
      <EventInfo>
        <AccessTimeIcon />
        {event.startTimeStamp.toDate().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        ~{' '}
        {event.endTimeStamp.toDate().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </EventInfo>
      <EventInfo>
        <AttachMoneyIcon />
        {event.averageCost} /人
      </EventInfo>
      <EventInfoAddress>
        <LocationOnIcon />
        {event.court.city}
        {event.court.address}
      </EventInfoAddress>
    </EventCardContainer>
  )
);

export default EventCard;

const EventCardContainer = styled.div`
  background-color: #f8f8f8;
  box-sizing: content-box;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  width: calc(33.333% - 62px);
  transition: transform 0.3s ease;
  position: relative;
  overflow: visible;
  cursor: pointer;

  &::before,
  &::after,
  & > ::before,
  & > ::after {
    content: '';
    position: absolute;
    width: 2rem;
    height: 2rem;
    border-radius: 12px;
  }

  &::before {
    top: 0;
    left: 0;
    border-bottom-right-radius: 100%;
    background-color: var(--color-secondary);
  }

  &::after {
    top: 0;
    right: 0;
    border-bottom-left-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::before {
    bottom: 0;
    left: 0;
    border-top-right-radius: 100%;
    background-color: var(--color-primary);
  }

  & > ::after {
    bottom: 0;
    right: 0;
    border-top-left-radius: 100%;
    background-color: var(--color-secondary);
  }

  @media (max-width: 1024px) {
    width: calc(50% - 70px);
    padding: 1.5rem 1.8rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem 4rem;
  }

  @media (max-width: 430px) {
    padding: 2rem 2rem;
  }

  @media (max-width: 360px) {
    padding: 2rem 1rem;
  }
  &.autoShow {
    animation: autoShowAnimation both;
    animation-timeline: view(70% 0%);
  }

  @keyframes autoShowAnimation {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.3);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const EventInfo = styled.p`
  padding: 12px 24px 0px;
  font-size: 1.2rem;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: flex-start;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const EventInfoAddress = styled.p`
  padding: 24px 24px 0px;
  font-size: 16px;
  color: gray;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const EventTitle = styled.h3`
  margin: 0px;
  padding: 0px 0px 28px 0px;
  font-size: 2rem;
  text-align: center;
  color: var(--color-dark);
`;
