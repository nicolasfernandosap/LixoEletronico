// App.jsx
import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// --- ADIÇÃO: Importa o componente de proteção de rotas ---
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

// Minhas Páginas de navegação 
import Home from './pages/Home';
import AuxilioLixo from './pages/AuxilioLixo';
import PontosAutorizados from './pages/PontosAutorizados';
import Contato from './pages/Contato';
import Cadastro from './pages/FormUsuarioLogin.jsx'; // Esta é a sua página de Login
import CriarContaUsuario from './pages/CriarContaUsuario';
import TelaUsuarios from "./pages/telas/TelaUsuarios/TelaUsuarios.jsx";
import TelaAgentesAmbientais from './pages/telas/TelaAgentesAmbientais/MenuTelaAgentesAmbientais.jsx';
import MenuTelaMotoristas from './pages/telas/TelaMotoristas/MenuTelaMotoristas.jsx';
import MenuTelaAdministrador from './pages/telas/TelaAdministrador/MenuTelaAdministrador.jsx';

// 2. Crie um componente de Layout que vai gerenciar o que é exibido
const AppLayout = () => {
  const location = useLocation(); // Hook que nos dá informações sobre a rota atual
  const { pathname } = location; // Extrai o caminho da URL 

  //Definindo em quais rotas o Header NÃO deve aparecer
  const rotasSemHeader = ['/tela-usuario', '/criar-conta', '/agentes', '/motoristas', '/admin'];
  
  //Verificando se a rota atual está na lista de exceções
  const mostrarHeader = !rotasSemHeader.includes(pathname);

  return (
    <div className="app-container">
      {/* 5. Renderização condicional: só mostra o Header se a condição for verdadeira */}
      {mostrarHeader && <Header />}

      <main className="main-content">
        <Routes>
          {/* --- ROTAS PÚBLICAS (Acessíveis por todos) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/auxilio" element={<AuxilioLixo />} />
          <Route path="/pontos" element={<PontosAutorizados />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/cadastro" element={<Cadastro />} /> {/* Rota de Login */}
          <Route path="/criar-conta" element={<CriarContaUsuario />} />

          {/* --- ROTAS PROTEGIDAS (Exigem login e cargo específico) --- */}

          {/* Rota do Administrador: Somente o cargo 'admin' pode acessar */}
          <Route element={<ProtectedRoute cargosPermitidos={['admin']} />}>
            <Route path="/admin" element={<MenuTelaAdministrador />} />
          </Route>

          {/* Rota dos Agentes: Somente o cargo 'agente ambiental' pode acessar */}
          <Route element={<ProtectedRoute cargosPermitidos={['agente ambiental']} />}>
            <Route path="/agentes" element={<TelaAgentesAmbientais />} />
          </Route>

          {/* Rota dos Motoristas: Somente o cargo 'motorista' pode acessar */}
          <Route element={<ProtectedRoute cargosPermitidos={['motorista']} />}>
            <Route path="/motoristas" element={<MenuTelaMotoristas />} />
          </Route>

          {/* Rota do Usuário Comum: Somente o cargo 'usuario' pode acessar */}
          <Route element={<ProtectedRoute cargosPermitidos={['usuario']} />}>
            <Route path="/tela-usuario" element={<TelaUsuarios />} />
          </Route>

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
