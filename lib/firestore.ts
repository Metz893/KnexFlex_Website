import { collection, addDoc, deleteDoc, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import type { SessionDoc } from "./fileTransfer";
import { serverTimestamp } from "firebase/firestore";

export type CloudSession = {
  id: string;
  userId: string;
  title: string;
  createdAtMs: number;
  createdAt?: any;
  notes?: string;
  tags?: string[];
  samples: { t: number; angle: number }[];
  sampleCount: number;
};

export async function uploadSessionToCloud(userId: string, s: SessionDoc) {
  await addDoc(collection(db, "sessions"), {
    userId,
    title: s.title,
    notes: s.notes ?? "",
    tags: s.tags ?? [],
    createdAt: serverTimestamp(),
    createdAtMs: s.createdAt,
    samples: s.samples,
    sampleCount: s.samples.length,
    device: s.device ?? {},
    format: "knexflex_session_v2",
  });
}

export async function listCloudSessions(userId: string) {
  const q = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const rows: CloudSession[] = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((x) => x.userId === userId)
    .map((x) => ({
      id: x.id,
      userId: x.userId,
      title: x.title ?? "Session",
      notes: x.notes ?? "",
      tags: x.tags ?? [],
      createdAt: x.createdAt,
      createdAtMs: x.createdAtMs ?? Date.now(),
      samples: Array.isArray(x.samples) ? x.samples : [],
      sampleCount: x.sampleCount ?? (Array.isArray(x.samples) ? x.samples.length : 0),
    }));

  return rows;
}

export async function getCloudSession(id: string) {
  const ref = doc(db, "sessions", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const x: any = snap.data();

  return {
    id: snap.id,
    userId: x.userId,
    title: x.title ?? "Session",
    notes: x.notes ?? "",
    tags: x.tags ?? [],
    createdAt: x.createdAt,
    createdAtMs: x.createdAtMs ?? Date.now(),
    samples: Array.isArray(x.samples) ? x.samples : [],
    sampleCount: x.sampleCount ?? (Array.isArray(x.samples) ? x.samples.length : 0),
  } as CloudSession;
}

export async function deleteCloudSession(id: string) {
  await deleteDoc(doc(db, "sessions", id));
}
