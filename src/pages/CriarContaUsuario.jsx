import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '/supabaseClient.js';
import './CriarContaUsuario.css';

const CriarContaUsuario = () => {
  const navigate = useNavigate();

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
  const [erros, setErros] = useState({});

  const clearError = (fieldName) => {
    if (erros[fieldName]) {
      setErros((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleCpfChange = (e) => {
    const value = e.target.value;
    clearError('cpf');
    if (value.length <= 11) setCpf(value);
    else setErros((prev) => ({ ...prev, cpf: 'O CPF deve ter no máximo 11 caracteres.' }));
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    clearError('cep');
    if (value.length <= 8) setCep(value);
    else setErros((prev) => ({ ...prev, cep: 'O CEP deve ter no máximo 8 caracteres.' }));
  };

  const handleEstadoChange = (e) => {
    const value = e.target.value.toUpperCase();
    clearError('estado');
    if (value.length <= 2) setEstado(value);
    else setErros((prev) => ({ ...prev, estado: 'O Estado deve ter no máximo 2 caracteres (ex: SP).' }));
  };

  const handleNumeroCasaChange = (e) => {
    const value = e.target.value;
    clearError('numeroCasa');
    if (value.length <= 5) setNumeroCasa(value);
    else setErros((prev) => ({ ...prev, numeroCasa: 'O Número deve ter no máximo 5 caracteres.' }));
  };

  const handleCelularChange = (e) => {
    const value = e.target.value;
    clearError('celular');
    if (value.length <= 13) setCelular(value);
    else setErros((prev) => ({ ...prev, celular: 'O Celular deve ter no máximo 13 caracteres.' }));
  };

  const handleSenhaChange = (e) => {
    const value = e.target.value;
    clearError('senha');
    if (value.length <= 6) setSenha(value);
    else setErros((prev) => ({ ...prev, senha: 'A Senha deve ter no máximo 6 caracteres.' }));
  };

  const handleConfirmarSenhaChange = (e) => {
    const value = e.target.value;
    clearError('confirmarSenha');
    if (value.length > 6) {
      setErros((prev) => ({ ...prev, confirmarSenha: 'A confirmação deve ter no máximo 6 caracteres.' }));
      return;
    }
    setConfirmarSenha(value);
    if (senha && value.length === senha.length && senha !== value) {
      setErros((prev) => ({ ...prev, confirmarSenha: 'As senhas não coincidem.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros({});

    if (senha.length !== 6) {
      setErros({ geral: 'A senha deve ter exatamente 6 caracteres.' });
      return;
    }
    if (senha !== confirmarSenha) {
      setErros({ geral: 'As senhas não coincidem. Verifique e tente novamente.' });
      return;
    }

    try {
      // 🔍 Verifica se o e-mail já existe na tabela 'usuarios'
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .ilike('email', email)
        .single();

      if (existingUser) {
        setErros({ geral: 'Este e-mail já está cadastrado. Por favor, use outro.' });
        return;
      }

      // 🟢 Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) {
        if (authError.message.includes('registered')) {
          setErros({ geral: 'Este e-mail já possui uma conta.' });
        } else {
          setErros({ geral: `Erro ao criar autenticação: ${authError.message}` });
        }
        return;
      }

      // 🟢 Insere dados na tabela 'usuarios'
      const { error: insertError } = await supabase.from('usuarios').insert([
        {
          id_usuario: authData.user.id,
          nome_completo: nomeCompleto,
          cpf,
          endereco,
          numero_casa: numeroCasa,
          bairro,
          cidade,
          estado,
          cep,
          celular,
          email,
        },
      ]);

      if (insertError) {
        setErros({ geral: `Erro ao salvar dados do perfil: ${insertError.message}` });
        return;
      }

      navigate('/tela-usuario');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setErros({ geral: 'Ocorreu um erro inesperado. Tente novamente.' });
    }
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <h2>Criar Nova Conta</h2>
        {erros.geral && <p className="erro">{erros.geral}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
          <input type="text" placeholder="CPF" value={cpf} onChange={handleCpfChange} required />
          <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          <input type="text" placeholder="Número da Casa" value={numeroCasa} onChange={handleNumeroCasaChange} required />
          <input type="text" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
          <input type="text" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
          <input type="text" placeholder="Estado (ex: SP)" value={estado} onChange={handleEstadoChange} required />
          <input type="text" placeholder="CEP" value={cep} onChange={handleCepChange} required />
          <input type="text" placeholder="Celular" value={celular} onChange={handleCelularChange} required />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={senha} onChange={handleSenhaChange} required />
          <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={handleConfirmarSenhaChange} required />

          <button type="submit">Criar Conta e Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default CriarContaUsuario;
