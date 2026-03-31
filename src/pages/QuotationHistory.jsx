import { useEffect, useState } from 'react'
import {
  getQuotations,
  deleteQuotation,
  updateQuotationStatus
} from "../services/quotationService";
import QuotationPreview from '../components/QuotationPreview'
import { generatePDF } from '../utils/pdfGenerator'


const QuotationHistory = ({ onEdit }) => {
  const [quotations, setQuotations] = useState([])
  const [selected, setSelected] = useState(null)

  /* ================= LOAD DATA ================= */

  const loadQuotations = async () => {
  try {
    const data = await getQuotations();
    setQuotations(data);
  } catch (err) {
    console.error("Error loading quotations:", err);
  }
};

  useEffect(() => {
    loadQuotations()
  }, [])

  const refresh = async () => {
  const data = await getQuotations()
  setQuotations(data)

  // 🔥 re-select updated quotation
  if (selected) {
    const updated = data.find(q => q.id === selected.id)
    setSelected(updated || null)
  }
}


  /* ================= ACTIONS ================= */

  const approve = async (no) => {
    await updateQuotationStatus(no, 'APPROVED')
    refresh()
  }

  const remove = async (no) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this draft quotation?'
    )
    if (!confirmDelete) return

    await deleteQuotation(no)
    refresh()
  }

  /* ================= UI ================= */

  return (
    <div className="two-column">

    {/* LEFT SIDE */}
    <div className="left-panel">

      {/* LEFT PANEL */}
      <div className="card history-list">
       

        {quotations.length === 0 && (
          <p>No quotations found</p>
        )}

        {quotations.map(q => (
          <div
            key={q.id}
            className={`card history-item ${
  selected?.id === q.id ? "active-item" : ""
}`}
            onClick={() => setSelected(q)}
          >
            <b>QT-{q.quotationNo}</b><br />
            {q.client?.name}<br />
            Status: <b>{q.status}</b>

            {q.status === 'DRAFT' && (
              <div style={{ marginTop: '6px' }}>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(q, refresh)
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await approve(q.id)
                  }}
                >
                  Approve
                </button>

                <button
                  className="btn-delete"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await remove(q.id)
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
</div>
      {/* RIGHT PANEL */}
      <div className="right-panel">
        {!selected && <p>Select a quotation to preview</p>}

        {selected && (
          <>
            <button
              className="btn"
              style={{ marginBottom: '10px' }}
              onClick={() =>
                generatePDF(`QT-${selected.quotationNo}.pdf`)
              }
            >
              Download PDF
            </button>

            <QuotationPreview
              client={selected.client}
              items={selected.items}
              subtotal={selected.subtotal}
              vatTotal={selected.vatTotal}
              grandTotal={selected.grandTotal}
              quotationNo={selected.quotationNo}
              date={selected.date}
              discountType={selected.discountType}
              discountValue={selected.discountValue}
              discountAmount={selected.discountAmount}

              showSubtotal={true}
              showVat={true}
              showDiscount={true}
              showGrandTotal={true}
              terms={selected.terms || []}
            />
          </>
        )}
      </div>

    </div>
  )
}

export default QuotationHistory
