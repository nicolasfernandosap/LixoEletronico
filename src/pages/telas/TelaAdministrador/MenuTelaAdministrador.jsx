import React, { useState } from 'react';
import './MenuTelaAdministrador.css';
import {
  FaHome,
  FaUserPlus,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Importação do componente da sub-tela de adição de colaboradores
// CORREÇÃO APLICADA AQUI: use chaves {} para uma exportação nomeada.
import { IconeMenuAdicaoColaboradores } from './IconeMenuAdicaoColaboradores';

// Componente placeholder para a Home do Administrador
const AbaHomeAdmin = () => <div><h2>Visão Geral - Administrador</h2><p>Dashboard com estatísticas e informações gerais.</p></div>;

// Componente placeholder para Configurações
const AbaConfiguracoesAdmin = () => <div><h2>Configurações da Conta</h2><p>Opções de configuração para o administrador.</p></div>;

const MenuTelaAdministrador = () => {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const navigate = useNavigate();

  // Mapeamento dos itens do menu lateral para o Administrador
  const sidebarItems = [
    { id: 'home', icon: FaHome, label: 'Home', component: AbaHomeAdmin },
    { id: 'adicionarColaborador', icon: FaUserPlus, label: 'Adicionar Colaborador', component: IconeMenuAdicaoColaboradores },
  ];

  // Itens do menu superior
  const topMenuItems = [
    { id: 'configuracoes', icon: FaCog, label: 'Configurações', component: AbaConfiguracoesAdmin },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  // Encontra o componente correto para renderizar com base na abaAtiva
  const ComponenteAba =
    [...sidebarItems, ...topMenuItems].find(item => item.id === abaAtiva)?.component || AbaHomeAdmin;

  const handleItemClick = (id) => {
    setAbaAtiva(id);
  };

  return (
    <div className="admin-layout">
      {/* ... resto do seu código JSX ... */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h2>Painel do Administrador</h2>
        </div>
        <nav className="admin-top-menu">
          <ul className="admin-menu-list admin-top-menu-list">
            {topMenuItems.map(item => (
              <li
                key={item.id}
                className={`admin-menu-item ${abaAtiva === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
              >
                <item.icon className="admin-menu-icon" />
                <span className="admin-menu-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <nav className="admin-sidebar">
        <ul className="admin-menu-list admin-sidebar-menu-list">
          {sidebarItems.map(item => (
            <li
              key={item.id}
              className={`admin-menu-item ${abaAtiva === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
            >
              <item.icon className="admin-menu-icon" />
              <span className="admin-menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="admin-sidebar-footer">
          <div className="admin-menu-item admin-logout-item" onClick={handleLogout} title="Sair">
            <FaSignOutAlt className="admin-menu-icon" />
            <span className="admin-menu-label">Sair</span>
          </div>
        </div>
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
