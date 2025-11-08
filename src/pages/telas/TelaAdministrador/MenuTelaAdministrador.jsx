
import React, { useState } from 'react';
import './MenuTelaAdministrador.css';
import {
  FaHome,
  FaUserPlus,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
// Importa o hook 'useNavigate' para realizar redirecionamentos programaticamente (ex: no logout).
import { useNavigate } from 'react-router-dom';
// Importa o componente que será renderizado em uma das abas.
// A importação com chaves {} é usada porque 'IconeMenuAdicaoColaboradores' é uma exportação nomeada.
import { IconeMenuAdicaoColaboradores } from './IconeMenuAdicaoColaboradores';

// ==========================================================================
// 2. COMPONENTES INTERNOS (PLACEHOLDERS)
// ==========================================================================

// Componente para a aba "Home" do administrador.
const AbaHomeAdmin = () => (
  <div>
    <h2>Visão Geral - Administrador</h2>
    <p>Dashboard com estatísticas e informações gerais (a ser implementado).</p>
  </div>
);

// Componente para a aba "Configurações".
const AbaConfiguracoesAdmin = () => (
  <div>
    <h2>Configurações da Conta</h2>
    <p>Opções de configuração para o administrador (a ser implementado).</p>
  </div>
);

// ==========================================================================
// 3. COMPONENTE PRINCIPAL: MenuTelaAdministrador
// ==========================================================================
const MenuTelaAdministrador = () => {
  // ==========================================================================
  // 3.1. ESTADO E NAVEGAÇÃO
  // ==========================================================================
  // Cria uma variável de estado 'abaAtiva' para saber qual menu está selecionado.
  // O valor inicial 'home' define qual conteúdo será exibido ao carregar a página.
  const [abaAtiva, setAbaAtiva] = useState('home');
  // Inicializa o hook de navegação para poder redirecionar o usuário.
  const navigate = useNavigate();

  // ==========================================================================
  // 3.2. DEFINIÇÃO DOS ITENS DE MENU
  // ==========================================================================
  // Um array de objetos que define os itens do menu lateral (e da barra inferior no mobile).
  // Cada objeto tem um 'id' (para o estado), um 'icon', um 'label' (texto) e o 'component' a ser renderizado.
  const sidebarItems = [
    { id: 'home', icon: FaHome, label: 'Home', component: AbaHomeAdmin },
    { id: 'adicionarColaborador', icon: FaUserPlus, label: 'Adicionar', component: IconeMenuAdicaoColaboradores },
    { id: 'configuracoes', icon: FaCog, label: 'Configurações', component: AbaConfiguracoesAdmin },
  ];

  // ==========================================================================
  // 3.3. FUNÇÕES DE EVENTO (HANDLERS)
  // ==========================================================================
  // Função para deslogar o usuário. No futuro, chamará a função do Supabase.
  const handleLogout = () => {
    // Por enquanto, apenas redireciona para a página de login.
    navigate('/cadastro'); // Use '/cadastro' ou '/login' conforme sua rota.
  };

  // Função chamada quando um item do menu é clicado.
  // Ela atualiza o estado 'abaAtiva' para o 'id' do item clicado.
  const handleItemClick = (id) => {
    setAbaAtiva(id);
  };

  // ==========================================================================
  // 3.4. LÓGICA DE RENDERIZAÇÃO
  // ==========================================================================
  // Procura na lista de itens de menu qual objeto corresponde à 'abaAtiva' atual.
  // Em seguida, pega o 'component' desse objeto para renderizá-lo.
  // Se nada for encontrado, renderiza o 'AbaHomeAdmin' como padrão.
  const ComponenteAba = sidebarItems.find(item => item.id === abaAtiva)?.component || AbaHomeAdmin;

  // ==========================================================================
  // 3.5. ESTRUTURA JSX (O QUE SERÁ EXIBIDO NA TELA)
  // ==========================================================================
  return (
    <div className="admin-layout">
      {/* --- CABEÇALHO --- */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h2>Painel do Administrador</h2>
        </div>
        {/* Menu superior que só aparece no desktop */}
        <nav className="admin-top-menu">
          {/* Este menu pode ser usado para notificações, perfil, etc. */}
        </nav>
      </header>

      {/* --- SIDEBAR (QUE VIRA BARRA INFERIOR NO MOBILE) --- */}
      <nav className="admin-sidebar">
        {/* A lista de menu principal. O CSS cuidará de estilizá-la de forma diferente */}
        <ul className="admin-menu-list">
          {/* Mapeia o array 'sidebarItems' para criar os itens de menu dinamicamente */}
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
          {/* O item de Sair é adicionado manualmente à lista para fazer parte do layout responsivo */}
          <li>
            <div className="admin-menu-item admin-logout-item" onClick={handleLogout} title="Sair">
              <FaSignOutAlt className="admin-menu-icon" />
              <span className="admin-menu-label">Sair</span>
            </div>
          </li>
        </ul>
      </nav>

      {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- */}
      <main className="admin-content-area">
        {/* O container branco onde o conteúdo da aba ativa será renderizado */}
        <div className="admin-content-container">
          <ComponenteAba />
        </div>
      </main>
    </div>
  );
};

export default MenuTelaAdministrador;
