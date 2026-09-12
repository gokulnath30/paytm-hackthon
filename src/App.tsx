import { HashRouter, Route, Routes } from 'react-router-dom'
import Splash from './screens/Splash'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import AgentSelect from './screens/AgentSelect'
import StoreManagerChat from './screens/StoreManagerChat'
import AddProductVoice from './screens/AddProductVoice'
import ProductDetails from './screens/ProductDetails'
import Inventory from './screens/Inventory'
import SalesBilling from './screens/SalesBilling'
import Payment from './screens/Payment'
import TransactionSuccess from './screens/TransactionSuccess'
import BusinessInsights from './screens/BusinessInsights'

// HashRouter (not BrowserRouter) so deep links survive a page refresh on static
// hosts with no server-side rewrite rule, e.g. GitHub Pages project sites.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/assistants" element={<AgentSelect />} />
        <Route path="/chat/store-manager" element={<StoreManagerChat />} />
        <Route path="/chat/sales" element={<SalesBilling />} />
        <Route path="/add-product" element={<AddProductVoice />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<TransactionSuccess />} />
        <Route path="/insights" element={<BusinessInsights />} />
      </Routes>
    </HashRouter>
  )
}
