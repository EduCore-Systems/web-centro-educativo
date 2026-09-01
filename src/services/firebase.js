import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCcvsPsIkpMTl87LlnhbdaCrwhdxUXVmRw',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'educore-systems-dd8a3.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'educore-systems-dd8a3',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'educore-systems-dd8a3.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '34032202235',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:34032202235:web:d55794496203dda8555b5e',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// COMENTADO PARA CONECTAR A LA NUBE REAL:
// if (import.meta.env.DEV || window.location.hostname === 'localhost') {
//   console.log("Conectando a Emuladores locales de Firebase (Auth port 9099, Firestore port 8080)...");
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//   connectFirestoreEmulator(db, '127.0.0.1', 8080);
// }
