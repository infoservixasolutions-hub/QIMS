import { useEffect, useState } from 'react'
import {
  getInvoices,
  updateInvoicePayment
} from "../services/invoiceService";
import InvoicePreview from '../components/InvoicePreview'
import { generatePDF } from '../utils/pdfGenerator'

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([])
  const [selected, setSelected] = useState(null)
  const [payment, setPayment] = useState('')
  const [isEditingPayment, setIsEditingPayment] = useState(false)

  /* ================= LOAD DATA ================= */

  const loadInvoices = async () => {
    try {
      const data = await getInvoices()
      setInvoices(
  [...data].sort((a, b) => {
    const numA = Number(a.invoiceNo.split('-')[1])
    const numB = Number(b.invoiceNo.split('-')[1])
    return numA - numB
  })
)
    } catch {
      // Storage not initialized
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  /* ================= REFRESH FUNCTION ================= */

  const refresh = async () => {
    const updated = await getInvoices()

    setInvoices(
  [...updated].sort((a, b) => {
    const numA = Number(a.invoiceNo.split('-')[1])
    const numB = Number(b.invoiceNo.split('-')[1])
    return numA - numB
  })
)

    if (selected) {
      const fresh = updated.find(
        i => i.invoiceNo === selected.invoiceNo
      )

      // 🔥 Force new object reference
      setSelected(fresh ? { ...fresh } : null)
    }
  }

  /* ================= SELECT INVOICE ================= */

  const selectInvoice = (inv) => {
    setSelected({ ...inv }) // force new reference
    setPayment('')
    setIsEditingPayment(false)
  }

  /* ================= ADDITIONAL PAYMENT ================= */

  const addPayment = async () => {
    if (!selected) return

    const amount = Number(payment)

    if (!amount || amount <= 0)
      return alert('Enter a valid payment amount')

    if (amount > selected.balancePayable)
      return alert('Payment exceeds remaining balance')

   await updateInvoicePayment(selected.id, payment);

    setPayment('')
    await refresh()
  }

  /* ================= EDIT TOTAL PAYMENT ================= */

  const updatePayment = async () => {
    if (!selected) return

    const newAmountPaid = Number(payment)

    if (newAmountPaid < 0)
      return alert('Payment cannot be negative')

    const currentPaid = Number(selected.amountPaid || 0)
    const difference = newAmountPaid - currentPaid

    if (difference !== 0) {
      await updateInvoicePayment(selected.id, difference)
    }

    setIsEditingPayment(false)
    setPayment('')
    await refresh()
  }

  /* ================= UI ================= */

  return (
     <div className="two-column">

    {/* LEFT SIDE */}
    <div className="left-panel">

      {/* LEFT SIDE */}
      <div className="card history-list">
       

        {invoices.length === 0 && (
          <p>No invoices issued yet</p>
        )}

        {invoices.map(inv => (
          <div
            key={inv.invoiceNo}
            className={`card history-item ${
  selected?.invoiceNo === inv.invoiceNo ? "active-item" : ""
}`}
            onClick={() => selectInvoice(inv)}
          >
            <b>INV-{inv.invoiceNo}</b><br />
            {inv.quotationNo
              ? `QT-${inv.quotationNo}`
              : 'DIRECT INVOICE'}<br />
            Rs. {inv.grandTotal.toFixed(2)}<br />
            Status: <b>{inv.paymentStatus}</b>
          </div>
        ))}
      </div>
      </div>

      {/* RIGHT SIDE */}
    <div className="right-panel">
        {!selected && <p>Select an invoice</p>}

        {selected && (
          <>
            <button
              className="btn"
              onClick={() =>
                generatePDF(`INV-${selected.invoiceNo}.pdf`)
              }
            >
              Download Invoice PDF
            </button>

            <p>
              <b>Amount Paid:</b>{' '}
              Rs. {(selected.amountPaid ?? 0).toFixed(2)}
            </p>

            <p>
              <b>Balance:</b>{' '}
              Rs. {(selected.balancePayable ?? 0).toFixed(2)}
            </p>

            <p>
              <b>Status:</b> {selected.paymentStatus}
            </p>

            {/* ADDITIONAL PAYMENT */}
            {selected.paymentStatus !== 'PAID' && (
              <>
                <input
  className="input"
  type="number"
  step="0.01"
  value={payment}
  max={selected.balancePayable}
  onChange={e => {
    const value = Number(e.target.value)

    if (value > selected.balancePayable) {
      setPayment(selected.balancePayable)
    } else {
      setPayment(e.target.value)
    }
  }}
  placeholder="Additional Payment"
/>

                <button className="btn" onClick={addPayment}>
                  Record Payment
                </button>
              </>
            )}

            {/* EDIT TOTAL PAYMENT */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPayment(String(selected.amountPaid || 0))
                setIsEditingPayment(true)
              }}
            >
              Edit Total Payment
            </button>

            {isEditingPayment && (
              <>
                <input
  className="input"
  type="number"
  step="0.01"
  value={payment}
  max={selected.grandTotal}
  onChange={e => {
    const value = Number(e.target.value)

    if (value > selected.balancePayable) {
      setPayment(selected.balancePayable)
    } else if (value < 0) {
      setPayment(0)
    } else {
      setPayment(e.target.value)
    }
  }}
/>

                <button className="btn" onClick={updatePayment}>
                  Save Payment
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setIsEditingPayment(false)
                    setPayment('')
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            <InvoicePreview invoice={selected} />
          </>
        )}
      </div>
    </div>
  )
}

export default InvoiceHistory
