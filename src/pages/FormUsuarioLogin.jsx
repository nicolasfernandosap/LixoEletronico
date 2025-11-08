import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FormUsuarioLogin.css'; // Seu CSS de login
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
      // --- LÓGICA ESPECIAL PARA O ADMIN ---
      // Passo 1: Verifica se é o email do admin antes de qualquer coisa.
      if (email.toLowerCase() === 'nicolasadmin@gmail.com') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error('Credenciais de administrador inválidas.');
        
        // Se o login do admin for bem-sucedido, redireciona e para a execução.
        navigate('/admin'); 
        return; 
      }

      // --- FLUXO NORMAL PARA OUTROS USUÁRIOS ---
      // Passo 2: Tenta fazer o login para usuários comuns.
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) throw new Error('E-mail ou senha inválidos.');
      if (!authData.user) throw new Error('Falha ao obter informações do usuário.');

      // Passo 3: Busca o cargo na tabela 'colaboradores' usando o email.
      const { data: colaboradorData, error: colaboradorError } = await supabase
        .from('colaboradores')
        .select('cargo_colaborador')
        .eq('email_colaborador', authData.user.email)
        .single();

      if (colaboradorError && colaboradorError.code !== 'PGRST116') {
        throw colaboradorError;
      }

      // Passo 4: Redireciona com base no cargo ou se é um usuário comum.
      if (colaboradorData) {
        const cargo = colaboradorData.cargo_colaborador;
        if (cargo === 'agente ambiental') navigate('/agentes');
        else if (cargo === 'motorista') navigate('/motoristas');
        else navigate('/'); // Fallback para cargos desconhecidos
      } else {
        // Se não está na tabela 'colaboradores', é um usuário padrão.
        navigate('/tela-usuario');
      }

    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  // O return do JSX continua o mesmo...
  return (
    <div className="cadastro-wrapper">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
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
