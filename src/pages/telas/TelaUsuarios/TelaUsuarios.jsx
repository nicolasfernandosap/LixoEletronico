import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './TelaUsuarios.css';

// Importação dos formulários usados em diferentes abas
import FormularioOrdensServico from './FormularioOrdensServico';
import FormularioDoacaoEquipamento from './FormularioDoacaoEquipamento';
import StatusOS from './StatusOS'; // Novo componente para Status OS


// Importação dos ícones usados na interface
import { 
  FaHome, 
  FaClipboardList, 
  FaClipboardCheck,  // novo ícone para “Acompanhamento OS”
  FaSignOutAlt, 
  FaBars, 
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa';

const TelaUsuarios = () => {
  // -----------------------------
  // ESTADOS GERAIS DO COMPONENTE
  // -----------------------------

  // Nome e endereço do usuário logado
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [enderecoUsuario, setEnderecoUsuario] = useState(null);

  // Controle de carregamento e menu lateral
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Aba atualmente selecionada (Início, Ordens, Acompanhamento, etc.)
  const [abaSelecionada, setAbaSelecionada] = useState('inicio');

  const navigate = useNavigate();

  // -----------------------------
  // BLOQUEIA SCROLL AO ABRIR MENU MOBILE
  // -----------------------------
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Limpeza ao desmontar o componente
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMobileMenuOpen]);

  // Função para abrir/fechar o menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // -----------------------------
  // BUSCA DADOS DO USUÁRIO LOGADO
  // -----------------------------
  useEffect(() => {
    const buscarDadosUsuario = async () => {
      setLoading(true);

      // Obtém sessão atual do usuário no Supabase
      const { data: { session } } = await supabase.auth.getSession();

      // Se não houver sessão, redireciona para cadastro/login
      if (!session) {
        navigate('/cadastro');
        return;
      }

      const userId = session.user.id;

      // Busca informações complementares do usuário (nome e endereço)
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome_completo, endereco, numero_casa, bairro, cidade, estado, cep')
        .eq('id_usuario', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setNomeUsuario('Usuário');
      } else if (data) {
        setNomeUsuario(data.nome_completo);
        setEnderecoUsuario({
          endereco: data.endereco,
          numero: data.numero_casa,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep
        });
      }

      setLoading(false);
    };

    buscarDadosUsuario();
  }, [navigate]);

  // -----------------------------
  // LOGOUT DO USUÁRIO
  // -----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // volta para tela inicial
  };

  // -----------------------------
  // COMPONENTES DE PERFIL (USUÁRIO OU CARREGANDO)
  // -----------------------------
  const LoadingProfile = () => (
    <div className="user-info">
      <div className="foto-placeholder loading"></div>
      <p className="nome-usuario loading"></p>
    </div>
  );

  const UserProfile = () => (
    <div className="user-info">
      {/* Exibe apenas a inicial do nome do usuário */}
      <div className="avatar">{nomeUsuario.charAt(0)}</div>
      <h2>{nomeUsuario}</h2>
      <p>Área do Cliente</p>
    </div>
  );

  // -------------------------------------------------------------
  // ITENS DE NAVEGAÇÃO (MENU) BARRA INFERIOR EXIBIDA E LATERAL
  // -------------------------------------------------------------
  const navItems = (
    <>
      <li onClick={() => { setAbaSelecionada('inicio'); setIsMobileMenuOpen(false); }} className={abaSelecionada === 'inicio' ? 'active' : ''}>
        <FaHome /> <span>Início</span>
      </li>

      <li onClick={() => { setAbaSelecionada('ordens'); setIsMobileMenuOpen(false); }} className={abaSelecionada === 'ordens' ? 'active' : ''}>
        <FaClipboardList /> <span>Solicitação Coleta</span>
      </li>

      
      <li onClick={() => { setAbaSelecionada('acompanhamento'); setIsMobileMenuOpen(false); }} className={abaSelecionada === 'acompanhamento' ? 'active' : ''}>
        <FaClipboardCheck /> <span>OS Acompanhamento</span>
      </li>

   
      <li onClick={() => { setAbaSelecionada('endereco'); setIsMobileMenuOpen(false); }} className={abaSelecionada === 'endereco' ? 'active' : ''}>
        <FaMapMarkerAlt /> <span>Endereço</span>
      </li>

      <li onClick={() => { setAbaSelecionada('doacao'); setIsMobileMenuOpen(false); }} className={abaSelecionada === 'doacao' ? 'active' : ''}>
        <FaHeart /> <span>Doar Equipamento</span>
      </li>
    </>
  );

  // -----------------------------
  // CONTEÚDO PRINCIPAL DO DASHBOARD
  // -----------------------------
  return (
    <div className={`dashboard-wrapper ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      
      {/* === SIDEBAR === */}
      <div className="sidebar">
        <div className="sidebar-content-wrapper">
          {loading ? <LoadingProfile /> : <UserProfile />}
          <nav className="sidebar-menu">
            <ul>{navItems}</ul>
          </nav>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Sair</span>
        </button>
      </div>

      {/* === PERFIL EM MODO MOBILE === */}
      <div className="mobile-profile-menu">
        <div className="sidebar-content-wrapper">
          {loading ? <LoadingProfile /> : <UserProfile />}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Sair</span>
        </button>
      </div>

      {/* === SOBREPOSIÇÃO QUANDO MENU MOBILE ESTÁ ABERTO === */}
      {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu}></div>}

      {/* === CONTEÚDO DAS ABAS === */}
      <div className="dashboard-content">

        {/* ABA INÍCIO */}
        {abaSelecionada === 'inicio' && (
          <>
            <h1>Painel do Cliente</h1>
            <section className="content-section">
              <h2>Bem-vindo ao seu Painel</h2>
              <p>Aqui você pode gerenciar suas ordens de serviço, atualizar seu endereço e fazer doações de equipamentos.</p>
              
              {/* Cards de atalhos rápidos */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <FaClipboardList className="stat-icon" />
                  <div className="stat-info">
                    <h3>Ordens de Serviço</h3>
                    <p>Gerencie suas solicitações</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <FaHeart className="stat-icon" />
                  <div className="stat-info">
                    <h3>Doações</h3>
                    <p>Doe equipamentos eletrônicos</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <FaMapMarkerAlt className="stat-icon" />
                  <div className="stat-info">
                    <h3>Endereço</h3>
                    <p>Mantenha seus dados atualizados</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ABA ORDEM DE SERVIÇO */}
        {abaSelecionada === 'ordens' && (
          <>
            <h1>Ordem de Serviço</h1>
            <FormularioOrdensServico />
          </>
        )}

        {/* ABA ACOMPANHAMENTO DE OS */}
	        {abaSelecionada === 'acompanhamento' && (
	          <>
	            <h1>Acompanhamento de Ordens de Serviço</h1>
	            <StatusOS /> 
	          </>
	        )}

        {/* ABA ENDEREÇO */}
        {abaSelecionada === 'endereco' && (
          <>
            <h1>Meu Endereço</h1>
            <section className="content-section">
              {enderecoUsuario ? (
                <div className="endereco-info">
                  <p><strong>Endereço:</strong> {enderecoUsuario.endereco}, {enderecoUsuario.numero}</p>
                  <p><strong>Bairro:</strong> {enderecoUsuario.bairro}</p>
                  <p><strong>Cidade:</strong> {enderecoUsuario.cidade} - {enderecoUsuario.estado}</p>
                  <p><strong>CEP:</strong> {enderecoUsuario.cep}</p>
                </div>
              ) : (
                <p className="sem-ordens">Endereço não encontrado.</p>
              )}
            </section>
          </>
        )}

        {/* ABA DOAÇÃO */}
        {abaSelecionada === 'doacao' && (
          <>
            <h1>Doação de Equipamento</h1>
            <FormularioDoacaoEquipamento />
          </>
        )}
      </div>

      {/* === MENU INFERIOR (VISÍVEL NO MOBILE) === */}
      <nav className="bottom-nav">
        <ul>
          {navItems}
          <li onClick={toggleMobileMenu}>
            <FaBars /> <span>Menu</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default TelaUsuarios;