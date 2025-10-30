import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './StatusOS.css';
import { FaEye } from 'react-icons/fa';

const StatusOS = () => {
  // Estado que armazena as ordens de serviço carregadas do Supabase
  const [ordens, setOrdens] = useState([]);
  // Estado para guardar o ID do usuário atual, obtido da sessão Supabase
  const [userId, setUserId] = useState(null);
  // Estado para controle de loading das ordens (exibir carregando enquanto busca)
  const [loadingOrdens, setLoadingOrdens] = useState(true);
  // Estado que guarda a ordem selecionada para visualização detalhada no modal
  const [ordemVisualizar, setOrdemVisualizar] = useState(null);

  // useEffect disparado no carregamento do componente para buscar a sessão e usuário atual
  useEffect(() => {
    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        setLoadingOrdens(false);
      }
    };
    buscarUsuarioAtual();
  }, []);

  // Função para buscar as ordens de serviço do usuário logado, com dados extras relacionados
  const buscarOrdensServico = useCallback(async () => {
    if (!userId) return;
    setLoadingOrdens(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico, 
        numero_os, 
        descricao, 
        data_criacao, 
        url_foto, 
        mensagem, 
        observacao_agente_ambiental,
        dia_agendamento_coleta,
        tipos_servicos(tipo_servico), 
        equipamentos_tipos(equipamento_tipo), 
        status_da_os(status_os)
      `)
      .eq('id_usuario', userId)
      .order('data_criacao', { ascending: false });
    if (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      setOrdens([]);
    } else {
      setOrdens(data || []);
    }
    setLoadingOrdens(false);
  }, [userId]);

  // Atualiza a lista de ordens toda vez que o ID do usuário muda
  useEffect(() => {
    buscarOrdensServico();
  }, [buscarOrdensServico]);

  // Função para formatar datas para o padrão brasileiro dd/mm/aaaa hh:mm
  const formatarData = (dataString) => {
    if (!dataString) return 'Não definida';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mapeia o status para a classe CSS correspondente e trata casos especiais com observacao
  const getStatusClass = (status, observacao) => {
    if (observacao) {
      if (status === 'Agendamento presencial' || status === 'Destino transporte Coleta') {
        return 'status-agendamento-confirmado';
      }
      if (status === 'Ordem Cancelada') {
        return 'status-cancelado-especial';
      }
      if (status === 'Coleta Concluída') {
        return 'status-coleta-concluida';
      }
    }
    const statusMap = {
      'Aguardando Análise': 'status-pendente',
      'Em Atendimento': 'status-andamento',
      'Agendado': 'status-agendado',
      'Concluído': 'status-concluido',
      'Cancelado': 'status-cancelado'
    };
    if (status && status.toUpperCase() === 'AGUARDANDO ANÁLISE') {
      return 'status-pendente';
    }
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="ordens-lista-section">
      <h2>Minhas Ordens de Serviço</h2>
      {loadingOrdens ? (
        // Exibe mensagem de carregando enquanto busca ordens
        <div className="loading-ordens">Carregando ordens...</div>
      ) : ordens.length === 0 ? (
        // Mensagem caso não existam ordens para o usuário
        <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
      ) : (
        // Exibe grade com as ordens encontradas
        <div className="ordens-grid">
          {ordens.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-card">
              {/* Ícone de visualização no canto superior direito, que abre o modal */}
              <div
                className="visualizacao-icone"
                title="Visualizar detalhes da ordem"
                onClick={() => setOrdemVisualizar(ordem)}
              >
                <FaEye />
              </div>

              {/* Cabeçalho da ordem com status e número em coluna */}
              <div className="ordem-header">
                <div className="ordem-info-coluna">
                  <span className={`status-badge ${getStatusClass(ordem.status_da_os?.status_os, ordem.observacao_agente_ambiental)}`}>
                    {ordem.status_da_os?.status_os || 'Sem status'}
                  </span>
                  <span className="ordem-numero">
                    Ordem Serviço: {ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '—'}
                  </span>
                </div>

                {/* Label explicativa para a descrição do problema/serviço */}
                <span className="descricao-label">Descrição do Problema/Serviço</span>

                {/* Descrição de texto da ordem */}
                <p className="ordem-descricao">{ordem.descricao}</p>

                {/* Informações complementares de tipo e equipamento */}
                <span className="ordem-tipo">
                  Tipo de Serviço: {ordem.tipos_servicos?.tipo_servico || 'Não definido'}
                </span>
                <span className="ordem-tipo">
                  Equipamento: {ordem.equipamentos_tipos?.equipamento_tipo || 'Não definido'}
                </span>
              </div>

              {/* Corpo da ordem com mensagem e foto */}
              <div className="ordem-body">
                {ordem.mensagem && (
                  <p className="ordem-mensagem">
                    <strong>Observações:</strong> {ordem.mensagem}
                  </p>
                )}
                {ordem.url_foto && (
                  <div className="ordem-foto">
                    <img 
                      src={ordem.url_foto} 
                      alt="Foto do problema" 
                      style={{ maxWidth: '100%', borderRadius: '6px' }} 
                    />
                  </div>
                )}
              </div>

              {/* Rodapé com data de criação formatada */}
              <div className="ordem-footer">
                <small>Criado em: {formatarData(ordem.data_criacao)}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para mostrar observação do agente ambiental e agendamento */}
      {ordemVisualizar && (
        <div className="modal-fundo" onClick={() => setOrdemVisualizar(null)}>
          {/* Previne fechamento do modal ao clicar no conteúdo */}
          <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
            <h3>
              Retorno Agente Ambiental Número OS {ordemVisualizar.numero_os.toString().padStart(4, '0')}
            </h3>
            <p><strong>Observação do Agente Ambiental:</strong></p>
            <p>
              {ordemVisualizar.observacao_agente_ambiental || 'Aguarde pela análise da central! Em breve retornaremos sobre análise da tratativa.'}
            </p>
            <p><strong>Data de Agendamento:</strong></p>
            <p>
              {ordemVisualizar.dia_agendamento_coleta ? new Date(ordemVisualizar.dia_agendamento_coleta).toLocaleDateString('pt-BR') : 'Não agendado'}
            </p>
            <button className="btn-fechar" onClick={() => setOrdemVisualizar(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusOS;
