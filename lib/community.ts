import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function shareAnonymously(data: {
  averageCycle: number[];
  injury: string;
  weeksSinceInjury: number;
  leg: "left" | "right";
}) {
  await addDoc(collection(db, "community_gait"), {
    ...data,
    createdAt: new Date(),
  });
}
