import React, { useState } from 'react';
import './CriarContaUsuario.css';


const CriarContaUsuario = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    celular: '',
    email: '',
    genero: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    // Aqui você pode fazer envio para backend
    console.log('Cadastro realizado com sucesso:', formData);
    setErro('');
    alert('Conta criada com sucesso!');
  };

  return (
    <div className="form-container">
      <h2>Criar Nova Conta</h2>
      {erro && <p className="erro">{erro}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="nome" placeholder="Nome completo" value={formData.nome} onChange={handleChange} required />
        <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} required />
        <input type="tel" name="celular" placeholder="Celular" value={formData.celular} onChange={handleChange} required />
        <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
        
        <select name="genero" value={formData.genero} onChange={handleChange} required>
          <option value="">Selecione o Gênero</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>

        <input type="password" name="senha" placeholder="Senha" value={formData.senha} onChange={handleChange} required />
        <input type="password" name="confirmarSenha" placeholder="Confirme a senha" value={formData.confirmarSenha} onChange={handleChange} required />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CriarContaUsuario;
