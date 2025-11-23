import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './FormUsuarioLogin.css';
import { supabase } from "/supabaseClient.js";

const FormUsuarioLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false); // Ícone de visualização
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Verifica admin
      if (email.toLowerCase() === 'nicolasadmin@gmail.com') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw new Error('Credenciais de administrador inválidas.');
        navigate('/admin');
        return;
      }

      // Usuários comuns
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) throw new Error('E-mail ou senha inválidos.');
      if (!authData.user) throw new Error('Falha ao obter informações do usuário.');

      // Busca colaborador
      const { data: colaboradorData } = await supabase
        .from('colaboradores')
        .select('cargo_colaborador')
        .eq('email_colaborador', authData.user.email)
        .single();

      if (colaboradorData) {
        const cargo = colaboradorData.cargo_colaborador;
        if (cargo === 'agente ambiental') navigate('/agentes');
        else if (cargo === 'motorista') navigate('/motoristas');
        else navigate('/');
        return;
      }

      // Busca usuário comum
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', authData.user.email)
        .single();

      if (usuarioData) {
        navigate('/tela-usuario');
        return;
      }

      await supabase.auth.signOut();
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
        <input
          type="email"
          id="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="senha"></label>
        <div className="senha-visualizacao-container">
          <input
            type={mostrarSenha ? "text" : "password"}
            id="senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            className="btn-visualizar-senha"
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Visualizar senha'}
            onClick={() => setMostrarSenha(!mostrarSenha)}
            tabIndex={0}
          >
            {mostrarSenha ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>

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
