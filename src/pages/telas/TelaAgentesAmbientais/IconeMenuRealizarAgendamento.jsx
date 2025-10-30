import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRealizarAgendamento.css';
import { FaCalendarAlt, FaSearch, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const VALOR_DESTINO_TRANSPORTE = 'Destino transporte Coleta';
const VALOR_AGENDAMENTO_PRESENCIAL = 'Agendamento presencial';
const VALOR_ORDEM_CANCELADA = 'Ordem Cancelada';

const IconeMenuRealizarAgendamento = () => {
  const [busca, setBusca] = useState('');
  const [ordensEncontradas, setOrdensEncontradas] = useState([]);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [fluxoSelecionado, setFluxoSelecionado] = useState('');
  const [observacaoAgente, setObservacaoAgente] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState('');
  const [opcoesFluxo, setOpcoesFluxo] = useState([]);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingFluxo, setLoadingFluxo] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Busca opções de fluxo e prepara select
  useEffect(() => {
    const fetchOpcoesFluxo = async () => {
      setLoadingFluxo(true);
      try {
        const { data, error } = await supabase
          .from('status_da_os')
          .select('id_ref_status_os, status_os')
          .order('id_ref_status_os', { ascending: true });
        if (error) throw error;

        const opcoesExcluidas = ['Aguardando Análise', 'Coleta Concluída', 'Cliente Ausente'];
        const opcoesFiltradas = (data || [])
          .filter(item => !opcoesExcluidas.includes(item.status_os))
          .map(item => ({
            id: item.id_ref_status_os,
            label: item.status_os,
            valor: item.status_os,
          }));
        const opcoes = [{ id: '', label: 'Selecione o Fluxo de Ação' }, ...opcoesFiltradas];
        setOpcoesFluxo(opcoes);
      } catch (err) {
        setMensagemErro('Erro ao carregar opções de fluxo. Tente recarregar a página.');
      } finally {
        setLoadingFluxo(false);
      }
    };
    fetchOpcoesFluxo();
  }, []);

  // Busca ordens conforme busca
  const handleBusca = useCallback(async (termo) => {
    const termoNumerico = termo.replace(/\D/g, '');
    if (termoNumerico.length < 3) {
      setOrdensEncontradas([]);
      return;
    }

    setLoadingBusca(true);
    setMensagemErro('');
    setOsSelecionada(null);
    setFluxoSelecionado('');
    setObservacaoAgente('');
    setDataAgendamento('');
    setTurnoSelecionado('');

    try {
      let query = null;
      if (termoNumerico.length === 11) {
        const { data: usuariosData, error: usuariosError } = await supabase
          .from('usuarios')
          .select('id_usuario, nome_completo, cpf')
          .eq('cpf', termoNumerico);
        if (usuariosError) throw usuariosError;
        const idsUsuario = usuariosData.map(u => u.id_usuario);
        query = supabase
          .from('ordens_servico')
          .select(`
            id_ref_ordem_servico,
            numero_os,
            descricao,
            data_criacao,
            id_usuario,
            turno_opcao_agendamento,
            status_os:status_da_os!inner (
              id_ref_status_os,
              status_os
            ),
            usuarios:usuarios!id_usuario (
              nome_completo,
              cpf
            )
          `)
          .in('id_usuario', idsUsuario);
      } else if (!isNaN(termoNumerico) && termoNumerico.length > 0) {
        query = supabase
          .from('ordens_servico')
          .select(`
            id_ref_ordem_servico,
            numero_os,
            descricao,
            data_criacao,
            id_usuario,
            turno_opcao_agendamento,
            status_os:status_da_os!inner (
              id_ref_status_os,
              status_os
            ),
            usuarios:usuarios!id_usuario (
              nome_completo,
              cpf
            )
          `)
          .eq('numero_os', parseInt(termoNumerico, 10));
      }

      if (query) {
        const { data, error } = await query;
        if (error) throw error;
        setOrdensEncontradas(data || []);
      } else {
        setOrdensEncontradas([]);
      }
    } catch {
      setMensagemErro('Erro ao buscar ordens de serviço. Tente simplificar o termo de busca.');
      setOrdensEncontradas([]);
    } finally {
      setLoadingBusca(false);
    }
  }, []);

  // Delay para evitar buscas a cada tecla digitada
  useEffect(() => {
    const handler = setTimeout(() => {
      handleBusca(busca);
    }, 500);
    return () => clearTimeout(handler);
  }, [busca, handleBusca]);

  // Função para processar submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');
    if (!osSelecionada) {
      setMensagemErro('Por favor, selecione uma Ordem de Serviço.');
      return;
    }
    if (!fluxoSelecionado) {
      setMensagemErro('Por favor, selecione o Fluxo de Ação.');
      return;
    }
    if (observacaoAgente.trim().length < 10) {
      setMensagemErro('A observação do agente deve ter no mínimo 10 caracteres.');
      return;
    }

    const fluxoObj = opcoesFluxo.find(f => f.id.toString() === fluxoSelecionado);
    const isDestinoTransporte = fluxoObj && fluxoObj.valor === VALOR_DESTINO_TRANSPORTE;
    const isAgendamentoPresencial = fluxoObj && fluxoObj.valor === VALOR_AGENDAMENTO_PRESENCIAL;
    const isOrdemCancelada = fluxoObj && fluxoObj.valor === VALOR_ORDEM_CANCELADA;

    if ((isDestinoTransporte || isAgendamentoPresencial) && !dataAgendamento) {
      setMensagemErro('Por favor, informe o Dia de agendamento residencial.');
      return;
    }

    if ((isDestinoTransporte || isAgendamentoPresencial) && !turnoSelecionado) {
      setMensagemErro('Por favor, selecione o turno (Manhã ou Tarde).');
      return;
    }

    setLoadingSubmit(true);

    try {
      const novoStatus = parseInt(fluxoSelecionado);
      const updateData = {
        status_os: novoStatus,
        observacao_agente_ambiental: observacaoAgente,
      };
      if (isDestinoTransporte || isAgendamentoPresencial) {
        updateData.dia_agendamento_coleta = dataAgendamento;
        updateData.turno_opcao_agendamento = turnoSelecionado;
      }
      // Aqui adiciona a data atual caso seja ordem cancelada
      if (isOrdemCancelada) {
        updateData.dia_cancelamento_os = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id_ref_ordem_servico', osSelecionada.id_ref_ordem_servico);
      if (error) throw error;

      // Monta mensagem de sucesso, omite data para cancelada
      let mensagem = `Ordem de Serviço OS-${osSelecionada.numero_os} atualizada para o fluxo: ${fluxoObj.label}.`;
      if (!isOrdemCancelada && (isDestinoTransporte || isAgendamentoPresencial) && dataAgendamento) {
        mensagem += ` Dia de agendamento: ${dataAgendamento}.`;
      }
      setMensagemSucesso(mensagem);

      // Reseta todos campos
      setBusca('');
      setOrdensEncontradas([]);
      setOsSelecionada(null);
      setFluxoSelecionado('');
      setObservacaoAgente('');
      setDataAgendamento('');
      setTurnoSelecionado('');
    } catch {
      setMensagemErro('Erro ao processar o fluxo da Ordem de Serviço. Verifique a conexão e tente novamente.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Formata datas para exibição
  const formatarData = (dataString) => {
    if (!dataString) return '—';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Retorna label do status atual da OS
  const getStatusLabel = (os) => {
    if (os.status_os && os.status_os.status_os) return os.status_os.status_os;
    return 'Desconhecido';
  };

  return (
    <div className="agendamento-container">
      <h2><FaCalendarAlt /> Realizar Agendamento/Gerenciamento de OS</h2>
      <div className="linha-separadora"></div>

      {mensagemSucesso && <div className="mensagem-sucesso"><FaCheckCircle /> {mensagemSucesso}</div>}
      {mensagemErro && <div className="mensagem-erro"><FaExclamationTriangle /> {mensagemErro}</div>}

      <form onSubmit={handleSubmit} className="agendamento-form">
        <div className="form-group busca-os">
          <label htmlFor="busca">Buscar Ordem de Serviço (CPF ou Nº OS):</label>
          <div className="input-busca-wrapper">
            <FaSearch className="icone-busca" />
            <input
              type="text"
              id="busca"
              value={busca}
              onChange={e => setBusca(e.target.value.replace(/\D/g, ''))}
              placeholder="Digite o CPF ou número da OS (apenas números)..."
            />
          </div>
        </div>

        {loadingBusca ? (
          <div className="loading-busca"><FaSpinner className="spinner-icon" /> Buscando ordens...</div>
        ) : (
          ordensEncontradas.length > 0 && busca.length >= 3 ? (
            <div className="resultados-busca">
              <p>Selecione a OS:</p>
              <ul className="lista-os-busca">
                {ordensEncontradas.map(os => (
                  <li
                    key={os.id_ref_ordem_servico}
                    className={`os-item ${osSelecionada?.id_ref_ordem_servico === os.id_ref_ordem_servico ? 'selecionada' : ''}`}
                    onClick={() => {
                      setOsSelecionada(os);
                      setFluxoSelecionado(os.status_os?.id_ref_status_os?.toString() || '');
                      setObservacaoAgente(os.observacao_agente_ambiental || '');
                      setDataAgendamento(os.dia_agendamento_coleta || '');
                      setTurnoSelecionado(os.turno_opcao_agendamento || '');
                    }}
                  >
                    <span className="os-numero">OS-{os.numero_os.toString().padStart(4, '0')}</span>
                    <span className="os-usuario">{os.usuarios?.nome_completo || 'Usuário Desconhecido'}</span>
                    <span className="os-data">Criada em: {formatarData(os.data_criacao)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            busca.length >= 3 && !loadingBusca && !mensagemErro ? (
              <p className="nenhum-resultado-busca">Nenhuma OS encontrada com o termo de busca.</p>
            ) : null
          )
        )}

        {osSelecionada && (
          <div className="os-detalhes-selecionada">
            <h3>OS Selecionada: OS-{osSelecionada.numero_os.toString().padStart(4, '0')}</h3>
            <p><strong>Usuário:</strong> {osSelecionada.usuarios?.nome_completo} (CPF: {osSelecionada.usuarios?.cpf})</p>
            <p><strong>Descrição:</strong> {osSelecionada.descricao}</p>
            <p className="status-atual">Status Atual: {getStatusLabel(osSelecionada)}</p>
            <p><strong>Turno do Agendamento:</strong> {osSelecionada.turno_opcao_agendamento || '—'}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fluxo">Fluxo de Ação *</label>
          <select
            id="fluxo"
            value={fluxoSelecionado}
            onChange={(e) => setFluxoSelecionado(e.target.value)}
            required
            disabled={!osSelecionada || loadingSubmit || loadingFluxo}
          >
            {loadingFluxo ? (
              <option value="" disabled>Carregando opções...</option>
            ) : (
              opcoesFluxo.map(opcao => (
                <option key={opcao.id} value={opcao.id} disabled={opcao.id === ''}>
                  {opcao.label}
                </option>
              ))
            )}
          </select>
        </div>

        {(opcoesFluxo.find(f => f.id.toString() === fluxoSelecionado)?.valor === VALOR_DESTINO_TRANSPORTE
          || opcoesFluxo.find(f => f.id.toString() === fluxoSelecionado)?.valor === VALOR_AGENDAMENTO_PRESENCIAL) && (
          <>
            <div className="form-group">
              <label htmlFor="dataAgendamento">Dia de agendamento residencial *</label>
              <input
                type="date"
                id="dataAgendamento"
                value={dataAgendamento}
                onChange={e => setDataAgendamento(e.target.value)}
                required
                disabled={loadingSubmit}
              />
            </div>

            <div className="form-group">
              <label htmlFor="turno">Selecione o Turno *</label>
              <select
                id="turno_opcao"
                value={turnoSelecionado}
                onChange={(e) => setTurnoSelecionado(e.target.value)}
                required
                disabled={loadingSubmit}
              >
                <option value="">Selecione o Turno</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="observacao">Observação do Agente Ambiental *</label>
          <textarea
            id="observacao"
            value={observacaoAgente}
            onChange={e => setObservacaoAgente(e.target.value)}
            placeholder="Relato e observações sobre o fluxo de ação escolhido..."
            rows="5"
            required
            disabled={!osSelecionada || loadingSubmit}
          />
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={!osSelecionada || !fluxoSelecionado || loadingSubmit}
        >
          {loadingSubmit ? 'Processando...' : 'Aplicar Fluxo de Ação'}
        </button>
      </form>
    </div>
  );
};

export default IconeMenuRealizarAgendamento;
