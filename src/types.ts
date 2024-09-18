export interface UserLogIn {
  email: string;
  password: string;
}

export interface UserSignIn {
  email: string;
  password: string;
  confirmPassword: string;
}

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
