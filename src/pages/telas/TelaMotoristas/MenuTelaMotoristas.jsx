import React, { useState } from 'react';
import './MenuTelaMotoristas.css';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import IconeMenuColetasPendendes from './IconeMenuColetasPendendes';
import IconeMenuColetasRealizadas from './IconeMenuColetasRealizadas';
import IconeMenuRoteiroColeta from './IconeMenuRoteiroColeta';

const AbaHome = () => <div className="mtm-home-content">Bem-vindo, Motorista! Aqui está sua visão geral.</div>;

const MenuTelaMotoristas = () => {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'home', label: 'Home', component: AbaHome },
    { id: 'coletasPendentes', label: 'Coletas Pendentes', component: IconeMenuColetasPendendes },
    { id: 'coletasRealizadas', label: 'Coletas Realizadas', component: IconeMenuColetasRealizadas },
    { id: 'roteiro', label: 'Roteiro de Coleta', component: IconeMenuRoteiroColeta },
  ];

  const handleLogout = () => {
    navigate('/cadastro');
  };

  const ComponenteAba = sidebarItems.find(item => item.id === abaAtiva)?.component || AbaHome;

  const handleItemClick = (id) => {
    setAbaAtiva(id);
  };

  return (
    <div className="mtm-layout">
      <header className="mtm-top-header">
        <h1 className="mtm-titulo">Monitoramento visitas Motoristas</h1>
      </header>

      <nav className="mtm-sidebar">
        <ul className="mtm-sidebar-menu-list">
          {sidebarItems.map(item => (
            <li
              key={item.id}
              className={`mtm-menus-item ${abaAtiva === item.id ? 'mtm-active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
            >
              <span className="mtm-menus-label">{item.label}</span>
            </li>
          ))}
          <li className="mtm-menus-item mtm-logout-item mtm-mobile-logout" onClick={handleLogout} title="Sair">
            <FaSignOutAlt className="mtm-menus-icon" />
            <span className="mtm-menus-label">Sair</span>
          </li>
        </ul>
      </nav>

      <main className="mtm-content-area">
        <div className="mtm-aba-container">
          <ComponenteAba />
        </div>
      </main>
    </div>
  );
};

export default MenuTelaMotoristas;
