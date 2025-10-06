// CriarContaUsuario.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '/supabaseClient.js';
import './CriarContaUsuario.css';

const CriarContaUsuario = () => {
  const navigate = useNavigate();

  // Estados
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState(''); 
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // 🔹 Validação: senha e confirmação iguais
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
      });

      if (authError) {
        setErro(`Erro ao criar autenticação: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        setErro("Usuário não foi criado. Verifique se o e-mail já existe.");
        return;
      }

      // Inserir dados adicionais na tabela
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([
          {
            user_id: authData.user.id,
            nome_completo: nomeCompleto,
            cpf: cpf,
            endereco: endereco,
            numero_casa: numeroCasa,
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            cep: cep,
            celular: celular,
            email: email,
          },
        ]);

      if (insertError) {
        setErro(`Erro ao salvar dados do perfil: ${insertError.message}`);
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }

      navigate('/tela-usuario');
    } catch (err) {
      setErro('Ocorreu um erro inesperado. Tente novamente.');
      console.error('Erro no cadastro:', err);
    }
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <h2>Criar Nova Conta</h2>
        {erro && <p className="erro">{erro}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
          <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
          <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          <input type="text" placeholder="Número da Casa" value={numeroCasa} onChange={(e) => setNumeroCasa(e.target.value)} required />
          <input type="text" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
          <input type="text" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
          <input type="text" placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
          <input type="text" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} required />
          <input type="text" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} required />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />

          {/* 🔹 Campo de senha */}
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />

          {/* 🔹 Campo de confirmar senha */}
          <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />

          <button type="submit">Criar Conta e Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default CriarContaUsuario;
