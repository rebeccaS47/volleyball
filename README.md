# Volleyball Team Matching Platform

This project is a **Volleyball team matching platform** designed for users to create and manage volleyball events, search and apply for teams, handle approvals, and track their activities through a personal calendar. It also includes real-time group chat for team communication. Built with **React**, **TypeScript**, and **Firebase Firestore**, the platform ensures a smooth and efficient experience for volleyball enthusiasts.

## Features

- **Event Creation and Management**: 
  - Users can create volleyball events, specifying details such as location, date, time, and number of participants.
  
- **Event Search and Application**: 
  - Find and apply for events or teams based on filters like location, date, and skill level.
  
- **Approval System**: 
  - Event organizers can review and approve applications for events, managing participants effectively.
  
- **Group Chat**: 
  - Real-time chat functionality allows participants to communicate, share updates, and discuss event details.
 
- **Player Feedback System**: 
  - Event organizers can rate and review participants, with feedback visible during application reviews and in players' profiles.
  
- **Personal Calendar**: 
  - Integrated personal calendar using `react-big-calendar` where users can track their event participation, and status.

- **Protected Routes**: 
  - Access control is implemented with `react-router-dom` to ensure that users can only view or modify the parts of the application they are authorized for.
  
- **React Context API**: 
  - Shared user data across components for smooth and efficient data handling without prop drilling.
  
- **Moment.js**: 
  - Used to handle time conversion issues, ensuring accurate display of event times across different time zones.
  
- **Firebase Firestore (Real-time Subscriptions)**: 
  - Enabled real-time updates for group chat and event participation statuses using Firestore subscriptions.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **Firebase**: A Firebase project is required for Firestore and authentication.
- **npm or yarn: Package manager for installing dependencies.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rebeccaS47/volleyball.git
    ```

2. Navigate to the project directory:

    ```bash
    cd volleyball
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up Firebase Firestore:

    - Create a Firebase project in your Firebase console and configure Firestore.
    - Set up Firebase Authentication for user management.

5. Add a `.env` file with your Firebase configuration:

    ```plaintext
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
    ```

### Running the App

```bash
npm start
```
This will run the app in development mode. 

## Key Technologies

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/) (Protected Routes)
- [Firebase Firestore](https://firebase.google.com/products/firestore) (Real-time subscriptions)
- [Moment.js](https://momentjs.com/) (Time conversions)
- [React-Big-Calendar](https://github.com/jquense/react-big-calendar) (Personal calendar)

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any improvements or bugs.

