import React, { useState } from 'react';
import './FormUsuarioLogin.css';
import { Link } from 'react-router-dom'; 

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login com:', { email, senha });
    // Aqui você pode adicionar lógica de autenticação
  };

  return (
    <div className="cadastro-wrapper">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>

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

export default Cadastro;
