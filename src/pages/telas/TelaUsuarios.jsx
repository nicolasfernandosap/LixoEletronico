import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './TelaUsuarios.css';
import { 
  FaHome, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaMapMarkerAlt 
} from 'react-icons/fa'; // Novo ícone adicionado

const TelaUsuarios = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [enderecoUsuario, setEnderecoUsuario] = useState(null); // Novo estado
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [abaSelecionada, setAbaSelecionada] = useState('inicio'); // Controle da aba
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Erro ao obter sessão ou usuário não logado:', sessionError);
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
          cep: data.cep
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
      <p className="user-info-detail loading"></p>
    </div>
  );

  const UserProfile = () => (
    <div className="user-info">
      <div className="avatar">{nomeUsuario.charAt(0)}</div>
      <h2>{nomeUsuario}</h2>
      <p>Área do Cliente</p>
    </div>
  );

  return (
    <div className={`dashboard-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <button className="sidebar-toggle-btn close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        <div className="sidebar-content-wrapper">
          {loading ? <LoadingProfile /> : <UserProfile />}

          <nav className="sidebar-menu">
            <ul>
              <li onClick={() => setAbaSelecionada('inicio')}>
                <FaHome /> <span>Início</span>
              </li>
              <li onClick={() => setAbaSelecionada('ordens')}>
                <FaClipboardList /> <span>Ordem de Serviço</span>
              </li>
              <li onClick={() => setAbaSelecionada('endereco')}>
                <FaMapMarkerAlt /> <span>Endereço</span>
              </li>
            </ul>
          </nav>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Sair</span>
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="dashboard-content">
        <button className="sidebar-toggle-btn open-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        {abaSelecionada === 'inicio' && (
          <>
            <h1>Painel do Cliente</h1>
            <section className="ordens-section">
              <h2>Minhas Ordens de Serviço</h2>
              <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
            </section>
          </>
        )}

        {abaSelecionada === 'ordens' && (
          <>
            <h1>Ordens de Serviço</h1>
            <section className="ordens-section">
              <p className="sem-ordens">Nenhuma ordem cadastrada.</p>
            </section>
          </>
        )}

        {abaSelecionada === 'endereco' && (
          <>
            <h1>Meu Endereço</h1>
            <section className="ordens-section">
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
      </div>
    </div>
  );
};

export default TelaUsuarios;
