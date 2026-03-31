import companyProfile from '../utils/companyProfile'
import logo from '../assets/logo.png'

const QuotationPreview = ({
  client = {},
  items = [],
  subtotal = 0,
  vatTotal = 0,
  grandTotal = 0,
  quotationNo,
  date,
  showSubtotal,
  showVat,
  showGrandTotal,
  discountType,
  discountValue = 0,
  discountAmount = 0,
  showDiscount,
  terms = []
}) => {

  return (
    <div
      id="quotation-pdf"
      style={{
        padding: '25px',
        width: '700px',
        background: 'linear-gradient(135deg, #d4e4ff, #ffffff)',
        border: '1px solid #b6ccff',
        fontFamily: 'Arial',
        color: '#0f172a'
      }}
    >

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        background: '#eaf1ff',
        border: '1px solid #b6ccff'
      }}>
        <div>
          <h2 style={{ color: '#1e3a8a', margin: 0 }}>
            {companyProfile.name}
          </h2>
          <p>{companyProfile.address}</p>
          <p>{companyProfile.phone}</p>
          <p>{companyProfile.email}</p>
        </div>

        {companyProfile.logo && (
          <img src={logo} alt="logo" width="250" height="120" />
        )}
      </div>

      {/* QUOTATION INFO */}
      <div style={box}>
        <strong>Quotation No:</strong> QT-{quotationNo}<br />
        <strong>Date:</strong> {date}
      </div>

      {/* CLIENT */}
      <div style={boxLight}>
        <strong>Client Name:</strong> {client?.name || '-'}<br />
        <strong>Company:</strong> {client?.company || '-'}<br />
        <strong>Phone:</strong> {client?.phone || '-'}
      </div>

      {/* ITEMS */}
      <table width="100%" cellPadding="6" style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>VAT %</th>
            <th style={thStyle}>VAT Amount</th>
            <th style={thStyle}>Line Total</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No items
              </td>
            </tr>
          ) : (
            items.map((item, i) => {

              const base = (item.qty || 0) * (item.price || 0)
              const vatAmount = ((base * (item.vat || 0)) / 100)
              const lineTotal = base + vatAmount

              return (
                <tr key={i}>
                  <td style={tdTop}>
                    <strong>{item.description}</strong>

                    {item.subItems?.length > 0 && (
                      <ul style={subList}>
                        {item.subItems.map((sub, index) =>
                          sub.text && <li key={index}>{sub.text}</li>
                        )}
                      </ul>
                    )}
                  </td>

                  <td style={tdCenter}>{item.qty}</td>
                  <td style={tdRight}>{(item.price || 0).toFixed(2)}</td>
                  <td style={tdCenter}>
                    {item.vat > 0 ? `${item.vat}%` : '—'}
                  </td>
                  <td style={tdRight}>{vatAmount.toFixed(2)}</td>
                  <td style={tdRight}>{lineTotal.toFixed(2)}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: '15px' }}>
        <table width="100%">
          <tbody>

            {showSubtotal && (
              <tr>
                <td style={right}>Subtotal</td>
                <td style={right}>Rs. {subtotal.toFixed(2)}</td>
              </tr>
            )}

            {showVat && vatTotal > 0 && (
              <tr>
                <td style={right}>VAT Total</td>
                <td style={right}>Rs. {vatTotal.toFixed(2)}</td>
              </tr>
            )}

            {showDiscount && discountAmount > 0 && (
              <tr>
                <td style={right}>
                  Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}
                </td>
                <td style={right}>- Rs. {discountAmount.toFixed(2)}</td>
              </tr>
            )}

            {showGrandTotal && (
              <tr style={grandRow}>
                <td style={right}>Grand Total</td>
                <td style={right}>Rs. {grandTotal.toFixed(2)}</td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* TERMS */}
      <div style={boxLight}>
        <h4 style={{ color: '#1e3a8a' }}>Terms & Conditions</h4>
        {terms.length > 0 && (
          <ul>
            {terms.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}
      </div>

      {/* BANK */}
      {companyProfile.bank && (
        <div style={box}>
          <h4 style={{ color: '#1e3a8a' }}>Bank Details</h4>
          <p><strong>Bank:</strong> {companyProfile.bank.bankName}</p>
          <p><strong>Branch:</strong> {companyProfile.bank.branch}</p>
          <p><strong>Account Name:</strong> {companyProfile.bank.accountName}</p>
          <p><strong>Account Number:</strong> {companyProfile.bank.accountNumber}</p>
          {companyProfile.bank.swift && (
            <p><strong>SWIFT Code:</strong> {companyProfile.bank.swift}</p>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div style={footer}>
        This is a computer generated quotation and does not require a signature.
      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const box = {
  marginTop: '15px',
  padding: '10px',
  background: '#eaf1ff',
  border: '1px solid #b6ccff'
}

const boxLight = {
  marginTop: '15px',
  padding: '10px',
  background: '#f0f6ff',
  border: '1px solid #b6ccff'
}

const tableStyle = {
  marginTop: '15px',
  borderCollapse: 'collapse',
  background: '#fff',
  border: '1px solid #b6ccff'
}

const theadStyle = {
  background: '#2563eb',
  color: '#fff'
}

const thStyle = { border: '1px solid #b6ccff' }
const tdTop = { border: '1px solid #b6ccff', verticalAlign: 'top', color: '#000' }
const tdCenter = { border: '1px solid #b6ccff', textAlign: 'center', color: '#000' }
const tdRight = { border: '1px solid #b6ccff', textAlign: 'right', color: '#000' }

const right = { textAlign: 'right', color: '#000' }

const subList = {
  marginTop: '5px',
  marginLeft: '15px',
  fontSize: '13px'
}

const grandRow = {
  fontWeight: 'bold',
  background: '#eaf1ff',
  borderTop: '2px solid #2563eb'
}

const footer = {
  marginTop: '25px',
  paddingTop: '10px',
  borderTop: '1px solid #b6ccff',
  fontSize: '12px',
  textAlign: 'center',
  color: '#1e3a8a'
}

export default QuotationPreview