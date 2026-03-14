import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0HcoOTO3F3u3jsenhW-wrMjJly_T7CI",
  authDomain: "huohuodun-platform.firebaseapp.com",
  projectId: "huohuodun-platform",
  storageBucket: "huohuodun-platform.firebasestorage.app",
  messagingSenderId: "631961708333",
  appId: "1:631961708333:web:e6701b265d3b40dfa695a4",
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});