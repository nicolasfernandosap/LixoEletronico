import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRoteiroColeta.css';

// Status que o motorista pode aplicar
const STATUS_COLETA_CONCLUIDA = 'Coleta Concluida';
const STATUS_CLIENTE_AUSENTE = 'Cliente Ausente';
const STATUS_INICIAL = 'Destino transporte Coleta';

const IconeMenuRoteiroColeta = () => {
  const [buscaOS, setBuscaOS] = useState('');
  const [ordemServico, setOrdemServico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [mostrarEndereco, setMostrarEndereco] = useState(false);

  // Estados para armazenar os IDs dos status
  const [statusIds, setStatusIds] = useState({
    inicial: null,
    concluida: null,
    ausente: null,
  });

  // 1. Busca dos IDs de Status (Otimização: Busca única no carregamento)
  useEffect(() => {
    async function fetchStatusIds() {
      const { data, error } = await supabase
        .from('status_da_os')
        .select('id_ref_status_os, status_os')
        .in('status_os', [STATUS_INICIAL, STATUS_COLETA_CONCLUIDA, STATUS_CLIENTE_AUSENTE]);

      if (error) {
        console.error('Erro ao buscar IDs de status:', error);
        setError('Erro ao carregar status necessários.');
        return;
      }

      console.log('Dados de Status retornados:', data);

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

  // 2. Função de Busca Otimizada (usa useCallback)
  const buscarOrdemServico = useCallback(async (e) => {
    e.preventDefault();
    setOrdemServico(null);
    setError(null);
    setSuccess(null);
    setNovoStatus('');

    const numOS = parseInt(buscaOS, 10);
    if (isNaN(numOS) || !statusIds.inicial) {
      setError('Número da OS inválido ou status não carregado.');
      return;
    }

    setLoading(true);
    // Query otimizada: busca a OS e faz JOIN com o usuário em uma única chamada
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
      .eq('status_os', statusIds.inicial) // Filtra apenas OS com status inicial
      .single();

    setLoading(false);

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Erro ao buscar OS:', fetchError);
      setError('Erro ao buscar Ordem de Serviço. Tente novamente.');
      return;
    }

    if (!data) {
      setError(`Ordem de Serviço Nº ${numOS.toString().padStart(4, '0')} não encontrada ou não está no status "${STATUS_INICIAL}".`);
      return;
    }

    setOrdemServico(data);
  }, [buscaOS, statusIds.inicial]);

  // 3. Função de Atualização de Status (Ação do Motorista)
  const aplicarFluxo = useCallback(async () => {
    if (!ordemServico || !novoStatus) {
      setError('Selecione um novo status antes de aplicar o fluxo.');
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
      .update({ status_os: novoStatusId })
      .eq('id_ref_ordem_servico', ordemServico.id_ref_ordem_servico);

    setLoading(false);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      setError('Erro ao atualizar o status da OS. Tente novamente.');
      return;
    }

    setSuccess(`Status da OS Nº ${ordemServico.numero_os.toString().padStart(4, '0')} atualizado para "${novoStatus}" com sucesso!`);
    setOrdemServico(null); // Limpa a tela após o sucesso
    setBuscaOS('');
    setNovoStatus('');
  }, [ordemServico, novoStatus, statusIds.concluida, statusIds.ausente]);

  // Renderização dos detalhes do usuário
  const renderUserDetails = () => {
    if (!ordemServico || !ordemServico.usuarios) return null;

    const u = ordemServico.usuarios;
    const osNum = ordemServico.numero_os.toString().padStart(4, '0');

    return (
      <div className="os-details-card">
        <h3>Detalhes da Ordem de Serviço Nº {osNum}</h3>
        <div className="detail-item"><strong>Usuário:</strong> {u.nome_completo}</div>
        <div className="detail-item"><strong>CPF:</strong> {u.cpf}</div>
        <div className="detail-item"><strong>Celular:</strong> {u.celular || 'Não informado'}</div>

        <div className="address-toggle">
          <input
            type="checkbox"
            id="toggleEndereco"
            checked={mostrarEndereco}
            onChange={() => setMostrarEndereco(prev => !prev)}
          />
          <label htmlFor="toggleEndereco">Deseja visualizar o endereço?</label>
        </div>

        {mostrarEndereco && (
          <>
            <div className="detail-item"><strong>Rua:</strong> {u.endereco || 'Não informado'}, {u.numero_casa || 'S/N'}</div>
            <div className="detail-item"><strong>Bairro:</strong> {u.bairro || 'Não informado'}</div>
            <div className="detail-item"><strong>Cidade/Estado:</strong> {u.cidade || 'Não informado'}/{u.estado || 'N/A'}</div>
          </>
        )}

        <div className="status-update-form">
          <label>Aplicar Fluxo (Novo Status):</label>
          <div className="status-options">
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_COLETA_CONCLUIDA}
                checked={novoStatus === STATUS_COLETA_CONCLUIDA}
                onChange={(e) => setNovoStatus(e.target.value)}
              />
              {STATUS_COLETA_CONCLUIDA}
            </label>
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_CLIENTE_AUSENTE}
                checked={novoStatus === STATUS_CLIENTE_AUSENTE}
                onChange={(e) => setNovoStatus(e.target.value)}
              />
              {STATUS_CLIENTE_AUSENTE}
            </label>
          </div>

          <button
            className="update-btn"
            onClick={aplicarFluxo}
            disabled={loading || !novoStatus}
          >
            {loading ? 'Aplicando...' : 'Aplicar Fluxo'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="roteiro-container">
      <h2>Roteiro de Coleta - Busca e Atualização</h2>

      <form className="search-form" onSubmit={buscarOrdemServico}>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por Nº da OS (ex: 0001)"
          value={buscaOS}
          onChange={e => setBuscaOS(e.target.value)}
          disabled={loading}
        />
        <button className="search-btn" type="submit" disabled={loading}>
          Buscar OS
        </button>
      </form>

      {loading && <p className="loading">Buscando ou atualizando...</p>}
      {error && <p className="error-message">Erro: {error}</p>}
      {success && <p className="success-message">{success}</p>}

      {ordemServico && renderUserDetails()}
    </div>
  );
};

export default IconeMenuRoteiroColeta;