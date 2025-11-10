import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRoteiroColeta.css';

// Nomes dos possíveis status da OS
const STATUS_COLETA_CONCLUIDA = 'Coleta Concluida';
const STATUS_CLIENTE_AUSENTE = 'Cliente Ausente';
const STATUS_INICIAL = 'Destino transporte Coleta';

const IconeMenuRoteiroColeta = () => {
  // Estados da tela
  const [buscaOS, setBuscaOS] = useState('');
  const [ordemServico, setOrdemServico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [mostrarEndereco, setMostrarEndereco] = useState(false);
  const [observacaoMotorista, setObservacaoMotorista] = useState('');
  
  const [mostrarObservacao, setMostrarObservacao] = useState(false);

  const [statusIds, setStatusIds] = useState({
    inicial: null,
    concluida: null,
    ausente: null,
  });

  // Carrega os IDs dos status (sem alterações)
  useEffect(() => {
    async function fetchStatusIds() {
      const { data, error } = await supabase
        .from('status_da_os')
        .select('id_ref_status_os, status_os')
        .in('status_os', [STATUS_INICIAL, STATUS_COLETA_CONCLUIDA, STATUS_CLIENTE_AUSENTE]);
      if (error) {
        setError('Erro ao carregar status necessários.');
        return;
      }
      const ids = data.reduce((acc, item) => {
        if (item.status_os === STATUS_INICIAL) acc.inicial = item.id_ref_status_os;
        if (item.status_os === STATUS_COLETA_CONCLUIDA) acc.concluida = item.id_ref_status_os;
        if (item.status_os === STATUS_CLIENTE_AUSENTE) acc.ausente = item.id_ref_status_os;
        return acc;
      }, {});
      setStatusIds(ids);
    }
    fetchStatusIds();
  }, []);

  // Busca uma OS (limpa os novos estados)
  const buscarOrdemServico = useCallback(async (e) => {
    e.preventDefault();
    setOrdemServico(null);
    setError(null);
    setSuccess(null);
    setNovoStatus('');
    setObservacaoMotorista('');
    setMostrarObservacao(false); // Reseta a visibilidade da observação
    setMostrarEndereco(false);   // Reseta a visibilidade do endereço
    
    const numOS = parseInt(buscaOS, 10);
    if (isNaN(numOS) || !statusIds.inicial) {
      setError('Número da OS inválido ou status não carregado.');
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico,
        numero_os,
        observacao_agente_ambiental,
        usuarios!id_usuario (
          id_usuario,
          nome_completo,
          cpf,
          celular,
          endereco,
          numero_casa,
          bairro,
          cidade,
          estado
        )
      `)
      .eq('numero_os', numOS)
      .eq('status_os', statusIds.inicial)
      .single();
    setLoading(false);
    if (fetchError && fetchError.code !== 'PGRST116') {
      setError('Erro ao buscar Ordem de Serviço. Tente novamente.');
      return;
    }
    if (!data) {
      setError("Ordem não encontrada ou já realizada!");
      return;
    }
    setOrdemServico(data);
  }, [buscaOS, statusIds.inicial]);

  // Atualiza o status e a nova observação da OS
  const aplicarFluxo = useCallback(async () => {
    
    if (!ordemServico || !novoStatus) {
      setError('Selecione um novo status antes de aplicar o fluxo.');
      return;
    }

    // Validação para garantir que a observação foi preenchida
    if (!observacaoMotorista.trim()) {
      setError('O campo de observação é obrigatório para aplicar o fluxo.');
      setMostrarObservacao(true); // Garante que o campo esteja visível para preenchimento
      return;
    }
    
    const novoStatusId = novoStatus === STATUS_COLETA_CONCLUIDA ? statusIds.concluida : statusIds.ausente;
    if (!novoStatusId) {
      setError('ID do novo status não encontrado. Recarregue a página.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from('ordens_servico')
      .update({ 
        status_os: novoStatusId,
        observacao_motorista: observacaoMotorista
      })
      .eq('id_ref_ordem_servico', ordemServico.id_ref_ordem_servico);

    setLoading(false);
    if (updateError) {
      setError('Erro ao atualizar o status da OS. Tente novamente.');
      return;
    }
    
    setSuccess(`Status da OS Nº ${ordemServico.numero_os.toString().padStart(4, '0')} atualizado para "${novoStatus}" com sucesso!`);
    setOrdemServico(null);
    setBuscaOS('');
    setNovoStatus('');
    setObservacaoMotorista('');
    setMostrarObservacao(false);
  }, [ordemServico, novoStatus, observacaoMotorista, statusIds.concluida, statusIds.ausente]);

  // Monta o card dos detalhes da OS encontrada
  const renderUserDetails = () => {
    if (!ordemServico || !ordemServico.usuarios) return null;
    const u = ordemServico.usuarios;
    const osNum = ordemServico.numero_os.toString().padStart(4, '0');
    
    return (
      <div className="roteiro-os-card">
        <h3 className="roteiro-os-card-titulo">
          Detalhes da Ordem de Serviço Nº {osNum}
        </h3>

        {/* Dados principais do usuário */}
        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">Usuário:</span> {u.nome_completo}
        </div>
        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">CPF:</span> {u.cpf}
        </div>
        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">Celular:</span> {u.celular || 'Não informado'}
        </div>

        {/* Botão para exibir/ocultar endereço */}
        <div className="roteiro-toggle-container">
          <input
            type="checkbox"
            id="toggleEndereco"
            checked={mostrarEndereco}
            onChange={() => setMostrarEndereco(prev => !prev)}
          />
          <label htmlFor="toggleEndereco">Deseja visualizar o endereço?</label>
        </div>
        
        {/* Dados do endereço, exibidos apenas se o checkbox estiver marcado */}
        {mostrarEndereco && (
          <div className="roteiro-detalhes-container">
            <div className="roteiro-address-details">
              Rua: {u.endereco || 'Não informado'}, {u.numero_casa || 'S/N'}
            </div>
            <div className="roteiro-address-details">
              Bairro: {u.bairro || 'Não informado'}
            </div>
            <div className="roteiro-address-details">
              Cidade/Estado: {u.cidade || 'Não informado'}/{u.estado || 'N/A'}
            </div>
          </div>
        )}

        {/* Campo de observação, renderizado condicionalmente */}
        {mostrarObservacao && (
          <div className="roteiro-detalhes-container">
            <label htmlFor="obsMotorista" className="roteiro-observacao-label">
              Relato / Observação do Atendimento (Obrigatório)
            </label>
            <textarea
              id="obsMotorista"
              className="roteiro-observacao-textarea"
              placeholder="Descreva o atendimento (Ex: Coleta realizada com sucesso. Cliente ausente. Etc.)"
              value={observacaoMotorista}
              onChange={(e) => setObservacaoMotorista(e.target.value)}
              rows="4"
            />
          </div>
        )}

        {/* Formulário para aplicar novo status */}
        <div className="roteiro-status-form">
          <label className="roteiro-status-label">Aplicar Fluxo (Novo Status):</label>
          <div className="roteiro-status-options">
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_COLETA_CONCLUIDA}
                checked={novoStatus === STATUS_COLETA_CONCLUIDA}
                onChange={(e) => {
                  setNovoStatus(e.target.value);
                  setMostrarObservacao(true); // Abre o campo de observação
                }}
              />
              {STATUS_COLETA_CONCLUIDA}
            </label>
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_CLIENTE_AUSENTE}
                checked={novoStatus === STATUS_CLIENTE_AUSENTE}
                onChange={(e) => {
                  setNovoStatus(e.target.value);
                  setMostrarObservacao(true); // Abre o campo de observação
                }}
              />
              {STATUS_CLIENTE_AUSENTE}
            </label>
          </div>
          <button
            className={`roteiro-update-btn${novoStatus ? ' ativo' : ''}`}
            onClick={aplicarFluxo}
            disabled={loading || !novoStatus}
          >
            {loading ? 'Aplicando...' : 'Aplicar Fluxo'}
          </button>
        </div>
      </div>
    );
  };

  // Renderização principal da página
  return (
    <div className="roteiro-container">
      <h2 className="roteiro-titulo">Roteiro de Coleta - Busca e Atualização</h2>
      <form className="roteiro-busca-form" onSubmit={buscarOrdemServico}>
        <input
          type="text"
          className="roteiro-busca-input"
          placeholder="Buscar por Nº da OS (ex: 0001)"
          value={buscaOS}
          onChange={e => setBuscaOS(e.target.value)}
          disabled={loading}
        />
        <button className="roteiro-busca-btn" type="submit" disabled={loading}>
          Buscar OS
        </button>
      </form>
      {loading && <p className="roteiro-loading">Buscando ou atualizando...</p>}
      {error && <p className="roteiro-error">{error}</p>}
      {success && <p className="roteiro-success">{success}</p>}
      {ordemServico && renderUserDetails()}
    </div>
  );
};

export default IconeMenuRoteiroColeta;