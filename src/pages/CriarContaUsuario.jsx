import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '/supabaseClient.js';
import './CriarContaUsuario.css';

const CriarContaUsuario = () => {
  const navigate = useNavigate();

  // --- Estados para os dados do formulário ---
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

  // --- Estado centralizado para gerenciar todas as mensagens de erro ---
  const [erros, setErros] = useState({});

  // --- Função auxiliar para limpar erros de um campo específico ---
  const clearError = (fieldName) => {
    if (erros[fieldName]) {
      setErros(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // --- Funções de validação em tempo real ---

  const handleCpfChange = (e) => {
    const value = e.target.value;
    clearError('cpf');
    if (value.length <= 11) { setCpf(value); } 
    else { setErros(prev => ({ ...prev, cpf: 'O CPF deve ter no máximo 11 caracteres.' })); }
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    clearError('cep');
    if (value.length <= 8) { setCep(value); } 
    else { setErros(prev => ({ ...prev, cep: 'O CEP deve ter no máximo 8 caracteres.' })); }
  };

  const handleEstadoChange = (e) => {
    const valorMaiusculo = e.target.value.toUpperCase();
    clearError('estado');
    if (valorMaiusculo.length <= 2) { setEstado(valorMaiusculo); } 
    else { setErros(prev => ({ ...prev, estado: 'O Estado deve ter no máximo 2 caracteres (ex: SP).' })); }
  };

  const handleNumeroCasaChange = (e) => {
    const value = e.target.value;
    clearError('numeroCasa');
    if (value.length <= 5) { setNumeroCasa(value); } 
    else { setErros(prev => ({ ...prev, numeroCasa: 'O Número deve ter no máximo 5 caracteres.' })); }
  };

  const handleCelularChange = (e) => {
    const value = e.target.value;
    clearError('celular');
    if (value.length <= 13) { setCelular(value); } 
    else { setErros(prev => ({ ...prev, celular: 'O Celular deve ter no máximo 13 caracteres.' })); }
  };

  const handleSenhaChange = (e) => {
    const value = e.target.value;
    clearError('senha');
    if (value.length <= 6) { setSenha(value); } 
    else { setErros(prev => ({ ...prev, senha: 'A Senha deve ter no máximo 6 caracteres.' })); }
  };

  const handleConfirmarSenhaChange = (e) => {
    const value = e.target.value;
    clearError('confirmarSenha');

    // 1. Aplica o limite de 6 caracteres
    if (value.length > 6) {
      setErros(prev => ({ ...prev, confirmarSenha: 'A confirmação deve ter no máximo 6 caracteres.' }));
      return;
    }
    
    setConfirmarSenha(value);

    // 2. Validação inteligente: só verifica a coincidência quando o campo atinge o tamanho da senha principal
    if (senha && value.length === senha.length && senha !== value) {
      setErros(prev => ({ ...prev, confirmarSenha: 'As senhas não coincidem.' }));
    }
  };
  

  // --- Função principal para submeter o formulário ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros({});

    if (senha.length !== 6) {
      setErros({ geral: "A senha deve ter exatamente 6 caracteres." });
      return;
    }
    if (senha !== confirmarSenha) {
      setErros({ geral: "As senhas não coincidem. Verifique e tente novamente." });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: senha });

      if (authError) {
        setErros({ geral: `Erro ao criar autenticação: ${authError.message}` });
        return;
      }
      if (!authData.user) {
        setErros({ geral: "Usuário não foi criado. Verifique se o e-mail já existe." });
        return;
      }

      const { error: insertError } = await supabase.from('usuarios').insert([{
        id_usuario: authData.user.id,
        nome_completo: nomeCompleto,
        cpf, endereco, numero_casa: numeroCasa, bairro, cidade, estado, celular, email,
      }]);

      if (insertError) {
        setErros({ geral: `Erro ao salvar dados do perfil: ${insertError.message}` });
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }

      navigate('/tela-usuario');
    } catch (err) {
      setErros({ geral: 'Ocorreu um erro inesperado. Tente novamente.' });
      console.error('Erro no cadastro:', err);
    }
  };

  // --- Estrutura JSX do formulário ---
  return (
    <div className="form-container">
      <div className="form-content">
        <h2>Criar Nova Conta</h2>
        {erros.geral && <p className="erro">{erros.geral}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
          
          <input type="text" placeholder="CPF" value={cpf} onChange={handleCpfChange} required />
          {erros.cpf && <p className="erro-campo">{erros.cpf}</p>}

          <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
          
          <input type="text" placeholder="Número da Casa" value={numeroCasa} onChange={handleNumeroCasaChange} required />
          {erros.numeroCasa && <p className="erro-campo">{erros.numeroCasa}</p>}

          <input type="text" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
          <input type="text" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />

          <input type="text" placeholder="Estado (ex: SP)" value={estado} onChange={handleEstadoChange} required />
          {erros.estado && <p className="erro-campo">{erros.estado}</p>}

          <input type="text" placeholder="CEP" value={cep} onChange={handleCepChange} required />
          {erros.cep && <p className="erro-campo">{erros.cep}</p>}

          <input type="text" placeholder="Celular" value={celular} onChange={handleCelularChange} required />
          {erros.celular && <p className="erro-campo">{erros.celular}</p>}

          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <input type="password" placeholder="Senha" value={senha} onChange={handleSenhaChange} required />
          {erros.senha && <p className="erro-campo">{erros.senha}</p>}

          <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={handleConfirmarSenhaChange} required />
          {erros.confirmarSenha && <p className="erro-campo">{erros.confirmarSenha}</p>}

          <button type="submit">Criar Conta e Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default CriarContaUsuario;
