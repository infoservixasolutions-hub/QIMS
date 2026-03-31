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
  const [preview, setPreview] = useState(null) // 🔥 FIX

  /* ================= LOAD DATA ================= */

  const loadQuotations = async () => {
    try {
      const data = await getQuotations();
      setQuotations(
  data.sort((a, b) => Number(a.quotationNo) - Number(b.quotationNo))
)
    } catch (err) {
      console.error("Error loading quotations:", err);
    }
  };

  useEffect(() => {
    loadQuotations()
  }, [])

  const refresh = async () => {
    const data = await getQuotations()

setQuotations(
  data.sort((a, b) => Number(a.quotationNo) - Number(b.quotationNo))
)

    // keep selection in sync
    if (selected) {
      const updated = data.find(q => q.id === selected.id)
      setSelected(updated || null)
      setPreview(updated || null) // 🔥 IMPORTANT
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
              onClick={() => {
                if (selected?.id === q.id) {
                  setSelected(null)
                  setPreview(null) // 🔥 CLEAR PREVIEW
                } else {
                  setSelected(q)
                  setPreview(q) // 🔥 SET PREVIEW
                }
              }}
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
        {!preview ? (
          <p>Select a quotation to preview</p>
        ) : (
          <div key={preview.id}>
            <button
              className="btn"
              style={{ marginBottom: '10px' }}
              onClick={() =>
                generatePDF(`QT-${preview.quotationNo}.pdf`)
              }
            >
              Download PDF
            </button>

            <QuotationPreview
  client={preview.client}
  items={preview.items}
  subtotal={preview.subtotal}
  vatTotal={preview.vatTotal}
  grandTotal={preview.grandTotal}
  quotationNo={preview.quotationNo}
  date={preview.date}
  discountType={preview.discountType}
  discountValue={preview.discountValue}
  discountAmount={preview.discountAmount}

  showSubtotal={preview.showSubtotal ?? true}
  showVat={preview.showVat ?? true}
  showDiscount={preview.showDiscount ?? true}
  showGrandTotal={preview.showGrandTotal ?? true}

  terms={preview.terms || []}
/>
          </div>
        )}
      </div>

    </div>
  )
}

export default QuotationHistory