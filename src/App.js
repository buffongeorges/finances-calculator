import './App.css';
import Sidebar from './components/Sidebar';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Clients from './pages/Clients';
import Client from './pages/Client';
function App() {
  return (
    <>
    <Router>
      <Sidebar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/products' element={<Products/>}/>
        <Route path='/clients' element={<Clients/>}/>
        <Route path='/new-client' element={<Client/>}/>
        <Route path='/reports' element={<Reports/>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
