import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './StatusOS.css';
import { FaEye, FaCamera, FaTimes } from 'react-icons/fa';

const StatusOS = () => {
  // --- ESTADOS DO COMPONENTE ---
  const [ordens, setOrdens] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de loading simplificado
  const [ordemVisualizar, setOrdemVisualizar] = useState(null); // Controla o modal de detalhes
  const [fotoVisivel, setFotoVisivel] = useState(null); // Controla o overlay da foto

  // --- EFEITOS (useEffect) ---

  // Efeito 1: Busca a sessão do usuário. Roda apenas uma vez quando o componente é montado.
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getSession();
  }, []);

  // Efeito 2: Função para buscar as ordens de serviço no banco de dados.
  // Usamos useCallback para otimização, garantindo que a função não seja recriada a cada renderização.
  const buscarOrdensServico = useCallback(async (idDoUsuario) => {
    // Se não houver um ID de usuário, não faz nada e para o loading.
    if (!idDoUsuario) {
      setLoading(false);
      return;
    }
    
    setLoading(true); // Ativa o loading sempre que uma busca é iniciada.
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico, numero_os, descricao, data_criacao, foto_armazenamento,
        mensagem, observacao_agente_ambiental, observacao_motorista, dia_agendamento_coleta,
        tipos_servicos(tipo_servico), equipamentos_tipos(equipamento_tipo), 
        status: status_da_os(status_os)
      `)
      .eq('id_usuario', idDoUsuario)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      setOrdens([]); // Em caso de erro, garante que a lista fique vazia.
    } else {
      setOrdens(data || []);
    }
    
    setLoading(false); // Desativa o loading após a conclusão da busca.
  }, []); // O array de dependências vazio significa que esta função é criada apenas uma vez.

  // Efeito 3: Controla a busca inicial de dados e a inscrição no Realtime.
  // Este efeito roda sempre que o `userId` muda.
  useEffect(() => {
    // 1. Se o userId foi definido, faz a busca inicial dos dados.
    if (userId) {
      buscarOrdensServico(userId);
    }

    // 2. Cria a "inscrição" (subscription) para ouvir as mudanças em tempo real.
    // O nome do canal é único por usuário para otimizar a comunicação.
    const subscription = supabase
      .channel(`public:ordens_servico:id_usuario=eq.${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', // Ouve qualquer evento: INSERT, UPDATE, DELETE
          schema: 'public', 
          table: 'ordens_servico',
          filter: `id_usuario=eq.${userId}` // Filtro crucial: ouvir apenas as mudanças das OS deste usuário!
        },
        (payload) => {
          console.log('Mudança em tempo real recebida!', payload);
          // Ao receber uma notificação, simplesmente chama a função de busca novamente
          // para garantir que a tela tenha as informações mais recentes.
          buscarOrdensServico(userId);
        }
      )
      .subscribe(); // Inicia a "escuta".

    // 3. Função de limpeza: ESSENCIAL.
    // É executada quando o usuário sai da tela (o componente é "desmontado").
    // Ela cancela a inscrição para não consumir recursos desnecessariamente.
    return () => {
      supabase.removeChannel(subscription);
    };

  }, [userId, buscarOrdensServico]); // Dependências: Roda se `userId` ou `buscarOrdensServico` mudarem.


  // --- FUNÇÕES AUXILIARES ---

  // Alterna a visibilidade do overlay da foto
  const handleToggleFoto = (ordemId) => {
    setFotoVisivel(prevId => (prevId === ordemId ? null : ordemId));
  };

  // Formata a data para o padrão brasileiro
  const formatarData = (dataString) => {
    if (!dataString) return 'Não definida';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Retorna a classe CSS correta com base no status da OS
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

  // --- RENDERIZAÇÃO DO COMPONENTE ---

  // Exibe a mensagem de "Carregando..." enquanto os dados não chegam
  if (loading) {
    return <div className="loading-ordens">Carregando ordens...</div>;
  }

  return (
    <div className="ordens-lista-section">
      <h2>Minhas Ordens de Serviço</h2>
      {ordens.length === 0 ? (
        <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
      ) : (
        <div className="ordens-grid">
          {ordens.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-card">
              {/* Ícone para abrir o modal de detalhes */}
              <div 
                className="visualizacao-icone" 
                title="Visualizar detalhes da ordem" 
                onClick={() => {
                  setFotoVisivel(null); // Garante que a foto feche antes de abrir o modal
                  setOrdemVisualizar(ordem);
                }}
              >
                <FaEye />
              </div>

              {/* Conteúdo principal do card */}
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
                
                {/* Botão para visualizar a foto, só aparece se houver foto */}
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

              {/* Overlay da foto, renderizado condicionalmente */}
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

      {/* Modal de detalhes, renderizado condicionalmente */}
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
