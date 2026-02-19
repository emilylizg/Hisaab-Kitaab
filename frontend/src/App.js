import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar.js";
import Footer from "./Components/Footer/Footer.js";
import Home from "./Pages/Home/Home.js";
import Register from "./Pages/Register/Register.js";
import Login from "./Pages/Login/Login.js";
import Transactions from "./Pages/Transactions/Transactions.js";
// import Dashboard from "./Pages/Dashboard/Dashboard.js";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
       <Route path="/" element={<Home />} /> {/* Default route */} 
       <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} /> {/* Home now at /home */}
        <Route path="/transactions" element={<Transactions />} />
        {/* //<Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
