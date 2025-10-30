import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuOrdensCanceladas.css';

const IconeMenuOrdensCanceladas = () => {
  const [ordensCanceladas, setOrdensCanceladas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOrdem, setModalOrdem] = useState(null);
  const [idStatusOrdemCancelada, setIdStatusOrdemCancelada] = useState(null);

  // Busca o ID do status "Ordem Cancelada"
  useEffect(() => {
    const fetchIdStatusCancelada = async () => {
      try {
        const { data, error } = await supabase
          .from('status_da_os')
          .select('id_ref_status_os')
          .eq('status_os', 'Ordem Cancelada')
          .single();

        if (error) throw error;
        setIdStatusOrdemCancelada(data.id_ref_status_os);
      } catch (err) {
        console.error('Erro ao buscar ID status ordem cancelada:', err);
      }
    };
    fetchIdStatusCancelada();
  }, []);

  // Busca ordens canceladas usando o ID do status
  const buscarOrdensCanceladas = useCallback(async () => {
    if (!idStatusOrdemCancelada) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id_ref_ordem_servico,
          numero_os,
          observacao_agente_ambiental,
          dia_cancelamento_os,
          usuarios:usuarios!id_usuario (
            nome_completo,
            cpf
          )
        `)
        .eq('status_os', idStatusOrdemCancelada)
        .order('dia_cancelamento_os', { ascending: false });

      if (error) throw error;
      setOrdensCanceladas(data || []);
    } catch (err) {
      console.error('Erro ao buscar ordens canceladas:', err.message || err);
      setOrdensCanceladas([]);
    } finally {
      setLoading(false);
    }
  }, [idStatusOrdemCancelada]);

  useEffect(() => {
    buscarOrdensCanceladas();
  }, [buscarOrdensCanceladas]);

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="canceladas-container">
      <h2>Ordens de Serviço Canceladas</h2>
      {loading ? (
        <p>Carregando ordens canceladas...</p>
      ) : ordensCanceladas.length === 0 ? (
        <p>Nenhuma ordem de serviço cancelada encontrada.</p>
      ) : (
        <table className="tabela-canceladas">
          <thead>
            <tr>
              <th>OS Número</th>
              <th>Nome do Usuário</th>
              <th>CPF</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {ordensCanceladas.map(ordem => (
              <tr key={ordem.id_ref_ordem_servico}>
                <td>{ordem.numero_os.toString().padStart(4, '0')}</td>
                <td>{ordem.usuarios?.nome_completo || 'Desconhecido'}</td>
                <td>{ordem.usuarios?.cpf || 'Não informado'}</td>
                <td>
                  <button onClick={() => setModalOrdem(ordem)}>Ver Motivo</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOrdem && (
        <div className="modal-fundo" onClick={() => setModalOrdem(null)}>
          <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
            <h3>Motivo do Cancelamento OS-{modalOrdem.numero_os.toString().padStart(4, '0')}</h3>
            <p><strong>Observação do Agente Ambiental:</strong></p>
            <p>{modalOrdem.observacao_agente_ambiental || 'Sem observação'}</p>
            <p><strong>Data do Cancelamento:</strong></p>
            <p>{formatarData(modalOrdem.dia_cancelamento_os)}</p>
            <button onClick={() => setModalOrdem(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconeMenuOrdensCanceladas;
