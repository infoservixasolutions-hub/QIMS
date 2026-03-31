import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

import NewQuotation from "./pages/NewQuotation";
import QuotationHistory from "./pages/QuotationHistory";
import FinalInvoice from "./pages/FinalInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";
import Login from "./pages/Login";
import Ledger from "./pages/Ledger";
import Layout from "./components//Layout";

function App() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("quotation");
  const [editQuotation, setEditQuotation] = useState(null);

  if (!user) return <Login />;

  return (
  <Layout
    tab={tab}
    setTab={setTab}
    onLogout={() => signOut(auth)}
  >

    {tab === "quotation" && (
      <NewQuotation
        editQuotation={editQuotation}
        clearEdit={() => setEditQuotation(null)}
      />
    )}

    {tab === "history" && (
      <QuotationHistory
        onEdit={(q) => {
          setEditQuotation(q);
          setTab("quotation");
        }}
      />
    )}

    {tab === "invoice" && <FinalInvoice />}
    {tab === "invoiceHistory" && <InvoiceHistory />}
    {tab === "ledger" && <Ledger />}

  </Layout>
);
}

export default App;