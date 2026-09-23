import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function DebugCreateProfile() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  async function createMyDoc() {
    if (!user?.uid) return;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email ?? "",
      nickname: "Admin",
      phone: "",
      role: "viewer",
      createdAt: serverTimestamp(),
      backfilledAt: serverTimestamp(),
    });

    setMsg("Created/updated users/{uid} profile doc ✅");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Debug: Create Profile Doc</h2>
      <p>UID: {user?.uid}</p>
      <button onClick={createMyDoc}>Create My Firestore User Doc</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
