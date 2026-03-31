import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Ledger() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayments, setShowPayments] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= LOAD INVOICES ================= */

  const loadInvoices = async () => {
    const snapshot = await getDocs(collection(db, "invoices"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setInvoices(data);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  /* ================= ADD PAYMENT ================= */

  const handleAddPayment = async () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const currentPaid = selectedInvoice.amountPaid || 0;
    const total = selectedInvoice.grandTotal || 0;
    const newPaid = currentPaid + amount;
    const newBalance = total - newPaid;

    if (amount > newBalance + amount) {
      alert("Payment exceeds balance");
      return;
    }

    const updatedPayments = [
      ...(selectedInvoice.payments || []),
      {
        amount,
        date: new Date().toISOString()
      }
    ];

    let paymentStatus = "UNPAID";
    let paymentCompletedDate = null;

    if (newBalance <= 0) {
      paymentStatus = "PAID";
      paymentCompletedDate = new Date().toISOString();
    } else if (newPaid > 0) {
      paymentStatus = "PARTIALLY PAID";
    }

    await updateDoc(doc(db, "invoices", selectedInvoice.id), {
      amountPaid: newPaid,
      balancePayable: newBalance,
      paymentStatus,
      paymentCompletedDate,
      payments: updatedPayments
    });

    setPaymentAmount("");
    setSelectedInvoice(null);
    loadInvoices();
  };

  /* ================= STATUS COLOR ================= */

  const getStatusColor = (status) => {
    if (status === "PAID") return "#16a34a";
    if (status === "PARTIALLY PAID") return "#f59e0b";
    return "#dc2626";
  };

  /* ================= INCOME ================= */

  const calculateIncome = () => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    let total = 0;

    invoices.forEach(inv => {
      (inv.payments || []).forEach(p => {
        const d = new Date(p.date);
        if (d >= start && d <= end) {
          total += Number(p.amount);
        }
      });
    });

    return total;
  };

const getLiveBalance = () => {
  if (!selectedInvoice) return 0;

  const total = selectedInvoice.grandTotal || 0;
  const paid = selectedInvoice.amountPaid || 0;
  const entered = Number(paymentAmount) || 0;

  return total - (paid + entered);
};

  /* ================= UI ================= */

  return (
    <div>
      

      {/* INCOME */}
      <div className="card">
        <h3>Income Statement</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input"/>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input"/>
        </div>

        <h3 style={{ color: "#2563eb" }}>
          Rs. {calculateIncome().toFixed(2)}
        </h3>
      </div>

      {/* TABLE */}
      <div className="card">
        <table width="100%">
          <thead>
            <tr style={{ background: "#2563eb", color: "white" }}>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map(inv => {
              const paid = inv.amountPaid || 0;
              const total = inv.grandTotal || 0;
              const balance = inv.balancePayable ?? (total - paid);

              return (
                <tr key={inv.id} style={{ textAlign: "center" }}>
                  <td>INV-{inv.invoiceNo}</td>
                  <td>{inv.client?.name}</td>
                  <td>Rs. {total}</td>
                  <td>Rs. {paid}</td>
                  <td>Rs. {balance}</td>
                  <td style={{ color: getStatusColor(inv.paymentStatus) }}>
                    {inv.paymentStatus || "UNPAID"}
                  </td>

                  <td>
                    {inv.paymentStatus !== "PAID" && (
                      <button className="btn" onClick={() => setSelectedInvoice(inv)}>
                        Add
                      </button>
                    )}

                    <button className="btn-secondary" onClick={() => setShowPayments(inv.payments || [])}>
                      History
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD PAYMENT */}
      {selectedInvoice && (
  <Modal>
    <h3>Add Payment</h3>
    <p>INV-{selectedInvoice.invoiceNo}</p>

    <p><strong>Total:</strong> Rs. {selectedInvoice.grandTotal}</p>
    <p><strong>Paid:</strong> Rs. {selectedInvoice.amountPaid || 0}</p>
    <p style={{ color: "#dc2626" }}>
      <strong>Balance:</strong> Rs. {selectedInvoice.balancePayable ?? (selectedInvoice.grandTotal - (selectedInvoice.amountPaid || 0))}
    </p>

    <input
  type="number"
  placeholder={`Max: Rs. ${
    selectedInvoice?.balancePayable ??
    (selectedInvoice?.grandTotal - (selectedInvoice?.amountPaid || 0))
  }`}
  value={paymentAmount}
  onChange={(e) => {
    const value = Number(e.target.value);

    const balance =
      selectedInvoice?.balancePayable ??
      (selectedInvoice?.grandTotal - (selectedInvoice?.amountPaid || 0));

    if (value <= balance) {
      setPaymentAmount(e.target.value);
    } else {
      setPaymentAmount(balance); // cap to max
    }
  }}
  className="input"
/>

    {/* LIVE BALANCE AFTER INPUT */}
    <p style={{ color: "#2563eb", marginTop: 10 }}>
      Balance After Payment: Rs. {getLiveBalance()}
    </p>

   <button className="btn" onClick={handleAddPayment}>Save</button>
    <button className="btn-delete" onClick={() => setSelectedInvoice(null)}>Cancel</button>
  </Modal>
)}

      {/* HISTORY */}
      {showPayments && (
        <Modal>
          <h3>Payment History</h3>

          {showPayments.map((p, i) => (
            <div key={i}>
              Rs. {p.amount} - {new Date(p.date).toLocaleDateString()}
            </div>
          ))}

          <button className="btn-delete" onClick={() => setShowPayments(null)}>
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}





const Modal = ({ children }) => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div className="card" style={{ minWidth: "300px" }}>
      {children}
    </div>
  </div>
);