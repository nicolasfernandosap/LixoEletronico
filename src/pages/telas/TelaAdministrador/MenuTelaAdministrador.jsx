import React, { useState } from 'react';
import './MenuTelaAdministrador.css';
import {
  FaHome,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
  FaUsersCog 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { IconeMenuAdicaoColaboradores } from './IconeMenuAdicaoColaboradores.jsx';
import { IconeMenuExclusaoColaboradores } from './IconeMenuExclusaoColaboradores.jsx';

const AbaHomeAdmin = () => (
  <div>
    <h2>Visão Geral - Administrador</h2>
    <p>Dashboard com estatísticas e informações gerais (a ser implementado).</p>
  </div>
);

const AbaConfiguracoesAdmin = () => (
  <div>
    <h2>Configurações da Conta</h2>
    <p>Opções de configuração para o administrador (a ser implementado).</p>
  </div>
);

const MenuTelaAdministrador = () => {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'home', icon: FaHome, label: 'Home', component: AbaHomeAdmin },
    { id: 'adicionarColaborador', icon: FaUserPlus, label: 'Adicionar', component: IconeMenuAdicaoColaboradores },
    // --- CORREÇÃO APLICADA: Label renomeado de "Gerenciar" para "Excluir" ---
    { id: 'gerenciarColaboradores', icon: FaUsersCog, label: 'Excluir', component: IconeMenuExclusaoColaboradores },
    { id: 'configuracoes', icon: FaCog, label: 'Configurações', component: AbaConfiguracoesAdmin },
  ];

  const handleLogout = () => {
    navigate('/cadastro');
  };

  const handleItemClick = (id) => {
    setAbaAtiva(id);
  };

  const ComponenteAba = sidebarItems.find(item => item.id === abaAtiva)?.component || AbaHomeAdmin;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-title">
          <h2>Painel do Administrador</h2>
        </div>
        <nav className="admin-top-menu">
        </nav>
      </header>

      <nav className="admin-sidebar">
        <ul className="admin-menu-list">
          {sidebarItems.map(item => (
            <li key={item.id}>
              <div
                className={`admin-menu-item ${abaAtiva === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
              >
                <item.icon className="admin-menu-icon" />
                <span className="admin-menu-label">{item.label}</span>
              </div>
            </li>
          ))}
          <li>
            <div className="admin-menu-item admin-logout-item" onClick={handleLogout} title="Sair">
              <FaSignOutAlt className="admin-menu-icon" />
              <span className="admin-menu-label">Sair</span>
            </div>
          </li>
        </ul>
      </nav>

      <main className="admin-content-area">
        <div className="admin-content-container">
          <ComponenteAba />
        </div>
      </main>
    </div>
  );
};

export default MenuTelaAdministrador;
