import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { LangProvider } from './lib/langContext'
import { ensureSeeded } from './lib/store'
import Home from './screens/Home'
import AddProduct from './screens/AddProduct'
import NewBill from './screens/NewBill'
import PaymentQR from './screens/PaymentQR'
import PaymentReceived from './screens/PaymentReceived'
import Reconciliation from './screens/Reconciliation'
import AskMerchant from './screens/AskMerchant'
import Insights from './screens/Insights'

// HashRouter (not BrowserRouter) so deep links survive a page refresh on static
// hosts with no server-side rewrite rule, e.g. GitHub Pages project sites.
export default function App() {
  useEffect(() => {
    ensureSeeded()
  }, [])

  return (
    <LangProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/bill/new" element={<NewBill />} />
          <Route path="/bill/:billId/qr" element={<PaymentQR />} />
          <Route path="/payment/:paymentId/received" element={<PaymentReceived />} />
          <Route path="/payment/:paymentId/reconcile" element={<Reconciliation />} />
          <Route path="/payment/:paymentId/ask" element={<AskMerchant />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </HashRouter>
    </LangProvider>
  )
}
