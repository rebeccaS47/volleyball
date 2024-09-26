import {Timestamp} from 'firebase/firestore';

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
  // endTime: string;
  netHeight: string;
  friendlinessLevel: string;
  level: string;
  isAC: boolean;
  findNum: number;
  totalCost: number;
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
  history: { [key: string]: History };
}

export interface History {
  userId: string;
  eventId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  friendlinessLevel: string;
  level: string;
  grade: number;
  note: string;
}

export interface TeamParticipation {
  date: string;
  startTime: Timestamp;
  endTime: Timestamp;
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
  grade: number;
  note: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface Message{
  roomId: string;
  text: string;
  createdAt: Timestamp;
  user: string;
}