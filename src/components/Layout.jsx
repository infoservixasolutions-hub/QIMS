import "../styles/layout.css";
import logo from "../assets/logo.png";

const Layout = ({ children, tab, setTab, onLogout }) => {
  return (
    <div className="layout-container">

      {/* HEADER */}
      <div className="header card">

        {/* LEFT */}
        <div className="header-left">
          <img src={logo} className="header-logo" />
          <h2>Quotation & Invoice Management System</h2>
        </div>

        {/* NAV */}
        <div className="header-nav">
          <button
            className={`nav-btn ${tab === "quotation" ? "active" : ""}`}
            onClick={() => setTab("quotation")}
          >
            New Quotation
          </button>

          <button
            className={`nav-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            Quotation History
          </button>

          <button
            className={`nav-btn ${tab === "invoice" ? "active" : ""}`}
            onClick={() => setTab("invoice")}
          >
            Final Invoice
          </button>

          <button
            className={`nav-btn ${tab === "invoiceHistory" ? "active" : ""}`}
            onClick={() => setTab("invoiceHistory")}
          >
            Invoice History
          </button>

          <button
            className={`nav-btn ${tab === "ledger" ? "active" : ""}`}
            onClick={() => setTab("ledger")}
          >
            Ledger
          </button>
        </div>

        {/* RIGHT */}
        <button className="btn-danger" onClick={onLogout}>
          Logout
        </button>

      </div>

      {/* CONTENT */}
      <div className="layout-content">
  <div style={{ padding: "20px" }}>
    {children}
  </div>
</div>

      <div className="footer">
  © {new Date().getFullYear()} Servixa Solutions (Pvt) Ltd. All rights reserved.
</div>

    </div>
  );
};

export default Layout;