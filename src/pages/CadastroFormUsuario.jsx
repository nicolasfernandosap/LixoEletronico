import React, { useState } from 'react';
import './CadastroFormUsuario.css';

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

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="senha">Senha:</label>
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
          <button type="button" className="btn-criar-conta">Criar nova conta</button>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
