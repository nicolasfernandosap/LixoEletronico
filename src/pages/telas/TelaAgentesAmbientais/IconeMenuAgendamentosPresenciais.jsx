import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuAgendamentosPresenciais.css';

const IconeMenuAgendamentosPresenciais = () => {
  const [numeroOS, setNumeroOS] = useState('');
  const [ordem, setOrdem] = useState(null);
  const [equipamentoRecebido, setEquipamentoRecebido] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const statusAgendamentoId = 2; // valor do status agendamento presencial

  useEffect(() => {
    async function fetchStatusOptions() {
      const { data, error } = await supabase
        .from('status_da_os')
        .select('id_ref_status_os, status_os')
        .in('status_os', ['Coleta Concluida', 'Cliente Ausente']);
      if (!error && data) setStatusOptions(data);
    }
    fetchStatusOptions();
  }, []);

  async function buscarOrdem() {
    if (!numeroOS.trim()) {
      setOrdem(null);
      return;
    }
    setLoading(true);
    const numVal = parseInt(numeroOS, 10);
    if (isNaN(numVal) || numVal <= 0) {
      alert('Número de OS inválido.');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico,
        numero_os,
        observacao_agente_ambiental,
        status_os,
        usuarios!ordens_servico_id_usuario_fkey(
          id_usuario, nome_completo, cpf
        )
      `)
      .eq('status_os', statusAgendamentoId)
      .eq('numero_os', numVal)
      .single();
    if (error) {
      setOrdem(null);
      alert('Ordem não encontrada.');
    } else {
      setOrdem(data);
      setEquipamentoRecebido('');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ordem) {
      alert('Nenhuma ordem selecionada.');
      return;
    }
    if (!equipamentoRecebido) {
      alert('Selecione o status para o equipamento.');
      return;
    }
    setLoading(true);

    // Atualiza só a coluna status_os com o id de status selecionado
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status_os: parseInt(equipamentoRecebido, 10) })
      .eq('id_ref_ordem_servico', ordem.id_ref_ordem_servico);

    setLoading(false);

    if (error) {
      alert('Erro ao atualizar a ordem: ' + error.message);
    } else {
      alert('Status atualizado com sucesso!');
      setOrdem(null);
      setNumeroOS('');
      setEquipamentoRecebido('');
    }
  }

  return (
    <div className="agendamento-presencial-container">
      <h2>Baixa de Ordem de Serviço - Agendamento Presencial</h2>

      <div className="form-group">
        <label htmlFor="numero-os">Número da Ordem de Serviço:</label>
        <input
          id="numero-os"
          type="text"
          value={numeroOS}
          onChange={e => setNumeroOS(e.target.value)}
          placeholder="Digite o número da OS"
          disabled={loading}
        />
        <button onClick={buscarOrdem} disabled={loading}>
          Buscar Ordem
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      {ordem && (
        <form className="form-baixa-os" onSubmit={handleSubmit}>
          <p><strong>Ord. Serviço nº:</strong> {ordem.numero_os.toString().padStart(4, '0')}</p>
          <p><strong>Usuário:</strong> {ordem.usuarios?.nome_completo || '-'}</p>
          <p><strong>CPF:</strong> {ordem.usuarios?.cpf || '-'}</p>
          <p><strong>Observação:</strong> {ordem.observacao_agente_ambiental || '-'}</p>

          <div className="form-group">
            <label htmlFor="equipamento-recebido">Status Equipamento Recebido:</label>
            <select
              id="equipamento-recebido"
              value={equipamentoRecebido}
              onChange={e => setEquipamentoRecebido(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Selecione o status</option>
              {statusOptions.map((status) => (
                <option key={status.id_ref_status_os} value={status.id_ref_status_os}>
                  {status.status_os}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}>
            Confirmar atualização
          </button>
        </form>
      )}
    </div>
  );
};

export default IconeMenuAgendamentosPresenciais;
