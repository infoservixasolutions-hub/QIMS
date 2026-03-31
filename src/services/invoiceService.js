import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

const collectionRef = collection(db, "invoices");

// GET ALL
export const getInvoices = async () => {
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

// SAVE
export const saveInvoice = async (invoice) => {
  await addDoc(collectionRef, invoice);
};

// UPDATE PAYMENT
export const updateInvoicePayment = async (id, additionalPayment) => {
  const ref = doc(db, "invoices", id);

  // get current invoice
  const snapshot = await getDocs(collection(db, "invoices"));
  const invoice = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .find(i => i.id === id);

  if (!invoice) throw new Error("Invoice not found");

  const paymentValue = Number(additionalPayment || 0);

  const paid = Number(invoice.amountPaid || 0) + paymentValue;
  const total = Number(invoice.grandTotal || 0);
  const balance = Math.max(total - paid, 0);

  const status =
    paid === 0
      ? "UNPAID"
      : balance === 0
      ? "PAID"
      : "PARTIALLY PAID";

  const updatedData = {
    amountPaid: paid,
    balancePayable: balance,
    paymentStatus: status,
    payments: [
      ...(invoice.payments || []),
      {
        amount: paymentValue,
        date: new Date().toISOString()
      }
    ],
    paymentCompletedDate:
      status === "PAID" && !invoice.paymentCompletedDate
        ? new Date().toLocaleDateString()
        : invoice.paymentCompletedDate || null
  };

  await updateDoc(ref, updatedData);
};