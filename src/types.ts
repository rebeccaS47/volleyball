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
  endTime: string;
  netHeight: string;
  friendlinessLevel: string;
  level: string;
  isAC: boolean;
  findNum: number;
  totalCost: number;
  notes: string;
  playerList: string[];
  eventStatus: 'hold' | 'finish';
  createdEventAt: string;
  applicationList: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  history: {[key: string]: History};
}

export interface History {
  id: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  friendlinessLevel: string;
  level: string;
  grade: number;
  note: string;
}