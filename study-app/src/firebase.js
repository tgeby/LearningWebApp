// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "study-tool-b4548.firebaseapp.com",
  projectId: "study-tool-b4548",
  storageBucket: "study-tool-b4548.firebasestorage.app",
  messagingSenderId: "912102449984",
  appId: "1:912102449984:web:5b81edc7bffa6c030810a5",
  measurementId: "G-916MJRBS28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

//const analytics = getAnalytics(app);

// Initialize user authentication
const auth = getAuth(app);

export { app, auth, db };