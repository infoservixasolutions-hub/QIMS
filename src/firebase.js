import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTfRY0DC55GKoZNpZMOWakEgOS1XMO9ZA",
  authDomain: "quotation-app-b63d2.firebaseapp.com",
  projectId: "quotation-app-b63d2",
  storageBucket: "quotation-app-b63d2.firebasestorage.app",
  messagingSenderId: "745791505088",
  appId: "1:745791505088:web:27198759df8adeebe6a325",
  measurementId: "G-3G6Z70FVZ6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);