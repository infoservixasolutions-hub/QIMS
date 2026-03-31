import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

export const saveCustomer = async (client) => {
  if (!client.name) return;

  const snapshot = await getDocs(collection(db, "customers"));

  // avoid duplicates (by name + phone)
  const exists = snapshot.docs.some(doc => {
    const data = doc.data();
    return (
      data.name === client.name &&
      data.phone === client.phone
    );
  });

  if (!exists) {
    await addDoc(collection(db, "customers"), client);
  }
};

export const getCustomers = async () => {
  const snapshot = await getDocs(collection(db, "customers"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};