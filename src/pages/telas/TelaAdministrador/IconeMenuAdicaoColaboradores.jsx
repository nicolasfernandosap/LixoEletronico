import React, { useState, useEffect } from 'react';
// Certifique-se de que o caminho para seu CSS unificado está correto
import './MenuTelaAdministrador.css'; 
// Certifique-se de que o caminho para seu cliente Supabase está correto
import { supabase } from '../../../../supabaseClient'; 

export const IconeMenuAdicaoColaboradores = () => {
  
  const [tipoColaborador, setTipoColaborador] = useState('agente ambiental');
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [manterSenhaPadrao, setManterSenhaPadrao] = useState(true);
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (manterSenhaPadrao) {
      // --- CORREÇÃO 2: A lógica da senha padrão também usa o novo texto ---
      setSenha(tipoColaborador === 'agente ambiental' ? '123Ambiental' : '123Motorista');
    } else {
      setSenha('');
    }
  }, [tipoColaborador, manterSenhaPadrao]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    if (!nome || !cpf || !email || !senha) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, preencha todos os campos.' });
      setCarregando(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário na autenticação.");

      const { error: insertError } = await supabase
        .from('colaboradores')
        .insert({
          nome_colaborador: nome,
          cpf_colaborador: cpf,
          email_colaborador: email,
          // O valor de 'tipoColaborador' ('agente ambiental' ou 'motorista') será salvo aqui
          cargo_colaborador: tipoColaborador, 
        });

      if (insertError) throw insertError;

      setMensagem({ tipo: 'sucesso', texto: `Colaborador (${tipoColaborador}) cadastrado com sucesso!` });
      setNome('');
      setCpf('');
      setEmail('');
      setManterSenhaPadrao(true);

    } catch (error) {
      setMensagem({ tipo: 'erro', texto: `Erro no cadastro: ${error.message}` });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="adicao-colaboradores-container">
      <h2 className="adicao-colaboradores-title">Adicionar Novo Colaborador</h2>
      <p className="adicao-colaboradores-subtitle">
        Selecione o tipo de colaborador e preencha os dados para realizar o cadastro.
      </p>
      <div className="tipo-colaborador-selector">
        <button
          // --- CORREÇÃO 3: A verificação e o onClick usam o novo texto ---
          className={`btn-tipo ${tipoColaborador === 'agente ambiental' ? 'active' : ''}`}
          onClick={() => setTipoColaborador('agente ambiental')}
        >
          Agente Ambiental
        </button>
        <button
          className={`btn-tipo ${tipoColaborador === 'motorista' ? 'active' : ''}`}
          onClick={() => setTipoColaborador('motorista')}
        >
          Motorista
        </button>
      </div>
      <form className="colaborador-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF</label>
          <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input type="text" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} disabled={manterSenhaPadrao} required />
        </div>
        <div className="form-group-checkbox">
          <input type="checkbox" id="manterSenha" checked={manterSenhaPadrao} onChange={(e) => setManterSenhaPadrao(e.target.checked)} />
          <label htmlFor="manterSenha">Manter senha padrão?</label>
        </div>
        <button type="submit" className="btn-submit-colaborador" disabled={carregando}>
          {/* Lógica para o texto do botão continua funcionando */}
          {carregando ? 'Cadastrando...' : `Cadastrar ${tipoColaborador === 'agente ambiental' ? 'Agente' : 'Motorista'}`}
        </button>
      </form>
      {mensagem.texto && (
        <div className={`mensagem-retorno ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}
    </div>
  );
};
