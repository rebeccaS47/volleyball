import { Timestamp } from 'firebase/firestore';

export interface Court {
  id: string;
  name: string;
  city: string;
  address: string;
  isInDoor: boolean;
  hasAC: boolean;
}

export interface Event {
  id: string;
  court: Court;
  createUserId: string;
  date: string;
  startTime: string;
  duration: number;
  netHeight: string;
  friendlinessLevel: string;
  level: string;
  isAC: boolean;
  findNum: number | '';
  totalCost: number | '';
  averageCost: number;
  notes: string;
  playerList: string[];
  createdEventAt: Timestamp;
  applicationList: string[];
  startTimeStamp: Timestamp;
  endTimeStamp: Timestamp;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imgURL: string;
}

export interface History {
  userId: string;
  eventId: string;
  courtName: string;
  date: string;
  startTimeStamp: Timestamp;
  endTimeStamp: Timestamp;
  friendlinessLevel: string;
  level: string;
  grade: number;
  note: string;
}

export interface TeamParticipation {
  date: string;
  startTimeStamp: Timestamp;
  endTimeStamp: Timestamp;
  eventId: string;
  state: 'pending' | 'accept' | 'decline';
  userId: string;
  courtName: string;
}

export interface Feedback {
  eventId: string;
  userId: string;
  courtName: string;
  friendlinessLevel: string;
  level: string;
  grade: number | '';
  note: string;
  date: string;
  startTimeStamp: Timestamp | null;
  endTimeStamp: Timestamp | null;
}

export interface Option {
  value: string;
  label: string;
}

export interface Message {
  roomId: string;
  text: string;
  createdAt: Timestamp;
  userName: string;
  userId: string;
  userImgURL: string;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  eventId: string;
  state: 'pending' | 'accept' | 'decline';
  userId: string;
}

export interface FilterState {
  city: string;
  court: string;
  date: string;
  startTime: string;
  endTime: string;
  level: string;
}
