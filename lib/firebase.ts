import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD5ntDf4dh1jxXXdkmPr1PD7AMm4aCHufk",
  authDomain: "knexflex-4848a.firebaseapp.com",
  projectId: "knexflex-4848a",
  storageBucket: "knexflex-4848a.firebasestorage.app",
  messagingSenderId: "47610877598",
  appId: "1:47610877598:web:37ae6366ef11d503d18d8f",
};

const app = initializeApp(firebaseConfig);

// 🔑 what we actually need
export const auth = getAuth(app);
export const db = getFirestore(app);
