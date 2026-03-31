import { useState, useEffect } from 'react'
import { getQuotations, updateQuotationStatus } from "../services/quotationService";
import { saveInvoice, getInvoices } from "../services/invoiceService";
import InvoicePreview from '../components/InvoicePreview'
import { getCustomers } from "../services/customerService";
import { generatePDF } from '../utils/pdfGenerator'

/* 🔥 PROFESSIONAL INVOICE NUMBER GENERATOR */
const generateInvoiceNumber = async (getInvoices) => {
  const invoices = await getInvoices()

  const year = new Date().getFullYear().toString()

  // ✅ FIXED FILTER
  const currentYearInvoices = invoices.filter(inv =>
    inv.invoiceNo && inv.invoiceNo.startsWith(year)
  )

  let nextNumber = 1

  if (currentYearInvoices.length > 0) {
    const numbers = currentYearInvoices.map(inv => {
      const parts = inv.invoiceNo.split('-')
      return Number(parts[1]) // second part = number
    })

    nextNumber = Math.max(...numbers) + 1
  }

  const padded = String(nextNumber).padStart(3, '0')

  return `${year}-${padded}`
}

const FinalInvoice = () => {

  const [mode, setMode] = useState('QUOTATION')
  const isReadOnly = mode === 'QUOTATION'

  const [quotationNo, setQuotationNo] = useState('')
  const [quotation, setQuotation] = useState(null)
  const [quotationLoaded, setQuotationLoaded] = useState(false)
  const [customers, setCustomers] = useState([])

  const [client, setClient] = useState({
    name: '',
    company: '',
    phone: ''
  })

  const [items, setItems] = useState([
    { description: '', qty: 1, price: 0, vat: 0 }
  ])

  const [amountPaid, setAmountPaid] = useState(0)
  const [invoice, setInvoice] = useState(null)
  const [previewInvoiceNo, setPreviewInvoiceNo] = useState('')

  /* LOAD CUSTOMERS */
  useEffect(() => {
    const load = async () => {
      const list = await getCustomers()
      setCustomers(list)
    }
    load()
  }, [])

  /* AUTO GENERATE INVOICE NUMBER */
  useEffect(() => {
    const generate = async () => {
      if ((mode === 'DIRECT') || (mode === 'QUOTATION' && quotationLoaded)) {
        const no = await generateInvoiceNumber(getInvoices)
        setPreviewInvoiceNo(no)
      }
    }
    generate()
  }, [mode, quotationLoaded])

  /* LOAD QUOTATION */
  const loadQuotation = async () => {
    if (!quotationNo.trim()) return alert('Enter quotation number')

    const typed = quotationNo.replace('QT-', '').trim()
    const list = await getQuotations()

    const q = list.find(x => Number(x.quotationNo) === Number(typed))
    if (!q) return alert('Quotation not found')

    if (q.status === 'INVOICED') {
      return alert('This quotation has already been converted into an invoice')
    }

    if (q.status !== 'APPROVED') {
      return alert('Only approved quotations can be invoiced')
    }

    const existing = await getInvoices()
    const alreadyExists = existing.some(
      i => Number(i.quotationNo) === Number(q.quotationNo)
    )

    if (alreadyExists)
      return alert("Invoice already exists for this quotation")

    setQuotation(q)
    setClient(q.client)

    setItems(
      (q.items || []).map(i => ({
        description: i.description,
        qty: Number(i.qty),
        price: Number(i.price),
        vat: Number(i.vat)
      }))
    )

    setQuotationLoaded(true)
  }

  /* CALCULATIONS */
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)

  const vatTotal = items.reduce(
    (s, i) => s + (i.qty * i.price * i.vat) / 100,
    0
  )

  const grandTotal = subtotal + vatTotal

  const balancePayable = grandTotal - amountPaid

  const paymentStatus =
    amountPaid === 0
      ? 'UNPAID'
      : amountPaid >= grandTotal
        ? 'PAID'
        : 'PARTIALLY PAID'

  /* ISSUE INVOICE */
  const issueInvoice = async () => {

    if (amountPaid > grandTotal) {
      return alert("Amount paid cannot exceed Grand Total")
    }

    if (grandTotal <= 0) {
  return alert("Cannot generate invoice with zero total")
}

    if (mode === 'QUOTATION' && !quotation)
      return alert('Load quotation first')

    if (mode === 'DIRECT' && !client.name)
      return alert('Enter client details')

    const invoiceNo = previewInvoiceNo

    const cleanInvoice = {
      invoiceNo,
      quotationNo: mode === 'QUOTATION' ? String(quotation.quotationNo) : null,
      source: mode,
      date: new Date().toLocaleDateString(),
      client,
      items,
      subtotal,
      vatTotal,
      grandTotal,
      amountPaid,
      balancePayable,
      paymentStatus,
      payments: amountPaid > 0
    ? [{
        amount: amountPaid,
        date: new Date().toISOString()
      }]
    : []
    }

    await saveInvoice(cleanInvoice)

    if (mode === 'QUOTATION') {
      await updateQuotationStatus(quotation.id, 'INVOICED')
    }

    setInvoice(cleanInvoice)

     // ✅ SUCCESS MESSAGE
  alert(`Invoice INV-${invoiceNo} generated successfully`)

  // ✅ AUTO DOWNLOAD PDF
  setTimeout(() => {
    generatePDF(`INV-${invoiceNo}.pdf`)
  }, 300)
  }

const clearFields = () => {
  if (mode === 'DIRECT') {
    setClient({ name: '', company: '', phone: '' })
    setItems([{ description: '', qty: 1, price: 0, vat: 0 }])
    setAmountPaid(0)
    setInvoice(null)
    setPreviewInvoiceNo('')
  }

  if (mode === 'QUOTATION') {
    setQuotationNo('')
    setQuotation(null)
    setQuotationLoaded(false)
    setClient({ name: '', company: '', phone: '' })
    setItems([])
    setAmountPaid(0)
    setInvoice(null)
    setPreviewInvoiceNo('')
  }
}

  return (
  <div className="two-column">

    {/* LEFT SIDE */}
    <div className="left-panel">

      <div className="card">
        

        {/* MODE */}
        <div className="card">
          <label>
            <input
              type="radio"
              checked={mode === 'QUOTATION'}
              onChange={() => {
                setMode('QUOTATION')
                setQuotation(null)
                setQuotationLoaded(false)
                setInvoice(null)
              }}
            /> From Quotation
          </label>

          <label style={{ marginLeft: 20 }}>
            <input
              type="radio"
              checked={mode === 'DIRECT'}
              onChange={() => {
                setMode('DIRECT')
                setQuotation(null)
                setItems([{ description: '', qty: 1, price: 0, vat: 0 }])
                setInvoice(null)
              }}
            /> Direct Invoice
          </label>
        </div>

        {/* LOAD QUOTATION */}
        {mode === 'QUOTATION' && (
          <div className="card">
            <input
              className="input"
              placeholder="Enter Quotation Number"
              value={quotationNo}
              onChange={e => setQuotationNo(e.target.value)}
            />
            <button onClick={loadQuotation}>Load</button>

            {quotationLoaded && <p style={{ color: 'green' }}>✔ Loaded</p>}
          </div>
        )}

        {/* DIRECT MODE */}
        {mode === 'DIRECT' && (
          <>
            <div className="card">
              <select
                className="input"
                onChange={(e) => {
                  const selected = customers.find(c => String(c.id) === e.target.value)
                  if (selected) {
                    setClient({
                      name: selected.name || '',
                      company: selected.company || '',
                      phone: selected.phone || ''
                    })
                  }
                }}
              >
                <option value="">Select Existing Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>

              <input className="input" placeholder="Client Name"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
              />

              <input className="input" placeholder="Company"
                value={client.company}
                onChange={(e) => setClient({ ...client, company: e.target.value })}
              />

              <input className="input" placeholder="Phone"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </div>

            {/* ITEMS */}
            <div className="card">
              <h3>Items</h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr auto",
                gap: "10px",
                marginBottom: "8px",
                fontSize: "13px",
                opacity: 0.7
              }}>
                <div>Description</div>
                <div>Qty</div>
                <div>Price</div>
                <div>VAT %</div>
                <div></div>
              </div>

              {items.map((item, index) => (
                <div key={index} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr auto",
                  gap: "10px",
                  marginBottom: "10px"
                }}>
                  <input
                    className="input"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].description = e.target.value
                      setItems(updated)
                    }}
                  />
                  <input
                    className="input"
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].qty = Number(e.target.value)
                      setItems(updated)
                    }}
                  />
                  <input
                    className="input"
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].price = Number(e.target.value)
                      setItems(updated)
                    }}
                  />
                  <input
                    className="input"
                    type="number"
                    value={item.vat}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].vat = Number(e.target.value)
                      setItems(updated)
                    }}
                  />
                  <button
                    className="btn-delete"
                    onClick={() => {
                      setItems(items.filter((_, i) => i !== index))
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="btn"
                onClick={() =>
                  setItems([...items, { description: '', qty: 1, price: 0, vat: 0 }])
                }
              >
                + Add Item
              </button>
            </div>
          </>
        )}

        {/* PAYMENT */}
        {(mode === 'DIRECT' || (mode === 'QUOTATION' && quotationLoaded)) && (
          <div className="card">
            <h3>Payment</h3>
            <input
              className="input"
              type="number"
              value={amountPaid}
              onChange={(e) => {
                let value = Number(e.target.value)
                if (value > grandTotal) value = grandTotal
                setAmountPaid(value)
              }}
            />
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button onClick={issueInvoice} style={{ width: '100%' }}>
            Generate Invoice
          </button>

          {mode === 'DIRECT' && (
            <button onClick={clearFields}>Clear</button>
          )}
        </div>

      </div>
    </div>

    {/* RIGHT SIDE (PREVIEW) */}
    <div className="right-panel">

      {(mode === 'DIRECT' || (mode === 'QUOTATION' && quotationLoaded)) && (
        <InvoicePreview
          invoice={{
            invoiceNo: previewInvoiceNo || 'Generating...',
            quotationNo: quotation?.quotationNo || null,
            date: new Date().toLocaleDateString(),
            client,
            items,
            subtotal,
            vatTotal,
            grandTotal,
            amountPaid,
            balancePayable,
            paymentStatus
          }}
          showSubtotal
          showVat
          showGrandTotal
        />
      )}

    </div>

  </div>
)
}

export default FinalInvoice