import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './StatusOS.css';
import { FaEye } from 'react-icons/fa';

const StatusOS = () => {
  const [ordens, setOrdens] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadingOrdens, setLoadingOrdens] = useState(true);
  const [ordemVisualizar, setOrdemVisualizar] = useState(null);

  useEffect(() => {
    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
      else setLoadingOrdens(false);
    };
    buscarUsuarioAtual();
  }, []);

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

  useEffect(() => {
    buscarOrdensServico();
  }, [buscarOrdensServico]);

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

  const getStatusClass = (status) => {
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
        <div className="loading-ordens">Carregando ordens...</div>
      ) : ordens.length === 0 ? (
        <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
      ) : (
        <div className="ordens-grid">
          {ordens.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-card">
              {/* Ícone de olho que abre modal */}
              <div
                className="visualizacao-icone"
                title="Visualizar detalhes da ordem"
                onClick={() => setOrdemVisualizar(ordem)}
              >
                <FaEye />
              </div>

              <div className="ordem-header">
                <div className="ordem-info-linha">
                  <span className={`status-badge ${getStatusClass(ordem.status_da_os?.status_os)}`}>
                    {ordem.status_da_os?.status_os || 'Sem status'}
                  </span>
                  <span className="ordem-numero">
                    Ordem Serviço: {ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '—'}
                  </span>
                </div>
                <span className="ordem-tipo">
                  Tipo de Serviço: {ordem.tipos_servicos?.tipo_servico || 'Não definido'}
                </span>
                <span className="ordem-tipo">
                  Equipamento: {ordem.equipamentos_tipos?.equipamento_tipo || 'Não definido'}
                </span>
              </div>

              <div className="ordem-body">
                <p className="ordem-descricao">{ordem.descricao}</p>
                {ordem.mensagem && (
                  <p className="ordem-mensagem">
                    <strong>Observações:</strong> {ordem.mensagem}
                  </p>
                )}
                {ordem.url_foto && (
                  <div className="ordem-foto">
                    <img src={ordem.url_foto} alt="Foto do problema" style={{ maxWidth: '100%', borderRadius: '6px' }} />
                  </div>
                )}
              </div>

              <div className="ordem-footer">
                <small>Criado em: {formatarData(ordem.data_criacao)}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal com a mensagem quando o olho é clicado */}
      {ordemVisualizar && (
        <div className="modal-fundo" onClick={() => setOrdemVisualizar(null)}>
          <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
            <h3>Retorno Agente Ambiental Número OS {ordemVisualizar.numero_os.toString().padStart(4, '0')}</h3>
            <p><strong>Observação do Agente Ambiental:</strong></p>
            <p>{ordemVisualizar.observacao_agente_ambiental || 'Aguarde pela análise da central! Em breve retornaremos sobre análise da tratativa.'}</p>
            <p><strong>Data de Agendamento:</strong> {ordemVisualizar.dia_agendamento_coleta ? new Date(ordemVisualizar.dia_agendamento_coleta).toLocaleDateString('pt-BR') : 'Não agendado'}</p>
            <button className="btn-fechar" onClick={() => setOrdemVisualizar(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusOS;
