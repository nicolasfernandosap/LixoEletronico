import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRoteiroColeta.css';

// Nomes dos possíveis status da OS
const STATUS_COLETA_CONCLUIDA = 'Coleta Concluida';
const STATUS_CLIENTE_AUSENTE = 'Cliente Ausente';
const STATUS_INICIAL = 'Destino transporte Coleta';

const IconeMenuRoteiroColeta = () => {
  // Estados da tela
  const [buscaOS, setBuscaOS] = useState('');             // Armazena o número digitado da OS
  const [ordemServico, setOrdemServico] = useState(null); // Dados retornados da OS consultada
  const [loading, setLoading] = useState(false);          // Desabilita botões/inputs enquanto consulta ou atualiza
  const [error, setError] = useState(null);               // Mensagem de erro exibida no topo
  const [success, setSuccess] = useState(null);           // Mensagem de sucesso exibida no topo
  const [novoStatus, setNovoStatus] = useState('');       // Armazena escolha de status para atualizar
  const [mostrarEndereco, setMostrarEndereco] = useState(false); // Controla exibição dos campos endereço
  // IDs de cada status para acesso no banco
  const [statusIds, setStatusIds] = useState({
    inicial: null,
    concluida: null,
    ausente: null,
  });

  // Carrega os IDs dos status da tabela do banco uma única vez (ao abrir componente)
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
      // Armazena os IDs respectivos no estado
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

  // Busca uma OS pelo número digitado, trazendo dados do usuário e valida se está no status inicial
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
    // Consulta banco e faz JOIN com usuário
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
    // Erros técnicos
    if (fetchError && fetchError.code !== 'PGRST116') {
      setError('Erro ao buscar Ordem de Serviço. Tente novamente.');
      return;
    }
    // Caso não tenha resultado válido
    if (!data) {
      setError("Ordem não encontrada ou já realizada!");
      return;
    }
    setOrdemServico(data);
  }, [buscaOS, statusIds.inicial]);

  // Atualiza o status da OS para o valor escolhido pelo motorista
  const aplicarFluxo = useCallback(async () => {
    if (!ordemServico || !novoStatus) {
      setError('Selecione um novo status antes de aplicar o fluxo.');
      return;
    }
    // Vai buscar o ID do novo status
    const novoStatusId = novoStatus === STATUS_COLETA_CONCLUIDA ? statusIds.concluida : statusIds.ausente;
    if (!novoStatusId) {
      setError('ID do novo status não encontrado. Recarregue a página.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Atualiza registro no banco
    const { error: updateError } = await supabase
      .from('ordens_servico')
      .update({ status_os: novoStatusId })
      .eq('id_ref_ordem_servico', ordemServico.id_ref_ordem_servico);
    setLoading(false);
    // Erro ao tentar atualizar
    if (updateError) {
      setError('Erro ao atualizar o status da OS. Tente novamente.');
      return;
    }
    // Sucesso
    setSuccess(`Status da OS Nº ${ordemServico.numero_os.toString().padStart(4, '0')} atualizado para "${novoStatus}" com sucesso!`);
    setOrdemServico(null); // limpa tela
    setBuscaOS('');
    setNovoStatus('');
  }, [ordemServico, novoStatus, statusIds.concluida, statusIds.ausente]);

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
        <div className="roteiro-address-toggle">
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
          <>
            <div className="roteiro-address-details">
              Rua: {u.endereco || 'Não informado'}, {u.numero_casa || 'S/N'}
            </div>
            <div className="roteiro-address-details">
              Bairro: {u.bairro || 'Não informado'}
            </div>
            <div className="roteiro-address-details">
              Cidade/Estado: {u.cidade || 'Não informado'}/{u.estado || 'N/A'}
            </div>
          </>
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
            className={`roteiro-update-btn${success ? ' ativo' : ''}`}
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
      {/* Título da tela */}
      <h2 className="roteiro-titulo">Roteiro de Coleta - Busca e Atualização</h2>
      
      {/* Formulário para digitar e consultar / buscar OS */}
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
      
      {/* Mensagens de feedback da ação */}
      {loading && <p className="roteiro-loading">Buscando ou atualizando...</p>}
      {error && <p className="roteiro-error">{error}</p>}
      {success && <p className="roteiro-success">{success}</p>}
      
      {/* Card com detalhes da OS, exibido se encontrar */}
      {ordemServico && renderUserDetails()}
    </div>
  );
};

export default IconeMenuRoteiroColeta;
