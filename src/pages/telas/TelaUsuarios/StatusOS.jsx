import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './StatusOS.css'; // Importa o novo CSS
import { FaCheckCircle } from 'react-icons/fa'; 

const StatusOS = () => {
  const [ordens, setOrdens] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadingOrdens, setLoadingOrdens] = useState(true);

  // 1. Buscar usuário atual
  useEffect(() => {
    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
      else setLoadingOrdens(false); // Se não houver usuário, para o loading
    };
    buscarUsuarioAtual();
  }, []);

  // 2. Buscar ordens do usuário
  const buscarOrdensServico = useCallback(async () => {
    if (!userId) return;
    setLoadingOrdens(true);

    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id_ref_ordem_servico, numero_os, descricao, data_criacao, url_foto, mensagem, tipos_servicos(tipo_servico), equipamentos_tipos(equipamento_tipo), status_da_os(status_os)')
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
    // Esta dependência garante que a busca seja refeita quando o userId for definido
    buscarOrdensServico();
  }, [buscarOrdensServico]);

  // Funções de formatação e estilo (extraídas de FormularioOrdensServico.jsx)
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
    // Mapeamento para o status que aparece na imagem
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
              <div className="ordem-header">
                <div className="ordem-info-linha">
                  <span className={`status-badge ${getStatusClass(ordem.status_da_os?.status_os)}`}>
                    {ordem.status_da_os?.status_os || 'Sem status'}
                  </span>
                  <span className="ordem-numero">
                    OS: {ordem.numero_os ? ordem.numero_os.toString().padStart(4, '0') : '—'}
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
    </div>
  );
};

export default StatusOS;
