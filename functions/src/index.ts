/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const checkAndUpdateEventStatus = functions.pubsub.schedule('every 1 hours').onRun(async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();

  const eventsRef = db.collection('events');
  const query = eventsRef.where('endTimeStamp', '<=', now).where('eventStatus', '==', 'hold');
  
  const snapshot = await query.get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { state: 'closed' });
  });

  await batch.commit();

  console.log(`Updated ${snapshot.size} events to closed state.`);
  return null;
});
