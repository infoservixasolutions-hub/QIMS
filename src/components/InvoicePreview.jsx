import companyProfile from '../utils/companyProfile'
import logo from '../assets/logo.png'

const InvoicePreview = ({
  invoice,
  showSubtotal = true,
  showVat = true,
  showDiscount = true,
  showGrandTotal = true
}) => {
  const {
    invoiceNo,
    quotationNo,
    date,
    client = {},
    items = [],
    subtotal = 0,
    vatTotal = 0,
    discountType,
    discountValue,
    discountAmount = 0,
    grandTotal = 0,
    amountPaid = 0,
    balancePayable = 0,
    paymentStatus = 'UNPAID',
    paymentCompletedDate = null
  } = invoice || {}

  return (
    <div
      id="quotation-pdf"
      style={{
        padding: '25px',
        width: '700px',
        position: 'relative',
        background: 'linear-gradient(135deg, #d4e4ff, #ffffff)',
        border: '1px solid #b6ccff',
        fontFamily: 'Arial',
        color: "black"
      }}
    >
      {/* PAID SEAL */}
      {paymentStatus === 'PAID' && (
        <div
          style={{
            position: 'absolute',
            top: '240px',
            right: '160px',
            border: '5px solid #dc2626',
            color: '#dc2626',
            padding: '10px 28px',
            fontSize: '64px',
            fontWeight: 'bold',
            borderRadius: '50%',
            transform: 'rotate(-15deg)',
            background: 'rgba(255,255,255,0.9)'
          }}
        >
          PAID
        </div>
      )}

      {/* COMPANY HEADER */}
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

      {/* INVOICE INFO */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: '#eaf1ff',
        border: '1px solid #b6ccff'
      }}>
        <strong>Invoice No:</strong> INV-{invoiceNo}<br />
        {quotationNo ? (
          <><strong>Related Quotation:</strong> QT-{quotationNo}<br /></>
        ) : (
          <><strong>Invoice Type:</strong> Direct Invoice<br /></>
        )}

        <strong>Invoice Date:</strong> {date}<br />
        <strong>Payment Status:</strong> {paymentStatus}<br />

        {paymentStatus === 'PAID' && paymentCompletedDate && (
          <strong>Payment Completed On:</strong>
        )}{' '}
        {paymentStatus === 'PAID' && paymentCompletedDate}
      </div>

      {/* CLIENT INFO */}
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

      {/* ITEMS TABLE */}
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
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>VAT %</th>
            <th>VAT Amount</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const qty = Number(item.qty || 0)
            const price = Number(item.price || 0)
            const vat = Number(item.vat || 0)

            const base = qty * price
            const vatAmount = (base * vat) / 100
            const lineTotal = base + vatAmount

            return (
              <tr key={i}>
                <td style={{color: '#000000'}}>{item.description}</td>
                <td style={{ textAlign: 'center', color: '#000000' }}>{qty}</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>{price.toFixed(2)}</td>
                <td style={{ textAlign: 'center', color: '#000000' }}>{vat > 0 ? `${vat}%` : '—'}</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>{vatAmount.toFixed(2)}</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>{lineTotal.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: '15px' }}>
        <table width="100%" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <tbody>

            {showSubtotal && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>Subtotal</td>
                <td style={{ textAlign: 'right', width: '150px', color: '#000000' }}>
                  Rs. {Number(subtotal).toFixed(2)}
                </td>
              </tr>
            )}

            {showVat && vatTotal > 0 && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>VAT Total</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Rs. {Number(vatTotal).toFixed(2)}
                </td>
              </tr>
            )}

            {showDiscount && discountAmount > 0 && (
              <tr>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Rs'})
                </td>
                <td style={{ textAlign: 'right',color: '#000000' }}>
                  - Rs. {Number(discountAmount).toFixed(2)}
                </td>
              </tr>
            )}

            {showGrandTotal && (
              <tr>
                <td style={{ textAlign: 'right',color: '#000000' }}>Grand Total</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Rs. {Number(grandTotal).toFixed(2)}
                </td>
              </tr>
            )}

            <tr>
              <td style={{ textAlign: 'right', color: '#000000' }}>Amount Paid</td>
              <td style={{ textAlign: 'right', color: '#000000' }}>
                Rs. {Number(amountPaid).toFixed(2)}
              </td>
            </tr>

            {paymentStatus !== 'PAID' && (
              <tr style={{
                fontWeight: 'bold',
                background: '#eaf1ff',
                borderTop: '2px solid #2563eb'
              }}>
                <td style={{ textAlign: 'right', color: '#000000' }}>Balance</td>
                <td style={{ textAlign: 'right', color: '#000000' }}>
                  Rs. {Number(balancePayable).toFixed(2)}
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: '25px',
          paddingTop: '10px',
          borderTop: '1px solid #b6ccff',
          fontSize: '12px',
          color: '#1e3a8a',
          textAlign: 'center'
        }}
      >
        This is a computer generated invoice and does not require a signature.
      </div>
    </div>
  )
}

export default InvoicePreview