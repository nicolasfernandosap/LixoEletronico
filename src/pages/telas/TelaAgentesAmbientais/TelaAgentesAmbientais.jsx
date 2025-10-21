import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './TelaAgentesAmbientais.css';
import { FaUser, FaMapMarkerAlt, FaTruck, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- Componente Principal da Tela ---
const TelaAgentesAmbientais = () => {
  const [agenteNome] = useState('Agente Ambiental');
  const [abaSelecionada, setAbaSelecionada] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [motoristasList] = useState([{ id: 1, nome: 'Carlos' }, { id: 2, nome: 'Mariana' }]);
  const navigate = useNavigate();

  // NOVO: Estado para controlar a OS selecionada na aba "Solicitações"
  const [selectedOrdem, setSelectedOrdem] = useState(null);

  // Busca a lista de status no carregamento inicial
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase.from('status_da_os').select('*').order('id_ref_status_os');
      setStatusList(data || []);
    };
    fetchStatus();
  }, []);

  // Busca as ordens quando uma aba é clicada
  const fetchOrdens = useCallback(async (statusAba) => {
    if (!statusAba) return;
    setLoading(true);
    setAbaSelecionada(statusAba);
    setSelectedOrdem(null); // Limpa a seleção ao trocar de aba

    let query = supabase.from('ordens_servico')
      .select(`*, usuarios ( nome_completo, email, endereco, numero_casa, bairro, cidade, estado, cep ), tipos_servicos ( tipo_servico ), equipamentos_tipos ( equipamento_tipo ), status_da_os ( status_os )`);

    if (statusAba !== 'Todas' && statusAba !== 'Solicitações') {
      const statusObj = statusList.find(s => s.status_os === statusAba);
      if (statusObj) query = query.eq('status_os', statusObj.id_ref_status_os);
    } else if (statusAba === 'Solicitações') {
      // "Solicitações" busca apenas as que estão aguardando análise
      const statusObj = statusList.find(s => s.status_os === 'Aguardando Análise');
      if (statusObj) query = query.eq('status_os', statusObj.id_ref_status_os);
    }

    const { data, error } = await query.order('data_criacao', { ascending: false });
    setOrdens(error ? [] : data || []);
    setLoading(false);
  }, [statusList]);

  // Função para mudar o status da OS (o "Executar Tarefa")
  const handleStatusChange = async (ordemId, novoStatusId) => {
    const { error } = await supabase.from('ordens_servico').update({ status_os: novoStatusId }).eq('id_ref_ordem_servico', ordemId);
    if (error) {
      console.error("Erro ao atualizar status:", error);
    } else {
      // Atualiza a lista para remover a OS que mudou de status
      setOrdens(prevOrdens => prevOrdens.filter(o => o.id_ref_ordem_servico !== ordemId));
      setSelectedOrdem(null); // Limpa o painel de detalhes
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="agente-page-wrapper">
      <header className="agente-header-nav">
        <div className="header-logo-area">
          <div className="header-logo">L</div><span>Lixo Eletrônico</span>
        </div>
        <nav className="header-tabs-nav">
          <ul>
            <li onClick={() => fetchOrdens('Solicitações')} className={abaSelecionada === 'Solicitações' ? 'active' : ''}>Solicitações</li>
            <li onClick={() => fetchOrdens('Todas')} className={abaSelecionada === 'Todas' ? 'active' : ''}>Todas as Ordens</li>
            {statusList.filter(s => s.status_os !== 'Aguardando Análise').map(status => (
              <li key={status.id_ref_status_os} onClick={() => fetchOrdens(status.status_os)} className={abaSelecionada === status.status_os ? 'active' : ''}>
                {status.status_os}
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-user-area">
          <span>Olá, {agenteNome}</span>
          <button onClick={handleLogout} className="header-logout-btn" title="Sair"><FaSignOutAlt /></button>
        </div>
      </header>

      <main className="agente-main-content">
        {!abaSelecionada ? (
          <div className="welcome-screen">
            <h1>Bem-vindo ao Painel do Agente</h1>
            <p>Selecione "Solicitações" para iniciar a triagem ou outra aba para visualizar as ordens.</p>
          </div>
        ) : loading ? (
          <div className="loading-spinner"></div>
        ) : abaSelecionada === 'Solicitações' ? (
          // --- Layout de Duas Colunas para "Solicitações" ---
          <div className="solicitacoes-layout">
            <div className="lista-solicitacoes">
              <div className="lista-header">
                <h3>Novas Solicitações</h3>
                <p>{ordens.length} aguardando análise</p>
              </div>
              {ordens.length > 0 ? ordens.map(ordem => (
                <div key={ordem.id_ref_ordem_servico} className={`solicitacao-card ${selectedOrdem?.id_ref_ordem_servico === ordem.id_ref_ordem_servico ? 'active' : ''}`} onClick={() => setSelectedOrdem(ordem)}>
                  <div className="solicitacao-card-info">
                    <span className="solicitacao-os-number">OS: {String(ordem.numero_os || ordem.id_ref_ordem_servico).padStart(4, '0')}</span>
                    <span className="solicitacao-cliente-nome">{ordem.usuarios.nome_completo}</span>
                  </div>
                  <FaChevronRight />
                </div>
              )) : <p className="sem-ordens-lista">Nenhuma nova solicitação.</p>}
            </div>
            <div className="detalhe-solicitacao">
              {selectedOrdem ? (
                // --- Painel de Detalhes da OS Selecionada ---
                <div className="detalhe-card">
                  <div className="detalhe-header">
                    <h2>OS: {String(selectedOrdem.numero_os || selectedOrdem.id_ref_ordem_servico).padStart(4, '0')}</h2>
                    <span className="detalhe-status">{selectedOrdem.status_da_os.status_os}</span>
                  </div>
                  <div className="detalhe-bloco">
                    <h4><FaUser /> Cliente</h4>
                    <p><strong>Nome:</strong> {selectedOrdem.usuarios.nome_completo}</p>
                    <p><strong>Email:</strong> {selectedOrdem.usuarios.email}</p>
                  </div>
                  <div className="detalhe-bloco">
                    <h4><FaMapMarkerAlt /> Endereço</h4>
                    <p>{`${selectedOrdem.usuarios.endereco}, ${selectedOrdem.usuarios.numero_casa}`}</p>
                    <p>{`${selectedOrdem.usuarios.bairro}, ${selectedOrdem.usuarios.cidade}`}</p>
                  </div>
                  <hr/>
                  <h4>Detalhes do Serviço</h4>
                  <p><strong>Tipo:</strong> {selectedOrdem.tipos_servicos.tipo_servico}</p>
                  <p><strong>Equipamento:</strong> {selectedOrdem.equipamentos_tipos.equipamento_tipo}</p>
                  <p><strong>Descrição:</strong> {selectedOrdem.descricao}</p>
                  <hr/>
                  <div className="detalhe-acao">
                    <label>Executar Tarefa (Mover para):</label>
                    <select onChange={(e) => handleStatusChange(selectedOrdem.id_ref_ordem_servico, e.target.value)}>
                      <option>Selecione um novo status...</option>
                      {statusList.filter(s => s.status_os !== 'Aguardando Análise').map(s => (
                        <option key={s.id_ref_status_os} value={s.id_ref_status_os}>{s.status_os}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="detalhe-placeholder">Selecione uma solicitação à esquerda para ver os detalhes.</div>
              )}
            </div>
          </div>
        ) : (
          // --- Layout de Grid para as outras abas ---
          <>
            <div className="content-title-bar"><h1>{abaSelecionada}</h1><p>Exibindo {ordens.length} solicitações</p></div>
            <div className="agente-ordens-grid">
              {ordens.length > 0 ? ordens.map(ordem => (
                <div className="card-os" key={ordem.id_ref_ordem_servico}>
                  <div className="card-os-header"><span className={`card-os-status status-${ordem.status_da_os.status_os.toLowerCase().replace(/ /g, '-')}`}>{ordem.status_da_os.status_os}</span><span className="card-os-number">OS: {String(ordem.numero_os || ordem.id_ref_ordem_servico).padStart(4, '0')}</span></div>
                  <div className="card-os-body"><div className="card-os-info-block">Tipo de Serviço: {ordem.tipos_servicos.tipo_servico}</div><div className="card-os-info-block">Equipamento: {ordem.equipamentos_tipos.equipamento_tipo}</div><p className="card-os-description">{ordem.descricao}</p>{ordem.mensagem && <div className="card-os-notes"><strong>Observações:</strong> {ordem.mensagem}</div>}</div>
                  <div className="card-os-footer"><small>Criado em: {formatarData(ordem.data_criacao)}</small></div>
                </div>
              )) : <p className="sem-ordens">Nenhuma ordem de serviço encontrada para este status.</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TelaAgentesAmbientais;
