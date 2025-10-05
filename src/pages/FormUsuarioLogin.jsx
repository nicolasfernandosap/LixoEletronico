import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FormUsuarioLogin.css';
import { supabase } from "/supabaseClient.js"; // 1. Importando o cliente Supabase

const FormUsuarioLogin = () => { // Renomeei para ser mais descritivo
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(''); // 2. Estado para mensagens de erro
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); // Limpa erros anteriores

    try {
      // 3. Tenta fazer o login com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      // 4. Verifica se houve erro na autenticação
      if (error) {
        // Se o erro for de "Invalid login credentials", significa que o email ou senha estão errados
        setErro('E-mail ou senha inválidos. Verifique seus dados.');
        return; // Para a execução
      }

      // 5. Se o login for bem-sucedido, redireciona para a dashboard
      console.log('Login bem-sucedido:', data.user);
      navigate('/tela-usuario');

    } catch (err) {
      setErro('Ocorreu um erro inesperado. Tente novamente.');
      console.error('Erro no login:', err);
    }
  };

  return (
    <div className="cadastro-wrapper">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>

        {/* 6. Exibe a mensagem de erro, se houver */}
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
        <input
          type="password"
          id="senha"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" className="btn-entrar">Entrar</button>

        <div className="cadastro-links">
          <a href="#">Esqueceu sua senha?</a>
          <Link to="/criar-conta" className="btn-criar-conta">Criar nova conta</Link>
        </div>
      </form>
    </div>
  );
};

export default FormUsuarioLogin;
