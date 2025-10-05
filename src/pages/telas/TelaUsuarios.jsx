import React, { useState } from 'react';
import './TelaUsuarios.css';
// Você pode importar um ícone da biblioteca, por exemplo, react-icons
// Para instalar: npm install react-icons
import { FaTools } from 'react-icons/fa'; 

const TelaUsuarios = () => {
  // Dados do usuário (exemplo fixo por enquanto)
  const [usuario] = useState({
    nome: 'Ola',
    endereco: 'Endereço',
    celular: 'Celular Informações',
  });

  const [mostrarIcone, setMostrarIcone] = useState(false);

  const handleAbrirOrdem = () => {
    // Alterna a visibilidade do ícone
    setMostrarIcone(!mostrarIcone);
    console.log('Botão de ordem de serviço clicado!');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Minha Conta</h1>
        <p>Bem-vindo de volta, {usuario.nome.split(' ')[0]}!</p>
      </header>

      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>Meus Dados</h2>
          <div className="info-item">
            <strong>Nome:</strong>
            <p>{usuario.nome}</p>
          </div>
          <div className="info-item">
            <strong>Endereço:</strong>
            <p>{usuario.endereco}</p>
          </div>
          <div className="info-item">
            <strong>Celular:</strong>
            <p>{usuario.celular}</p>
          </div>
        </div>

        <div className="actions-card">
          <h2>Ações</h2>
          <button onClick={handleAbrirOrdem} className="btn-ordem-servico">
            Abrir Ordem de Serviço
          </button>
          
          {/* O ícone aparecerá aqui quando o estado 'mostrarIcone' for true */}
          {mostrarIcone && (
            <div className="icone-container">
              <FaTools size={50} color="#007bff" />
              <p>Ordem de serviço aberta!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelaUsuarios;
