import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Browse from './pages/Browse'
import Organizer from './pages/Organizer'
import Home from './pages/Home'
import Cart from './pages/Cart'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Browse" element={<Browse />} />
          <Route path="/Organizer" element={<Organizer />} />
          <Route path="/Cart" element={<Cart />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
