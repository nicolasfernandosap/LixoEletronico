import React, { useState, useEffect } from 'react';
// Importa o CSS dedicado para estilizar este componente de formulário.
import './IconeMenuAdicaoColaboradores.css'; 
// Importa o cliente Supabase para interagir com o banco de dados.
import { supabase } from '../../../../supabaseClient'; 

export const IconeMenuAdicaoColaboradores = () => {
  // Estados para gerenciar os dados do formulário
  const [tipoColaborador, setTipoColaborador] = useState('agente ambiental');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [manterSenhaPadrao, setManterSenhaPadrao] = useState(true);
  
  // Estados para gerenciar a interface (feedback para o usuário)
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

  // Efeito que atualiza a senha padrão sempre que o tipo de colaborador ou o checkbox mudam.
  useEffect(() => {
    if (manterSenhaPadrao) {
      setSenha(tipoColaborador === 'agente ambiental' ? '123Ambiental' : '123Motorista');
    } else {
      setSenha('');
    }
  }, [tipoColaborador, manterSenhaPadrao]);

  // Função executada ao enviar o formulário
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previne o recarregamento da página
    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });

    // Validação simples
    if (!nome || !cpf || !email || !senha) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, preencha todos os campos.' });
      setCarregando(false);
      return;
    }

    try {
      // Passo 1: Cria o usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: senha });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário na autenticação.");

      // Passo 2: Insere os dados públicos na tabela 'colaboradores'
      const { error: insertError } = await supabase.from('colaboradores').insert({
        nome_colaborador: nome,
        cpf_colaborador: cpf,
        email_colaborador: email,
        cargo_colaborador: tipoColaborador, 
      });
      if (insertError) throw insertError;

      // Passo 3: Feedback de sucesso e limpeza do formulário
      setMensagem({ tipo: 'sucesso', texto: `Colaborador (${tipoColaborador}) cadastrado com sucesso!` });
      setNome(''); setCpf(''); setEmail(''); setManterSenhaPadrao(true);
    } catch (error) {
      // Captura e exibe qualquer erro que tenha ocorrido nos passos acima
      setMensagem({ tipo: 'erro', texto: `Erro no cadastro: ${error.message}` });
    } finally {
      // Garante que o estado de 'carregando' seja desativado, independentemente do resultado
      setCarregando(false);
    }
  };

  // Renderiza o JSX do formulário
  return (
    <div className="adicao-colaboradores-container">
      <h2 className="adicao-colaboradores-title">Adicionar Novo Colaborador</h2>
      <p className="adicao-colaboradores-subtitle">
        Selecione o tipo de colaborador e preencha os dados para realizar o cadastro.
      </p>
      <div className="tipo-colaborador-selector">
        <button
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
        <div className="form-group"><label htmlFor="nome">Nome Completo</label><input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="cpf">CPF</label><input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group"><label htmlFor="senha">Senha</label><input type="text" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} disabled={manterSenhaPadrao} required /></div>
        <div className="form-group-checkbox"><input type="checkbox" id="manterSenha" checked={manterSenhaPadrao} onChange={(e) => setManterSenhaPadrao(e.target.checked)} /><label htmlFor="manterSenha">Manter senha padrão?</label></div>
        <button type="submit" className="btn-submit-colaborador" disabled={carregando}>
          {carregando ? 'Cadastrando...' : `Cadastrar ${tipoColaborador === 'agente ambiental' ? 'Agente' : 'Motorista'}`}
        </button>
      </form>
      {mensagem.texto && (<div className={`mensagem-retorno ${mensagem.tipo}`}>{mensagem.texto}</div>)}
    </div>
  );
};
