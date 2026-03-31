import companyProfile from '../utils/companyProfile'
import logo from '../assets/logo.png'

const QuotationPreview = ({
  client,
  items,
  subtotal,
  vatTotal,
  grandTotal,
  quotationNo,
  date,
  showSubtotal,
  showVat,
  showGrandTotal,
  discountType,
  discountValue,
  discountAmount,
  showDiscount,
  terms
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

      {/* ================= COMPANY HEADER ================= */}
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
          <img
            src={logo}
            alt="Company Logo"
            width="250"
            height="120"
          />
        )}
      </div>

      {/* ================= QUOTATION INFO ================= */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#eaf1ff',
        border: '1px solid #b6ccff'
      }}>
        <strong>Quotation No:</strong> QT-{quotationNo}<br />
        <strong>Date:</strong> {date}
      </div>

      {/* ================= CLIENT ================= */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#f0f6ff',
        border: '1px solid #b6ccff'
      }}>
        <strong>Client Name:</strong> {client.name}<br />
        <strong>Company:</strong> {client.company}<br />
        <strong>Phone:</strong> {client.phone}
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table
        width="100%"
        cellPadding="6"
        style={{
          marginTop: '15px',
          borderCollapse: 'collapse',
          background: '#ffffff',
          border: '1px solid #b6ccff'
        }}
      >
        <thead>
          <tr style={{ background: '#2563eb', color: '#ffffff' }}>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>VAT %</th>
            <th style={thStyle}>VAT Amount</th>
            <th style={thStyle}>Line Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => {

            const base = item.qty * item.price
            const vatAmount = (base * item.vat) / 100
            const lineTotal = base + vatAmount

            return (
              <tr key={i}>
                <td style={{ ...tdStyle, verticalAlign: 'top', color: '#000000' }}>
                  <strong>{item.description}</strong>

                  {item.subItems?.length > 0 && (
                    <ul style={{
                      marginTop: '5px',
                      marginLeft: '15px',
                      fontSize: '13px',
                    }}>
                      {item.subItems.map((sub, index) =>
                        sub.text && <li key={index}>{sub.text}</li>
                      )}
                    </ul>
                  )}
                </td>

                <td style={{ ...tdStyle, textAlign: 'center', color: '#000000' }}>
                  {item.qty}
                </td>

                <td style={{ ...tdStyle, textAlign: 'right', color: '#000000' }}>
                  {item.price.toFixed(2)}
                </td>

                <td style={{ ...tdStyle, textAlign: 'center', color: '#000000' }}>
                  {item.vat > 0 ? `${item.vat}%` : '—'}
                </td>

                <td style={{ ...tdStyle, textAlign: 'right', color: '#000000' }}>
                  {vatAmount.toFixed(2)}
                </td>

                <td style={{ ...tdStyle, textAlign: 'right', color: '#000000' }}>
                  {lineTotal.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* ================= TOTALS ================= */}
      <div style={{ marginTop: '15px', width: '100%' }}>
        <table width="100%" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <tbody>

            {showSubtotal && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>Subtotal</td>
                <td style={{ textAlign: 'right', width: '150px', color: '#000000' }}>
                  Rs. {subtotal.toFixed(2)}
                </td>
              </tr>
            )}

            {showVat && vatTotal > 0 && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>VAT Total</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Rs. {vatTotal.toFixed(2)}
                </td>
              </tr>
            )}

            {showDiscount && discountAmount > 0 && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}
                </td>
                <td style={{ textAlign: 'right', color: 'red', color: '#000000' }}>
                  - Rs. {discountAmount.toFixed(2)}
                </td>
              </tr>
            )}

            {showGrandTotal && (
              <tr style={{
                fontWeight: 'bold',
                background: '#eaf1ff',
                borderTop: '2px solid #2563eb',
              }}>
                <td style={{ textAlign: 'right', color: '#000000' }}>Grand Total</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Rs. {grandTotal.toFixed(2)}
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* ================= TERMS ================= */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        background: '#f0f6ff',
        border: '1px solid #b6ccff'
      }}>
        <h4 style={{ color: '#1e3a8a' }}>Terms & Conditions</h4>
        {terms && terms.length > 0 && (
  <div style={{ marginTop: "20px" }}>
    <h4>Terms & Conditions</h4>
    <ul>
      {terms.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  </div>
)}
      </div>

      {/* ================= BANK DETAILS ================= */}
      {companyProfile.bank && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#eaf1ff',
          border: '1px solid #b6ccff',
          color: 'black'
        }}>
          <h4 style={{ color: '#1e3a8a' }}>Bank Details</h4>
          <p><strong>Bank:</strong> {companyProfile.bank.bankName}</p>
          <p><strong>Branch:</strong> {companyProfile.bank.branch}</p>
          <p><strong>Account Name:</strong> {companyProfile.bank.accountName}</p>
          <p><strong>Account Number:</strong> {companyProfile.bank.accountNumber}</p>
          {companyProfile.bank.swift &&
            <p><strong>SWIFT Code:</strong> {companyProfile.bank.swift}</p>}
        </div>
      )}

      {/* ================= DISCLAIMER ================= */}
      <div style={{
        marginTop: '25px',
        paddingTop: '10px',
        borderTop: '1px solid #b6ccff',
        fontSize: '12px',
        color: '#1e3a8a',
        textAlign: 'center'
      }}>
        This is a computer generated quotation and does not require a signature.
      </div>

    </div>
  )
}

const thStyle = {
  border: '1px solid #b6ccff'
}

const tdStyle = {
  border: '1px solid #b6ccff'
}

export default QuotationPreview