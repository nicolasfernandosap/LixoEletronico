import React, { useState } from 'react';
import './MenuTelaAgentesAmbientais.css';
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaCog,
  FaTruck,
  FaCalendarAlt,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaPlusCircle,
  FaBars // Ícone para menu mobile
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Importação dos novos componentes de sub-tela
import IconeMenuCadastroCliente from './IconeMenuCadastroCliente';
import IconeMenuChamadosPendentes from './IconeMenuChamadosPendentes';
import IconeMenuRealizarAgendamento from './IconeMenuRealizarAgendamento';
import IconeMenuOrdensCanceladas from './IconeMenuOrdensCanceladas';
import IconeMenuDestinoTransporte from './IconeMenuDestinoTransporte';

// Componente de Configurações (Mantido aqui conforme solicitação do usuário)
const AbaConfiguracoes = () => <div>Conteúdo das Configurações (A ser implementado ou migrado)</div>;

// Componente Home (Visão Geral/Dashboard)
const AbaHome = () => <div>Conteúdo da Home do Agente Ambiental (Visão Geral)</div>;


const MenuTelaAgentesAmbientais = () => {
  const [abaAtiva, setAbaAtiva] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para menu mobile
  const navigate = useNavigate();

  // Mapeamento dos itens do menu lateral
  const sidebarItems = [
    { id: 'home', icon: FaHome, label: 'Home', component: AbaHome },
    { id: 'cadastroCliente', icon: FaPlusCircle, label: 'Cadastro Clientes', component: IconeMenuCadastroCliente },
    { id: 'chamadosPendentes', icon: FaClipboardList, label: 'Chamados Pendentes', component: IconeMenuChamadosPendentes },
    { id: 'agendamento', icon: FaCalendarAlt, label: 'Realizar Agendamento', component: IconeMenuRealizarAgendamento },
    { id: 'ordensCanceladas', icon: FaTimesCircle, label: 'Ordens Canceladas', component: IconeMenuOrdensCanceladas },
    { id: 'destinoTransporte', icon: FaMapMarkerAlt, label: 'Destino/Transporte', component: IconeMenuDestinoTransporte },
  ];

  // Mapeamento dos itens do menu superior (Configurações)
  const topMenuItems = [
    { id: 'configuracoes', icon: FaCog, label: 'Configurações', component: AbaConfiguracoes },
  ];

  const handleLogout = () => {
    // Lógica de logout do Supabase (a ser implementada ou movida)
    // const { error } = await supabase.auth.signOut();
    // if (!error) {
      navigate('/'); // Redireciona para a tela de login/home
    // }
  };

  const ComponenteAba = [...sidebarItems, ...topMenuItems].find(item => item.id === abaAtiva)?.component || AbaHome;

  const handleItemClick = (id) => {
    setAbaAtiva(id);
    // Fecha o menu lateral no mobile após a seleção
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="agente-ambiental-layout">
      {/* === MENU SUPERIOR (Header) === */}
      <header className="top-header">
        <div className="navegacaoBarra-header">
          <h2>Agente Ambiental</h2>
        </div>
        
        {/* Botão de menu mobile */}
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
        </button>

        <nav className="top-menu-nav">
          <ul className="menus-list top-menu-list">
            {topMenuItems.map(item => (
              <li
                key={item.id}
                className={`menus-item ${abaAtiva === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
              >
                <item.icon className="menus-icon" />
                <span className="menus-label">{item.label}</span>
              </li>
            ))}
            <li className="menus-item logout-item" onClick={handleLogout} title="Sair">
              <FaSignOutAlt className="menus-icon" />
              <span className="menus-label">Sair</span>
            </li>
          </ul>
        </nav>
      </header>

      {/* === MENU LATERAL (Sidebar) === */}
      <nav className={`navegacaoBarra ${isSidebarOpen ? 'open' : ''}`}>
        <ul className="menus-list sidebar-menu-list">
          {sidebarItems.map(item => (
            <li
              key={item.id}
              className={`menus-item ${abaAtiva === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
            >
              <item.icon className="menus-icon" />
              <span className="menus-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Overlay para fechar menu no mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* === CONTEÚDO PRINCIPAL === */}
      <main className="content-area">
        <div className="aba-container">
          <ComponenteAba />
        </div>
      </main>
    </div>
  );
};

export default MenuTelaAgentesAmbientais;
