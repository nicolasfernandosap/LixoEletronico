import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './StatusOS.css';
import { FaEye, FaCamera, FaTimes } from 'react-icons/fa';

const StatusOS = () => {
  // --- ESTADOS DO COMPONENTE ---
  const [ordens, setOrdens] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadingOrdens, setLoadingOrdens] = useState(true);
  const [ordemVisualizar, setOrdemVisualizar] = useState(null);
  const [fotoVisivel, setFotoVisivel] = useState(null);

  // --- EFEITOS (useEffect) ---
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
        id_ref_ordem_servico, numero_os, descricao, data_criacao, foto_armazenamento,
        mensagem, observacao_agente_ambiental, observacao_motorista, dia_agendamento_coleta,
        tipos_servicos(tipo_servico), equipamentos_tipos(equipamento_tipo), 
        status: status_da_os(status_os)
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

  // --- FUNÇÕES AUXILIARES ---
  const handleToggleFoto = (ordemId) => {
    setFotoVisivel(prevId => (prevId === ordemId ? null : ordemId));
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não definida';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusClass = (status, observacao) => {
    if (observacao) {
      if (status === 'Destino transporte Coleta') return 'status-destino-transporte-coleta';
      if (status === 'Agendamento presencial') return 'status-agendamento-presencial-confirmado';
      if (status === 'Ordem Cancelada') return 'status-cancelado-especial';
      if (status === 'Coleta Concluída') return 'status-coleta-concluida';
    }
    const statusMap = {
      'Coleta Concluída': 'status-coleta-concluida-badge', 'Cliente Ausente': 'status-cliente-ausente-badge',
      'Agendamento presencial': 'status-agendamento-presencial-badge', 'Aguardando Análise': 'status-pendente',
      'Em Atendimento': 'status-andamento', 'Agendado': 'status-agendado',
      'Concluído': 'status-concluido', 'Cancelado': 'status-cancelado'
    };
    return statusMap[status] || 'status-default';
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
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
              <div 
                className="visualizacao-icone" 
                title="Visualizar detalhes da ordem" 
                onClick={() => {
                  setFotoVisivel(null);
                  setOrdemVisualizar(ordem);
                }}
              >
                <FaEye />
              </div>

              <div className="ordem-header">
                <div className="ordem-info-coluna">
                  <span className={`status-badge ${getStatusClass(ordem.status?.status_os, ordem.observacao_agente_ambiental)}`}>
                    {ordem.status?.status_os || 'Sem status'}
                  </span>
                  <span className="ordem-numero">
                    Ordem Serviço: {ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '—'}
                  </span>
                </div>
                <span className="descricao-label">Descrição do Problema/Serviço</span>
                <p className="ordem-descricao">{ordem.descricao}</p>
                <span className="ordem-tipo">Tipo de Serviço: {ordem.tipos_servicos?.tipo_servico || 'Não definido'}</span>
                <span className="ordem-tipo">Equipamento: {ordem.equipamentos_tipos?.equipamento_tipo || 'Não definido'}</span>
              </div>

              <div className="ordem-body">
                {ordem.mensagem && <p className="ordem-mensagem"><strong>Observações:</strong> {ordem.mensagem}</p>}
                
                {ordem.foto_armazenamento && (
                  <div className="foto-toggle-bar" onClick={() => handleToggleFoto(ordem.id_ref_ordem_servico)}>
                    <FaCamera />
                    <span>Visualizar Foto Anexada</span>
                  </div>
                )}
              </div>

              <div className="ordem-footer">
                <small>Criado em: {formatarData(ordem.data_criacao)}</small>
              </div>

              {/* O overlay da foto é renderizado aqui, por cima do card */}
              {fotoVisivel === ordem.id_ref_ordem_servico && (
                <div className="foto-overlay" onClick={() => handleToggleFoto(ordem.id_ref_ordem_servico)}>
                  <div className="foto-overlay-content" onClick={(e) => e.stopPropagation()}>
                    <img src={ordem.foto_armazenamento} alt="Foto do problema" />
                    <button className="btn-fechar-foto" onClick={() => handleToggleFoto(ordem.id_ref_ordem_servico)}>
                      <FaTimes /> Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes (inalterado) */}
      {ordemVisualizar && (
        <div className="modal-fundo" onClick={() => setOrdemVisualizar(null)}>
          <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
            <h3>Retorno Agente Ambiental Número OS {ordemVisualizar.numero_os.toString().padStart(4, '0')}</h3>
            <p><strong>Observação do Agente Ambiental:</strong></p>
            <p>{ordemVisualizar.observacao_agente_ambiental || 'Aguarde pela análise da central! Em breve retornaremos sobre análise da tratativa.'}</p>
            {ordemVisualizar.status?.status_os !== 'Ordem Cancelada' && ordemVisualizar.status?.status_os !== 'Aguardando Análise' && (
              <><p><strong>Data de Agendamento:</strong></p><p>{ordemVisualizar.dia_agendamento_coleta ? new Date(ordemVisualizar.dia_agendamento_coleta).toLocaleDateString('pt-BR') : 'Não agendado'}</p></>
            )}
            {ordemVisualizar.observacao_motorista && (
              <div className="relato-motorista-destaque"><p><strong>Relato sobre Atendimento presencial:</strong></p><p>{ordemVisualizar.observacao_motorista}</p></div>
            )}
            <button className="btn-fechar" onClick={() => setOrdemVisualizar(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusOS;
