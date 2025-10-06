import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '/supabaseClient.js'; 
import './TelaUsuarios.css';
import { FaTools } from 'react-icons/fa';

const TelaUsuarios = () => {
  const [usuario] = useState({
    nome: 'Ola',
    endereco: 'Endereço',
    celular: 'Celular Informações',
  });

  const [mostrarIcone, setMostrarIcone] = useState(false);
  const navigate = useNavigate(); // 3. Inicializando o hook de navegação

  const handleAbrirOrdem = () => {
    setMostrarIcone(!mostrarIcone);
    console.log('Botão de ordem de serviço clicado!');
  };

  // 4. Criando a função de logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Efetua o logout no Supabase
    if (error) {
      console.error('Erro ao sair:', error);
    } else {
      navigate('/cadastro'); // Redireciona para a página de login após sair
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {/* 5. Cria um contêiner para o título e o botão */}
        <div className="header-content">
          <div>
            <h1>Minha Conta</h1>
            <p>Bem-vindo de volta, {usuario.nome.split(' ')[0]}!</p>
          </div>
         
          <button onClick={handleLogout} className="btn-sair">
            Sair
          </button>
        </div>
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
