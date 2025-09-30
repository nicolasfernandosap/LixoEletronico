import React, { useState } from 'react';
import './CriarContaUsuario.css';
import { FaUser, FaIdCard, FaHome, FaHashtag, FaMapMarkerAlt, FaFlag, FaMapPin, FaPhone, FaEnvelope, FaVenusMars, FaLock } from 'react-icons/fa';

const CriarContaUsuario = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    numeroCasa: '',
    bairro: '',
    estado: '',
    cep: '',
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

    console.log('Cadastro realizado com sucesso:', formData);
    setErro('');
    alert('Conta criada com sucesso!');
  };

  const renderInput = (Icon, type, name, placeholder) => (
    <div className="input-group">
      <Icon className="input-icon" />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="form-container">
      <h2>Criar Nova Conta</h2>
      {erro && <p className="erro">{erro}</p>}
      <form onSubmit={handleSubmit}>
        {renderInput(FaUser, 'text', 'nome', 'Nome completo')}
        {renderInput(FaIdCard, 'text', 'cpf', 'CPF')}
        {renderInput(FaHome, 'text', 'endereco', 'Endereço')}
        {renderInput(FaHashtag, 'text', 'numeroCasa', 'Número da Casa')}
        {renderInput(FaMapMarkerAlt, 'text', 'bairro', 'Bairro')}
        {renderInput(FaFlag, 'text', 'estado', 'Estado')}
        {renderInput(FaMapPin, 'text', 'cep', 'CEP')}
        {renderInput(FaPhone, 'tel', 'celular', 'Celular')}
        {renderInput(FaEnvelope, 'email', 'email', 'E-mail')}

        <div className="input-group">
          <FaVenusMars className="input-icon" />
          <select name="genero" value={formData.genero} onChange={handleChange} required>
            <option value="">Selecione o Gênero</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {renderInput(FaLock, 'password', 'senha', 'Senha')}
        {renderInput(FaLock, 'password', 'confirmarSenha', 'Confirme a senha')}

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default CriarContaUsuario;
