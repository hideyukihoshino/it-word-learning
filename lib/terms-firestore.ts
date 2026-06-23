// Firestore への用語データ追加・取得操作
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import { Term } from './terms'

// Firestoreに保存する型（idはFirestore自動生成）
export type TermInput = Omit<Term, 'id'>

// 新しい用語をFirestoreに追加する（10秒タイムアウト付き）
export async function addTermToFirestore(termInput: TermInput): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('接続タイムアウト（10秒）。Firestoreに接続できませんでした。')), 10000)
  )
  const addPromise = addDoc(collection(db, 'terms'), {
    ...termInput,
    createdAt: Timestamp.now(),
  })
  const docRef = await Promise.race([addPromise, timeoutPromise])
  return docRef.id
}

// FirestoreからすべてのFirestore追加用語を取得する
export async function getTermsFromFirestore(): Promise<Term[]> {
  const q = query(collection(db, 'terms'), orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as TermInput),
  }))
}
