import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApea3ADtO-Teu19xrxmHatyx9UJJiqmEs",
  authDomain: "felipe-y-karoll.firebaseapp.com",
  projectId: "felipe-y-karoll",
  storageBucket: "felipe-y-karoll.firebasestorage.app",
  messagingSenderId: "737087531240",
  appId: "1:737087531240:web:b0d236f82640a715e4015d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
