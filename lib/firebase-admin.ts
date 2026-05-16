import * as admin from 'firebase-admin';
import firebaseConfig from '../firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}

// In Next.js, initializeApp with no credentials will use Application Default Credentials.
export const adminDb = admin.firestore();
adminDb.settings({ databaseId: firebaseConfig.firestoreDatabaseId });
export const adminAuth = admin.auth();
