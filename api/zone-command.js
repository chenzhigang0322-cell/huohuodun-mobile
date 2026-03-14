import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0HcoOTO3F3u3jsenhW-wrMjJly_T7CI",
  authDomain: "huohuodun-platform.firebaseapp.com",
  projectId: "huohuodun-platform",
  storageBucket: "huohuodun-platform.firebasestorage.app",
  messagingSenderId: "631961708333",
  appId: "1:631961708333:web:e6701b265d3b40dfa695a4",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const deviceId = String(req.query.deviceId || "HHD001").trim();

    const ref = doc(db, "devices", deviceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return res.status(404).json({
        ok: false,
        message: "device not found",
        deviceId,
      });
    }

    const data = snap.data();

    return res.status(200).json({
      ok: true,
      deviceId,
      zoneCommand: data.zoneCommand || "",
      zoneCommandUpdatedAt: data.zoneCommandUpdatedAt || "",
      zone: data.zone || "",
      updatedAt: data.updatedAt || "",
    });
  } catch (error) {
    console.error("zone-command api error:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "server error",
    });
  }
}