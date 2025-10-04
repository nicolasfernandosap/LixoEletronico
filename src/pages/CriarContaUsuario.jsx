import React, { useState } from 'react';
import './CriarContaUsuario.css';
import {
  FaUser, FaIdCard, FaHome, FaHashtag, FaMapMarkerAlt, FaFlag,
  FaMapPin, FaPhone, FaEnvelope, FaVenusMars, FaLock
} from 'react-icons/fa';
import { supabase } from '../../supabaseClient';

const CriarContaUsuario = () => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    endereco: '',
    numero_casa: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    celular: '',
    email: '',
    genero: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErro('Por favor, insira um e-mail válido.');
      return;
    }

    if (!validatePassword(formData.senha)) {
      setErro('A senha deve ter no mínimo 6 caracteres. Verifique a política de senha do Supabase.');
      return;
    }

    // Nova validação para nome_completo
    if (!formData.nome_completo || formData.nome_completo.trim() === '') {
      setErro('O campo Nome completo é obrigatório.');
      return;
    }

    try {
      // 1) Criar usuário no Auth do Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (error) {
        if (error.status === 422) {
          setErro('Erro ao criar usuário: Verifique se o e-mail já está registrado ou se a senha atende aos requisitos.');
        } else {
          setErro(error.message);
        }
        return;
      }

      // 2) Salvar dados adicionais em tabela "usuarios"
      const { error: insertError } = await supabase.from('usuarios').insert([
        {
          user_id: data.user.id,
          email: formData.email,
          nome_completo: formData.nome_completo,
          cpf: formData.cpf,
          endereco: formData.endereco,
          numero_casa: formData.numero_casa,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          celular: formData.celular,
          genero: formData.genero
        }
      ]);

      if (insertError) {
        setErro(insertError.message);
        return;
      }

      setSucesso('Conta criada com sucesso!');
      setFormData({
        nome_completo: '',
        cpf: '',
        endereco: '',
        numero_casa: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        celular: '',
        email: '',
        genero: '',
        senha: '',
        confirmarSenha: ''
      });

    } catch (err) {
      setErro('Erro inesperado: ' + err.message);
    }
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
      {sucesso && <p className="sucesso">{sucesso}</p>}
      <form onSubmit={handleSubmit}>
        {renderInput(FaUser, 'text', 'nome_completo', 'Nome completo')}
        {renderInput(FaIdCard, 'text', 'cpf', 'CPF')}
        {renderInput(FaHome, 'text', 'endereco', 'Endereço')}
        {renderInput(FaHashtag, 'text', 'numero_casa', 'Número da Casa')}
        {renderInput(FaMapMarkerAlt, 'text', 'bairro', 'Bairro')}
        {renderInput(FaMapMarkerAlt, 'text', 'cidade', 'Cidade')}
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
