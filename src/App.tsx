import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

export default function App() {
  useEffect(() => {
    ensureSeeded()
  }, [])

  return (
    <LangProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </LangProvider>
  )
}
