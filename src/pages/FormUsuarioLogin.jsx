import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FormUsuarioLogin.css';
import { supabase } from "/supabaseClient.js";

const FormUsuarioLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // --- LÓGICA DE AUTENTICAÇÃO ---

      // 1. VERIFICAÇÃO ESPECIAL PARA O ADMIN
      if (email.toLowerCase() === 'nicolasadmin@gmail.com') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error('Credenciais de administrador inválidas.');
        navigate('/admin');
        return;
      }

      // 2. FLUXO PARA OUTROS USUÁRIOS
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) throw new Error('E-mail ou senha inválidos.');
      if (!authData.user) throw new Error('Falha ao obter informações do usuário.');

      // --- CORREÇÃO PRINCIPAL ESTÁ AQUI ---
      // 3. TENTA ENCONTRAR O USUÁRIO EM AMBAS AS TABELAS DE PERFIS (Colaboradores e Usuários)
      
      // Busca na tabela de colaboradores
      const { data: colaboradorData } = await supabase
        .from('colaboradores')
        .select('cargo_colaborador')
        .eq('email_colaborador', authData.user.email)
        .single();

      // Se encontrou como colaborador, redireciona e encerra
      if (colaboradorData) {
        const cargo = colaboradorData.cargo_colaborador;
        if (cargo === 'agente ambiental') navigate('/agentes');
        else if (cargo === 'motorista') navigate('/motoristas');
        else navigate('/'); // Fallback para cargos desconhecidos
        return; // Encerra a função aqui
      }

      // Se NÃO era colaborador, busca na tabela de usuários comuns
      const { data: usuarioData } = await supabase
        .from('usuarios') // Assumindo que sua tabela de usuários comuns se chama 'usuarios'
        .select('id_usuario')
        .eq('email', authData.user.email)
        .single();

      // Se encontrou como usuário comum, redireciona e encerra
      if (usuarioData) {
        navigate('/tela-usuario');
        return; // Encerra a função aqui
      }

      // 4. SE CHEGOU AQUI, O USUÁRIO NÃO TEM PERFIL VÁLIDO
      // Isso acontece se a conta de autenticação existe, mas não há registro correspondente
      // nem em 'colaboradores' nem em 'usuarios'. Este é o caso do seu "ex-colaborador".
      
      // Desloga o usuário para segurança
      await supabase.auth.signOut();
      
      // Lança um erro informando que o acesso foi revogado.
      throw new Error('Acesso negado. Sua conta não possui um perfil ativo.');

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-wrapper">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {erro && <p className="erro-login">{erro}</p>}
        <label htmlFor="email"></label>
        <input type="email" id="email" placeholder="Digite seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="senha"></label>
        <input type="password" id="senha" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <button type="submit" className="btn-entrar" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="cadastro-links">
          <a href="#">Esqueceu sua senha?</a>
          <Link to="/criar-conta" className="btn-criar-conta">Criar nova conta</Link>
        </div>
      </form>
    </div>
  );
};

export default FormUsuarioLogin;
