import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // Caminho corrigido baseado na estrutura de pastas
import { useNavigate } from 'react-router-dom';
import './TelaUsuarios.css'; 
import { FaHome, FaClipboardList, FaSignOutAlt } from 'react-icons/fa'; // Ícones para o menu

const TelaUsuarios = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarNomeUsuario = async () => {
      setLoading(true);
      
      // 1. Obter a sessão atual do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Erro ao obter sessão ou usuário não logado:', sessionError);
        // Redireciona para a tela de login/cadastro se não houver sessão
        navigate('/cadastro'); 
        return;
      }

      const userId = session.user.id;

      // 2. Buscar o nome completo na tabela 'usuarios' usando o ID do usuário
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome_completo')
        .eq('id_usuario', userId)
        .single(); // Espera apenas um resultado

      if (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        setNomeUsuario('Erro ao carregar nome');
      } else if (data) {
        // Pegando o nome completo do cadastro Usuarios e Imprimindo na Dashboard do usuario logado
        setNomeUsuario(data.nome_completo);
      } else {
        setNomeUsuario('Usuário');
      }

      setLoading(false);
    };

    buscarNomeUsuario();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redireciona para a página inicial após o logout
  };

  // Estrutura de carregamento (Loading)
  const LoadingProfile = () => (
    <div className="user-info">
      <div className="foto-placeholder loading"></div>
      <p className="nome-usuario loading"></p>
      <p className="user-info-detail loading"></p>
    </div>
  );

  // Estrutura do Perfil do Usuário
  const UserProfile = () => (
    <div className="user-info">
      {/* Placeholder para a foto do usuário. Reutiliza a classe .avatar */}
      <div className="avatar">
        {/* Você pode colocar as iniciais do nome aqui se quiser */}
        {nomeUsuario.charAt(0)}
      </div>
      {/* O nome do usuário é exibido logo abaixo da foto */}
      <h2>{nomeUsuario}</h2>
      <p>Área do Cliente</p>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          {loading ? <LoadingProfile /> : <UserProfile />}

          <nav className="sidebar-menu">
            <ul>
              <li><FaHome /> Início</li>
              <li><FaClipboardList /> Minhas Ordens</li>
            </ul>
          </nav>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="dashboard-content">
        <h1>Dashboard do Cliente</h1>

        {/* Exemplo de conteúdo principal */}
        <section className="ordens-section">
          <h2>Minhas Ordens de Serviço</h2>
          <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
        </section>
      </div>
    </div>
  );
};

export default TelaUsuarios;