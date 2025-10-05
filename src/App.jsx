import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Suas páginas
import Home from './pages/Home';
import AuxilioLixo from './pages/AuxilioLixo';
import PontosAutorizados from './pages/PontosAutorizados';
import Contato from './pages/Contato';
import Cadastro from './pages/FormUsuarioLogin.jsx';
import CriarContaUsuario from './pages/CriarContaUsuario';
import TelaUsuarios from "./pages/telas/TelaUsuarios.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auxilio" element={<AuxilioLixo />} />
            <Route path="/pontos" element={<PontosAutorizados />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/criar-conta" element={<CriarContaUsuario />} />
            <Route path="/tela-usuario" element={<TelaUsuarios />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

