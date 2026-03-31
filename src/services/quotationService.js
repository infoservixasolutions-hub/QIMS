import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";


const collectionRef = collection(db, "quotations");

// GET ALL
export const getQuotations = async () => {
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs.map(d => {
    const data = d.data()

    // 🔥 auto-fix old corrupted documents
    const clean = data.quotation ? data.quotation : data

    return {
      id: d.id,
      ...clean
    }
  });
};

// SAVE
export const saveQuotation = async (quotation) => {
  const cleaned = quotation.quotation || quotation   // 🔥 flatten if nested
  await addDoc(collectionRef, cleaned);
};

// UPDATE
export const updateQuotation = async (quotation) => {
  if (!quotation.id) {
    throw new Error("Missing document ID for update");
  }

  const ref = doc(db, "quotations", quotation.id);

  // 🔥 flatten + remove bad nested structure
  const cleanData = quotation.quotation || quotation

  const { id, quotation: _, ...finalData } = cleanData

  await updateDoc(ref, finalData)
};

// DELETE
export const deleteQuotation = async (id) => {
  const ref = doc(db, "quotations", id);
  await deleteDoc(ref);
};

//UPDATE STATUS
export const updateQuotationStatus = async (id, status) => {
  const ref = doc(db, "quotations", id);
  await updateDoc(ref, { status });
};