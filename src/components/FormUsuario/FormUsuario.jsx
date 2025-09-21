import { useState } from 'react';
import './FormUsuario.css';

function FormUsuario() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    alert('Formulário enviado com sucesso!');
  };

  return (
    <form className="form-usuario" onSubmit={handleSubmit}>
      <h2>Cadastro de Usuário</h2>

      <label>
        Nome:
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
      </label>

      <label>
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </label>

      <label>
        Telefone:
        <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} required />
      </label>

      <label>
        Senha:
        <input type="password" name="senha" value={formData.senha} onChange={handleChange} required />
      </label>

      <button type="submit">Cadastrar</button>
    </form>
  );
}

export default FormUsuario;
