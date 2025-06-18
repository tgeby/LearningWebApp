// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0c4sxT9GOyOV3KIzBjr7iS38LBNg2DDs",
  authDomain: "study-tool-b4548.firebaseapp.com",
  projectId: "study-tool-b4548",
  storageBucket: "study-tool-b4548.firebasestorage.app",
  messagingSenderId: "912102449984",
  appId: "1:912102449984:web:5b81edc7bffa6c030810a5",
  measurementId: "G-916MJRBS28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };