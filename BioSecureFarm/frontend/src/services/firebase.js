import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDPcT9e3PQ_rZXoP48yAGtWBOopJCo6ADE',
  authDomain: 'bio-c3085.firebaseapp.com',
  projectId: 'bio-c3085',
  storageBucket: 'bio-c3085.firebasestorage.app',
  messagingSenderId: '645851879567',
  appId: '1:645851879567:web:c2498ec2ef0aef29e3b8fa',
  measurementId: 'G-5Z44J0TYC3'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();