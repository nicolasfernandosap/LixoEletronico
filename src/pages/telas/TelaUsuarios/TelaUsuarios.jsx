import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './TelaUsuarios.css';

import FormularioOrdensServico from './FormularioOrdensServico';
import FormularioDoacaoEquipamento from './FormularioDoacaoEquipamento';
import StatusOS from './StatusOS';

import { 
  FaHome, 
  FaClipboardList, 
  FaClipboardCheck, 
  FaSignOutAlt, 
  FaBars, 
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa';

const TelaUsuarios = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [enderecoUsuario, setEnderecoUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('inicio');
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/cadastro');
        return;
      }
      const userId = session.user.id;
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
          cep: data.cep,
        });
      }
      setLoading(false);
    };
    buscarDadosUsuario();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const LoadingProfile = () => (
    <div className="user-info">
      <div className="foto-placeholder loading"></div>
      <p className="nome-usuario loading"></p>
    </div>
  );

  const UserProfile = () => (
    <div className="user-info">
      <div className="avatar">{nomeUsuario.charAt(0)}</div>
      <h2>{nomeUsuario}</h2>
      <p>Área do Cliente</p>
    </div>
  );

  const navItems = (
    <>
      <li
        className={abaSelecionada === 'inicio' ? 'active' : ''}
        onClick={() => { setAbaSelecionada('inicio'); setIsMobileMenuOpen(false); }}
      >
        <FaHome aria-hidden="true" focusable="false" /> <span>Tela Inicial</span>
      </li>

      <li
        className={abaSelecionada === 'ordens' ? 'active' : ''}
        onClick={() => { setAbaSelecionada('ordens'); setIsMobileMenuOpen(false); }}
      >
        <FaClipboardList aria-hidden="true" focusable="false" /> <span>Solicitação Coleta</span>
      </li>

      <li
        className={abaSelecionada === 'acompanhamento' ? 'active' : ''}
        onClick={() => { setAbaSelecionada('acompanhamento'); setIsMobileMenuOpen(false); }}
      >
        <FaClipboardCheck aria-hidden="true" focusable="false" /> <span>Status Ordem</span>
      </li>

      <li
        className={abaSelecionada === 'endereco' ? 'active' : ''}
        onClick={() => { setAbaSelecionada('endereco'); setIsMobileMenuOpen(false); }}
      >
        <FaMapMarkerAlt aria-hidden="true" focusable="false" /> <span>Endereço</span>
      </li>

      <li
        className={abaSelecionada === 'doacao' ? 'active' : ''}
        onClick={() => { setAbaSelecionada('doacao'); setIsMobileMenuOpen(false); }}
      >
        <FaHeart aria-hidden="true" focusable="false" /> <span>Doar Equipamento</span>
      </li>
    </>
  );

  return (
    <div className={`dashboard-wrapper ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-content-wrapper">
          {loading ? <LoadingProfile /> : <UserProfile />}
          <nav className="sidebar-menu">
            <ul>{navItems}</ul>
          </nav>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt aria-hidden="true" focusable="false" /> <span>Sair</span>
        </button>
      </div>

      {/* PERFIL MOBILE */}
      <div className="mobile-profile-menu">
        <div className="sidebar-content-wrapper">
          {loading ? <LoadingProfile /> : <UserProfile />}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt aria-hidden="true" focusable="false" /> <span>Sair</span>
        </button>
      </div>

      {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu}></div>}

      {/* CONTEÚDO DAS ABAS */}
      <div className="dashboard-content">
        {abaSelecionada === 'inicio' && (
          <>
            <h1>Painel do Cliente</h1>
            <section className="content-section">
              <h2>Bem-vindo ao seu Painel</h2>
              <p>Aqui você pode gerenciar suas ordens de serviço, atualizar seu endereço e fazer doações de equipamentos.</p>

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

        {abaSelecionada === 'ordens' && (
          <>
            <h1>Ordem de Serviço</h1>
            <FormularioOrdensServico />
          </>
        )}

        {abaSelecionada === 'acompanhamento' && (
          <>
            <h1>Acompanhamento de Ordens de Serviço</h1>
            <StatusOS />
          </>
        )}

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

        {abaSelecionada === 'doacao' && (
          <>
            <h1>Doação de Equipamento</h1>
            <FormularioDoacaoEquipamento />
          </>
        )}
      </div>

      {/* MENU INFERIOR MOBILE */}
      <nav className="bottom-nav">
        <ul>
          {navItems}
          <li onClick={toggleMobileMenu}>
            <FaBars aria-hidden="true" focusable="false" /> <span>Menu</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default TelaUsuarios;