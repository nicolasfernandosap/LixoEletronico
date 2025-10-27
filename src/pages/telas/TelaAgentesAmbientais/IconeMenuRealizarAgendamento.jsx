import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRealizarAgendamento.css';
import { FaCalendarAlt, FaSearch, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// Opções de Fluxo e seus respectivos IDs de Status (A serem definidos no Supabase)
// Assumindo que:
// 2 = Condução à Sede (Em Atendimento)
// 3 = Destinação Transporte (Agendado/Em Transporte)
// 4 = Cancelado
const FLUXO_OPCOES = [
  { id: '', label: 'Selecione o Fluxo de Ação' },
  { id: 2, label: 'Condução à Sede de Tratativa' },
  { id: 3, label: 'Destinação Transporte' },
  { id: 4, label: 'Cancelar OS' },
];

const IconeMenuRealizarAgendamento = () => {
  const [busca, setBusca] = useState('');
  const [ordensEncontradas, setOrdensEncontradas] = useState([]);
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [fluxoSelecionado, setFluxoSelecionado] = useState('');
  const [observacaoAgente, setObservacaoAgente] = useState('');
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // 1. Função de Busca de OS
  const handleBusca = useCallback(async (termo) => {
    if (termo.trim().length < 3) {
      setOrdensEncontradas([]);
      return;
    }

    setLoadingBusca(true);
    setMensagemErro('');
    setOsSelecionada(null); // Limpa a seleção ao buscar

    try {
      // Normaliza o termo de busca para CPF (apenas números) ou Número OS
      const termoNormalizado = termo.replace(/\D/g, '');

      let query = supabase
        .from('ordens_servico')
        .select(`
          id_ref_ordem_servico, 
          numero_os, 
          descricao, 
          data_criacao,
          status_os,
          usuarios (nome_completo, cpf)
        `);
      
      // Lógica de busca avançada:
      // 1. Busca por CPF (se o termo parecer um CPF)
      if (termoNormalizado.length >= 11) {
        query = query.in('id_usuario', supabase.from('usuarios').select('id_usuario').eq('cpf', termoNormalizado));
      } 
      // 2. Busca por Número da OS (se o termo for numérico e menor que 11 dígitos)
      else if (!isNaN(termoNormalizado) && termoNormalizado.length > 0) {
        query = query.eq('numero_os', parseInt(termoNormalizado));
      }
      // 3. Busca por Nome do Usuário (busca padrão)
      else {
        query = query.ilike('usuarios.nome_completo', `%${termo}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setOrdensEncontradas(data || []);

    } catch (err) {
      console.error('Erro ao buscar ordens:', err);
      setMensagemErro('Erro ao buscar ordens de serviço. Tente simplificar o termo de busca.');
      setOrdensEncontradas([]);
    } finally {
      setLoadingBusca(false);
    }
  }, []);

  // Efeito para disparar a busca quando o campo 'busca' for alterado
  useEffect(() => {
    const handler = setTimeout(() => {
      handleBusca(busca);
    }, 500); // Debounce de 500ms
    return () => clearTimeout(handler);
  }, [busca, handleBusca]);

  // 2. Função de Submissão do Formulário
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

    setLoadingSubmit(true);

    try {
      const novoStatus = parseInt(fluxoSelecionado);
      
      // Atualiza o status da OS e adiciona a observação do agente
      const { error } = await supabase
        .from('ordens_servico')
        .update({ 
          status_os: novoStatus,
          // Adiciona a observação do agente em um novo campo (ex: observacao_agente)
          // Se este campo não existir, use 'mensagem' e concatene ou crie um campo específico no Supabase.
          // Assumindo que você criará um campo 'observacao_agente' para não misturar com a 'mensagem' original do usuário.
          observacao_agente: observacaoAgente 
        })
        .eq('id_ref_ordem_servico', osSelecionada.id_ref_ordem_servico);

      if (error) throw error;

      setMensagemSucesso(`Ordem de Serviço OS-${osSelecionada.numero_os} atualizada para o fluxo: ${FLUXO_OPCOES.find(f => f.id === novoStatus).label}.`);
      
      // Limpa o formulário
      setBusca('');
      setOrdensEncontradas([]);
      setOsSelecionada(null);
      setFluxoSelecionado('');
      setObservacaoAgente('');

    } catch (err) {
      console.error('Erro ao atualizar OS:', err);
      setMensagemErro('Erro ao processar o fluxo da Ordem de Serviço. Verifique a conexão e tente novamente.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '—';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="agendamento-container">
      <h2><FaCalendarAlt /> Realizar Agendamento/Gerenciamento de OS</h2>
      <div className="linha-separadora"></div>

      {mensagemSucesso && <div className="mensagem-sucesso"><FaCheckCircle /> {mensagemSucesso}</div>}
      {mensagemErro && <div className="mensagem-erro"><FaExclamationTriangle /> {mensagemErro}</div>}

      <form onSubmit={handleSubmit} className="agendamento-form">
        
        {/* === CAMPO DE BUSCA === */}
        <div className="form-group busca-os">
          <label htmlFor="busca">Buscar Ordem de Serviço (Nome, CPF ou Nº OS):</label>
          <div className="input-busca-wrapper">
            <FaSearch className="icone-busca" />
            <input
              type="text"
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome, CPF ou número da OS..."
            />
          </div>
        </div>

        {/* === RESULTADOS DA BUSCA === */}
        {loadingBusca ? (
          <div className="loading-busca"><FaSpinner className="spinner-icon" /> Buscando ordens...</div>
        ) : ordensEncontradas.length > 0 ? (
          <div className="resultados-busca">
            <p>Selecione a OS:</p>
            <ul className="lista-os-busca">
              {ordensEncontradas.map(os => (
                <li 
                  key={os.id_ref_ordem_servico} 
                  className={`os-item ${osSelecionada?.id_ref_ordem_servico === os.id_ref_ordem_servico ? 'selecionada' : ''}`}
                  onClick={() => setOsSelecionada(os)}
                >
                  <span className="os-numero">OS-{os.numero_os.toString().padStart(4, '0')}</span>
                  <span className="os-usuario">{os.usuarios?.nome_completo || 'Usuário Desconhecido'}</span>
                  <span className="os-data">Criada em: {formatarData(os.data_criacao)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : busca.length >= 3 && !loadingBusca ? (
            <p className="nenhum-resultado-busca">Nenhuma OS encontrada com o termo de busca.</p>
        ) : null}

        {/* === DETALHES DA OS SELECIONADA === */}
        {osSelecionada && (
          <div className="os-detalhes-selecionada">
            <h3>OS Selecionada: OS-{osSelecionada.numero_os.toString().padStart(4, '0')}</h3>
            <p><strong>Usuário:</strong> {osSelecionada.usuarios?.nome_completo} (CPF: {osSelecionada.usuarios?.cpf})</p>
            <p><strong>Descrição:</strong> {osSelecionada.descricao}</p>
            <p className="status-atual">Status Atual: {osSelecionada.status_os}</p>
          </div>
        )}

        {/* === SELETOR DE FLUXO === */}
        <div className="form-group">
          <label htmlFor="fluxo">Fluxo de Ação *</label>
          <select
            id="fluxo"
            value={fluxoSelecionado}
            onChange={(e) => setFluxoSelecionado(e.target.value)}
            required
            disabled={!osSelecionada || loadingSubmit}
          >
            {FLUXO_OPCOES.map(opcao => (
              <option key={opcao.id} value={opcao.id} disabled={opcao.id === ''}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        {/* === OBSERVAÇÃO DO AGENTE === */}
        <div className="form-group">
          <label htmlFor="observacao">Observação do Agente Ambiental *</label>
          <textarea
            id="observacao"
            value={observacaoAgente}
            onChange={(e) => setObservacaoAgente(e.target.value)}
            placeholder="Relato e observações sobre o fluxo de ação escolhido..."
            rows="5"
            required
            disabled={!osSelecionada || loadingSubmit}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={!osSelecionada || !fluxoSelecionado || loadingSubmit}>
          {loadingSubmit ? 'Processando...' : 'Aplicar Fluxo de Ação'}
        </button>

      </form>
    </div>
  );
};

export default IconeMenuRealizarAgendamento;