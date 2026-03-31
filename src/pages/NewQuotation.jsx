import { useEffect, useState } from 'react'
import { generatePDF } from '../utils/pdfGenerator'
import {
  saveQuotation,
  updateQuotation
} from "../services/quotationService";
import { getNextQuotationNumber } from '../utils/quotationNumber'
import QuotationPreview from '../components/QuotationPreview'
import { getCustomers, saveCustomer } from "../services/customerService";

const createEmptyItem = () => ({
  id: Date.now() + Math.random(),
  description: '',
  subItems: [],
  qty: 1,
  price: 0,
  vat: 0
})

const NewQuotation = ({ editQuotation, clearEdit }) => {

  const [quotationNo, setQuotationNo] = useState(null)
  const [date] = useState(new Date().toLocaleDateString())
  const [isEditMode, setIsEditMode] = useState(false)
  const [customers, setCustomers] = useState([]);

  const [client, setClient] = useState({
    name: '',
    company: '',
    phone: ''
  })

  const [items, setItems] = useState([createEmptyItem()])

  /* ===== VISIBILITY STATES ===== */

  const [showSubtotal, setShowSubtotal] = useState(true)
  const [showVat, setShowVat] = useState(true)
  const [showGrandTotal, setShowGrandTotal] = useState(true)
  const [showDiscount, setShowDiscount] = useState(true)

  /* ===== DISCOUNT ===== */

  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    const init = async () => {

      const list = await getCustomers();
setCustomers(list);

      if (editQuotation) {
        setDocId(editQuotation.id);
        setIsEditMode(true)
        setQuotationNo(editQuotation.quotationNo)
        setClient(editQuotation.client)

        setShowSubtotal(editQuotation.showSubtotal ?? true)
        setShowVat(editQuotation.showVat ?? true)
        setShowGrandTotal(editQuotation.showGrandTotal ?? true)
        setShowDiscount(editQuotation.showDiscount ?? true)

        setDiscountType(editQuotation.discountType ?? 'percentage')
        setDiscountValue(editQuotation.discountValue ?? 0)

        setItems(
          editQuotation.items.map(item => ({
            id: Date.now() + Math.random(),
            ...item,
            subItems: item.subItems || []
          }))
        )

      } else {
        setIsEditMode(false)
        const nextNo = await getNextQuotationNumber()
        setQuotationNo(nextNo)
      }
    }

    init()
  }, [editQuotation])

  //TERMS & CONDITIONS

  const [terms, setTerms] = useState([
  "This quotation is valid for 30 days from the date of issue.",
  "This quotation covers only the specified items/services.",
  "Prices are quoted in Sri Lankan Rupees (LKR).",
  "50% advance upon acceptance; balance upon completion.",
  "Delivery period starts after PO and advance payment.",
  "Cancellation charges may apply."
])

 const addTerm = () => setTerms(prev => [...prev, ""])
 const removeTerm = (index) => {
  setTerms(prev => prev.filter((_, i) => i !== index))
}

  /* ===== ITEM FUNCTIONS ===== */

  const addItem = () => setItems(prev => [...prev, createEmptyItem()])

  const updateItem = (id, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeItem = (id) => {
    if (items.length === 1) return
    setItems(prev => prev.filter(item => item.id !== id))
  }

  /* ===== SUB ITEMS ===== */

  const addSubItem = (itemId) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, subItems: [...item.subItems, { id: Date.now(), text: '' }] }
          : item
      )
    )
  }

  const updateSubItem = (itemId, subId, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              subItems: item.subItems.map(sub =>
                sub.id === subId ? { ...sub, text: value } : sub
              )
            }
          : item
      )
    )
  }

  const removeSubItem = (itemId, subId) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              subItems: item.subItems.filter(sub => sub.id !== subId)
            }
          : item
      )
    )
  }

  /* ===== CALCULATIONS ===== */

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)

  const vatTotal = items.reduce(
    (s, i) => s + (i.qty * i.price * i.vat) / 100,
    0
  )

  const totalBeforeDiscount = subtotal + vatTotal

  const discountAmount =
    discountType === 'percentage'
      ? (totalBeforeDiscount * discountValue) / 100
      : discountValue

  const grandTotal = totalBeforeDiscount - discountAmount

  /* ===== SAVE ===== */

  const issueQuotation = async () => {

    if (!client.name) {
      alert("Enter client name")
      return
    }

    const quotation = {
      quotationNo,
      date,
      client,
      items: items.map(({ id, ...rest }) => ({
        ...rest,
        subItems: rest.subItems.map(({ id, ...sub }) => sub)
      })),
      subtotal,
      vatTotal,
      discountType,
      discountValue,
      discountAmount,
      showDiscount,
      showSubtotal,
      showVat,
      showGrandTotal,
      grandTotal,
      terms,
      status: 'DRAFT'
    }

    await saveCustomer(client);

    if (isEditMode) await updateQuotation({quotation, id: docId})
    else await saveQuotation(quotation)

    await generatePDF(`QT-${quotationNo}.pdf`)
    clearEdit?.()
  }

//CLEAR FIELDS
  const clearFields = async () => {

  const nextNo = await getNextQuotationNumber();

  setQuotationNo(nextNo);

  setClient({
    name: '',
    company: '',
    phone: ''
  });

  setItems([createEmptyItem()]);

  setDiscountType('percentage');
  setDiscountValue(0);

  setShowSubtotal(true);
  setShowVat(true);
  setShowGrandTotal(true);
  setShowDiscount(true);

  setIsEditMode(false);
  setDocId(null);
};

const updateTerm = (index, value) => {
  setTerms(prev =>
    prev.map((t, i) => (i === index ? value : t))
  );
};
  return (

    <div className="two-column">
    <div className="left-panel">

      

      {/* CLIENT */}
     <div className="card">

  {/* 🔥 CUSTOMER DROPDOWN */}
  <select
    className="input"
    onChange={(e) => {
      const selected = customers.find(c => c.id === e.target.value);
      if (selected) setClient(selected);
    }}
  >
    <option value="">Select Existing Customer</option>
    {customers.map(c => (
      <option key={c.id} value={c.id}>
        {c.name} {c.company ? `(${c.company})` : ""}
      </option>
    ))}
  </select>

  <br /><br />

  {/* ORIGINAL INPUTS (UNCHANGED) */}
  <input className="input" placeholder="Client Name"
    value={client.name}
    onChange={e => setClient({ ...client, name: e.target.value })}
  /><br /><br />

  <input className="input" placeholder="Company"
    value={client.company}
    onChange={e => setClient({ ...client, company: e.target.value })}
  /><br /><br />

  <input className="input" placeholder="Phone"
    value={client.phone}
    onChange={e => setClient({ ...client, phone: e.target.value })}
  />

</div>

      {/* ITEMS */}
      <div className="card">
        <h3>Items</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 50px",
    gap: "10px",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#94a3b8"
  }}
>
  <div>Description</div>
  <div style={{ textAlign: "center" }}>Qty</div>
  <div style={{ textAlign: "center" }}>Price</div>
  <div style={{ textAlign: "center" }}>VAT %</div>
  <div></div>
</div>
        {items.map(item => (
  <div
    key={item.id}
    style={{
      display: "grid",
      gridTemplateColumns: "2fr 0.7fr 1fr 0.8fr 50px",
      gap: "10px",
      alignItems: "start",
      marginBottom: "15px"
    }}
  >

    {/* DESCRIPTION BLOCK */}
    <div>
      <input
        className="input"
        style={{ width: "100%" }}
        placeholder="Description"
        value={item.description}
        onChange={e => updateItem(item.id, 'description', e.target.value)}
      />

      {/* SUB ITEMS */}
      {item.subItems.map(sub => (
        <div
          key={sub.id}
          style={{
            display: "flex",
            gap: "6px",
            marginTop: "6px"
          }}
        >
          <input
            className="input"
            style={{
              fontSize: "13px",
              flex: 1
            }}
            placeholder="Sub Item"
            value={sub.text}
            onChange={e => updateSubItem(item.id, sub.id, e.target.value)}
          />

          <button
            className="btn-delete"
            style={{ padding: "6px 10px" }}
            onClick={() => removeSubItem(item.id, sub.id)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        style={{
          marginTop: "6px",
          fontSize: "12px",
          padding: "6px 10px"
        }}
        onClick={() => addSubItem(item.id)}
      >
        + Sub
      </button>
    </div>

    {/* QTY */}
    <input
      className="input"
      type="number"
      value={item.qty}
      onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
    />

    {/* PRICE */}
    <input
      className="input"
      type="number"
      value={item.price}
      onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
    />

    {/* VAT */}
    <input
      className="input"
      type="number"
      value={item.vat}
      onChange={e => updateItem(item.id, 'vat', Number(e.target.value))}
    />

    {/* DELETE */}
    <button
      className="btn-delete"
      style={{
        height: "40px",
        alignSelf: "center"
      }}
      onClick={() => removeItem(item.id)}
    >
      ✕
    </button>

  </div>
))}

        <button className="btn" onClick={addItem}>
          + Add Item
        </button>
      </div>

      {/* DISPLAY OPTIONS */}
      <div className="card">
        <h4>Display Options</h4>
        <label><input type="checkbox" checked={showSubtotal} onChange={() => setShowSubtotal(!showSubtotal)} /> Show Subtotal</label><br />
        <label><input type="checkbox" checked={showVat} onChange={() => setShowVat(!showVat)} /> Show VAT</label><br />
        <label><input type="checkbox" checked={showDiscount} onChange={() => setShowDiscount(!showDiscount)} /> Show Discount</label><br />
        <label><input type="checkbox" checked={showGrandTotal} onChange={() => setShowGrandTotal(!showGrandTotal)} /> Show Grand Total</label>
      </div>

      {/* DISCOUNT */}
      <div className="card">
        <h4>Discount</h4>
        <select className="input"
          value={discountType}
          onChange={e => setDiscountType(e.target.value)}>
          <option value="percentage">Percentage (%)</option>
          <option value="amount">Fixed Amount (Rs.)</option>
        </select>
        <br /><br />
        <input type="number"
          className="input"
          placeholder="Discount value"
          value={discountValue}
          onChange={e => setDiscountValue(Number(e.target.value))}
        />
      </div>

{/* TERMS */}
      <div className="card">
        <h4>Terms & Conditions</h4>

        {terms.map((term, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '5px' }}>
            <input
              className="input"
              value={term}
              onChange={(e) => updateTerm(index, e.target.value)}
            />
            <button className="btn-delete" onClick={() => removeTerm(index)}>✕</button>
          </div>
        ))}

        <button className="btn" onClick={addTerm}>+ Add Term</button>
      </div>


      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button className="btn" onClick={issueQuotation}>
    {isEditMode ? 'Update Quotation' : 'Issue Quotation'}
  </button>

  <button
    className="btn"
    style={{ background: "#64748b" }}
    onClick={clearFields}
  >
    Clear
  </button>
</div>

    

      <hr />

        </div>
<div className="right-panel">
      <QuotationPreview
        client={client}
        items={items}
        subtotal={subtotal}
        vatTotal={vatTotal}
        grandTotal={grandTotal}
        discountType={discountType}
        discountValue={discountValue}
        discountAmount={discountAmount}
        showDiscount={showDiscount}
        showSubtotal={showSubtotal}
        showVat={showVat}
        showGrandTotal={showGrandTotal}
        quotationNo={quotationNo}
        date={date}
        terms={terms}
      />
</div>
    </div>
    
  )
}

export default NewQuotation