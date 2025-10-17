// App.jsx
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Minhas Páginas de navegação 
import Home from './pages/Home';
import AuxilioLixo from './pages/AuxilioLixo';
import PontosAutorizados from './pages/PontosAutorizados';
import Contato from './pages/Contato';
import Cadastro from './pages/FormUsuarioLogin.jsx';
import CriarContaUsuario from './pages/CriarContaUsuario';
import TelaUsuarios from "./pages/telas/TelaUsuarios/TelaUsuarios.jsx";

// 2. Crie um componente de Layout que vai gerenciar o que é exibido
const AppLayout = () => {
  const location = useLocation(); // Hook que nos dá informações sobre a rota atual
  const { pathname } = location; // Extrai o caminho da URL 

  //Definindo em quais rotas o Header NÃO deve aparecer
  const rotasSemHeader = ['/tela-usuario','/criar-conta'];
  

  //Verificando se a rota atual está na lista de exceções
  const mostrarHeader = !rotasSemHeader.includes(pathname);

  return (
    <div className="app-container">
      {/* 5. Renderização condicional: só mostra o Header se a condição for verdadeira */}
      {mostrarHeader && <Header />}

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

      {/* Aqui poderei ultilizar a mesma gregra para o footer a caso eu precisar */}
      {mostrarHeader && <Footer />}
    </div>
  );
};

// O componente App principal agora só precisa renderizar o Router e o AppLayout
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;


