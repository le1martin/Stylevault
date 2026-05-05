import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXmdn-InJ5PQD_2I-zJ1vqg1r45WcUuLE",
  authDomain: "stylevault-ff0d9.firebaseapp.com",
  projectId: "stylevault-ff0d9",
  storageBucket: "stylevault-ff0d9.firebasestorage.app",
  messagingSenderId: "407404326036",
  appId: "1:407404326036:web:c56a00092218999a8a1881",
  measurementId: "G-TPC4FZE971"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();