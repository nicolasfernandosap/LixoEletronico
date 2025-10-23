import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient'; // Ajuste o caminho conforme necessário
import './TelaAgentesAmbientais.css';
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChevronRight,
  FaEye,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapPin,
  FaCog, // Ícone de Configuração
  FaTruck, // Ícone de Rastreamento Motorista
  FaRecycle, // Ícone de Doação de Equipamento
  FaPlusCircle, // Ícone para Tarefa OS
  FaBars, // Ícone para menu mobile/toggle
  FaBell // Ícone para Solicitações Recebidas
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- Componente de Tela Detalhada do Cliente (Visualização) ---
const TelaClienteDetalhes = ({ cliente, onVoltar }) => {
  if (!cliente) return null;

  return (
    <div className="tela-cliente-detalhes-visualizacao">
      <div className="cliente-header-visualizacao">
        <div className="cliente-header-top-visualizacao">
          <div className="cliente-avatar-grande-visualizacao">{cliente.nome_completo.charAt(0)}</div>
          <div className="cliente-header-info-visualizacao">
            <h1>{cliente.nome_completo}</h1>
            <div className="cliente-header-meta-visualizacao">
              <span className="meta-item-visualizacao"><FaPhone /> {cliente.telefone || 'Não informado'}</span>
              <span className="meta-item-visualizacao"><FaEnvelope /> {cliente.email || 'Não informado'}</span>
              <span className="meta-item-visualizacao">CPF: {cliente.cpf || 'Não informado'}</span>
              {cliente.mie && <span className="meta-item-visualizacao"><FaMapPin /> {cliente.mie}</span>}
            </div>
          </div>
          <button className="btn-voltar-visualizacao" onClick={onVoltar}>
            <FaTimes /> Fechar
          </button>
        </div>
      </div>

      <div className="cliente-content-visualizacao">
        <div className="cliente-main-visualizacao">
          <div className="info-section-visualizacao">
            <div className="info-card-visualizacao">
              <h3>Endereço de Instalação</h3>
              <p>{`${cliente.endereco || ''}, ${cliente.numero_casa || ''}`}</p>
              <p>{`${cliente.bairro || ''}, ${cliente.cidade || ''} - ${cliente.estado || ''}`}</p>
              <p>CEP: {cliente.cep || ''}</p>
            </div>
            {/* Adicionar visualização de foto do usuário se disponível no objeto cliente */}
            {cliente.foto_url && (
              <div className="info-card-visualizacao">
                <h3>Foto do Usuário</h3>
                <img src={cliente.foto_url} alt="Foto do Cliente" className="cliente-foto-visualizacao" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente para a Aba de Solicitações Recebidas ---
const AbaSolicitacoesRecebidas = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteDetalhesAberto, setClienteDetalhesAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const fetchSolicitacoes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico,
        numero_os,
        tipos_servicos (tipo_servico),
        usuarios (nome_completo, cpf, telefone, email, endereco, numero_casa, bairro, cidade, estado, cep, foto_url, mie)
      `)
      // .eq('status_da_os.status_os', 'Aguardando Análise'); // Removido o filtro para mostrar todas as solicitações (sino)

    if (error) {
      console.error('Erro ao buscar solicitações:', error);
    } else {
      setSolicitacoes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const handleVisualizarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClienteDetalhesAberto(true);
  };

  if (clienteDetalhesAberto && clienteSelecionado) {
    return <TelaClienteDetalhes cliente={clienteSelecionado} onVoltar={() => setClienteDetalhesAberto(false)} />;
  }

  return (
    <div className="aba-solicitacoes-recebidas">
      <h1>Solicitações Recebidas</h1>
      {loading ? (
        <div className="loading-spinner"></div>
      ) : solicitacoes.length > 0 ? (
        <div className="solicitacoes-lista">
          {solicitacoes.map(solicitacao => (
            <div key={solicitacao.id_ref_ordem_servico} className="solicitacao-card-recebida">
              <div className="solicitacao-info-recebida">
                <h4>{solicitacao.usuarios?.nome_completo}</h4>
                <p>CPF: {solicitacao.usuarios?.cpf || 'Não informado'}</p>
                <p>Serviço: {solicitacao.tipos_servicos?.tipo_servico || 'Não informado'}</p>
              </div>
              <button
                className="btn-visualizar-cliente"
                title="Visualizar Detalhes do Cliente"
                onClick={() => handleVisualizarCliente(solicitacao.usuarios)}
              >
                <FaEye />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="sem-solicitacoes">Nenhuma solicitação recebida no momento.</p>
      )}
    </div>
  );
};

// --- Componente para a Aba de Configurações ---
const AbaConfiguracoes = () => {
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMensagem('');
    if (novaSenha !== confirmarNovaSenha) {
      setMensagem('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setMensagem('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        setMensagem(`Erro ao trocar senha: ${error.message}`);
      } else {
        setMensagem('Senha alterada com sucesso!');
        setSenhaAntiga('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      }
    } catch (err) {
      setMensagem(`Erro inesperado: ${err.message}`);
    }
  };

  return (
    <div className="aba-configuracoes">
      <h1>Configurações</h1>

      <div className="config-section">
        <h2>Trocar Senha</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="senhaAntiga">Senha Antiga:</label>
            <input
              type="password"
              id="senhaAntiga"
              value={senhaAntiga}
              onChange={(e) => setSenhaAntiga(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha:</label>
            <input
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha:</label>
            <input
              type="password"
              id="confirmarNovaSenha"
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Trocar Senha</button>
          {mensagem && <p className="mensagem-status">{mensagem}</p>}
        </form>
      </div>

      <div className="config-section">
        <h2>Dados Pessoais do Agente</h2>
        <p>Funcionalidade para editar dados pessoais do agente (nome, email, etc.) a ser implementada.</p>
        {/* Aqui você pode adicionar um formulário para editar os dados do agente */}
      </div>
    </div>
  );
};

// --- Componente para a Aba de Clientes (existente) ---
const AbaClientes = ({ clientes }) => {
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [telaDetalhada, setTelaDetalhada] = useState(false);

  const handleVisualizarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setTelaDetalhada(true);
  };

  if (telaDetalhada && clienteSelecionado) {
    return <TelaClienteDetalhes cliente={clienteSelecionado} onVoltar={() => setTelaDetalhada(false)} />;
  }

  return (
    <div className="aba-clientes">
      <h1>Clientes Cadastrados</h1>
      <div className="clientes-lista">
        {clientes.map(cliente => (
          <div key={cliente.id_usuario} className="cliente-card-agente">
            <div className="cliente-avatar-agente">{cliente.nome_completo.charAt(0)}</div>
            <div className="cliente-info-agente">
              <h4>{cliente.nome_completo}</h4>
              <p>{cliente.email}</p>
            </div>
            <button className="view-btn-agente" title="Visualizar Cadastro" onClick={() => handleVisualizarCliente(cliente)}>
              <FaEye />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Componente para a Aba de Tarefa OS ---
const AbaTarefaOS = ({ tiposServico, statusList, onCriarOrdemServico }) => {
  const [cpfCliente, setCpfCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [tipoServicoSelecionado, setTipoServicoSelecionado] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [dataAgendada, setDataAgendada] = useState('');
  const [descricaoCancelamento, setDescricaoCancelamento] = useState('');
  const [motoristaDestino, setMotoristaDestino] = useState(''); // Novo estado para o motorista
  const [mensagem, setMensagem] = useState('');

  const handleBuscarCliente = async () => {
    if (!cpfCliente) {
      setMensagem('Por favor, digite um CPF para buscar.');
      setClienteEncontrado(null);
      return;
    }
    const { data, error } = await supabase.from('usuarios').select('*').eq('cpf', cpfCliente).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 é quando nenhum registro é encontrado
      console.error('Erro ao buscar cliente:', error);
      setMensagem('Erro ao buscar cliente. Tente novamente.');
      setClienteEncontrado(null);
    } else if (data) {
      setClienteEncontrado(data);
      setMensagem('');
    } else {
      setClienteEncontrado(null);
      setMensagem('Cliente não encontrado com o CPF informado.');
    }
  };

  const handleSubmitOS = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!clienteEncontrado) {
      setMensagem('Selecione um cliente válido.');
      return;
    }
    if (!tipoServicoSelecionado) {
      setMensagem('Selecione o tipo de serviço.');
      return;
    }
    if (!statusSelecionado) {
      setMensagem('Selecione o fluxo (status) da OS.');
      return;
    }
    const novoStatusObj = statusList.find(s => s.id_status_os === statusSelecionado); // Encontrar o objeto status

    if (novoStatusObj?.status_os === 'Cancelado' && !descricaoCancelamento) { // Supondo 'Cancelado' como o nome do status
      setMensagem('Descreva o motivo do cancelamento.');
      return;
    }
    if (novoStatusObj?.status_os === 'Encaminhado ao Motorista' && !motoristaDestino) { // Adicionado validação para motorista
      setMensagem('Selecione um motorista para destinar a OS.');
      return;
    }

    const novaOS = {
      id_usuario: clienteEncontrado.id_usuario,
      id_tipo_servico: tipoServicoSelecionado, // ID do tipo de serviço
      id_status_os: statusSelecionado, // ID do status
      data_agendada: (novoStatusObj?.status_os === 'Agendado' && dataAgendada) ? dataAgendada : null,
      descricao_cancelamento: novoStatusObj?.status_os === 'Cancelado' ? descricaoCancelamento : null,
      id_motorista: (novoStatusObj?.status_os === 'Encaminhado ao Motorista' && motoristaDestino) ? motoristaDestino : null,
      // Outros campos da OS conforme seu banco de dados
    };

    onCriarOrdemServico(novaOS);

    // Resetar formulário
    setCpfCliente('');
    setClienteEncontrado(null);
    setTipoServicoSelecionado('');
    setStatusSelecionado('');
    setDataAgendada('');
    setDescricaoCancelamento('');
    setMotoristaDestino('');
    setMensagem('Ordem de serviço criada com sucesso!');
  };

  const statusFluxo = statusList.filter(s => s.status_os === 'Encaminhado ao Motorista' || s.status_os === 'Cancelado' || s.status_os === 'Agendado'); // Exemplos de status de fluxo
  const motoristas = [
    { id: 'motorista_1', nome: 'Francis Medel' }, // Exemplo de motorista
    { id: 'motorista_2', nome: 'João Silva' },
    { id: 'motorista_3', nome: 'Maria Oliveira' },
  ];

  return (
    <div className="aba-tarefa-os">
      <h1>Gerar Ordem de Serviço</h1>
      <form onSubmit={handleSubmitOS}>
        <div className="form-group">
          <label htmlFor="cpfCliente">CPF do Cliente:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              id="cpfCliente"
              value={cpfCliente}
              onChange={(e) => setCpfCliente(e.target.value)}
              placeholder="Digite o CPF do cliente"
              required
            />
            <button type="button" onClick={handleBuscarCliente} className="btn-secondary">Buscar Cliente</button>
          </div>
        </div>

        {mensagem && <p className="mensagem-status">{mensagem}</p>}

        {clienteEncontrado && (
          <div className="cliente-info-os-form">
            <h3>Cliente: {clienteEncontrado.nome_completo}</h3>
            <p>Email: {clienteEncontrado.email}</p>
            <p>Telefone: {clienteEncontrado.telefone}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tipoServico">Tipo de Serviço:</label>
          <select
            id="tipoServico"
            value={tipoServicoSelecionado}
            onChange={(e) => setTipoServicoSelecionado(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {tiposServico.map(tipo => (
              <option key={tipo.id_tipo_servico} value={tipo.id_tipo_servico}>{tipo.tipo_servico}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="statusFluxo">Fluxo da OS:</label>
          <select
            id="statusFluxo"
            value={statusSelecionado}
            onChange={(e) => setStatusSelecionado(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {statusFluxo.map(status => (
              <option key={status.id_status_os} value={status.id_status_os}>{status.status_os}</option>
            ))}
          </select>
        </div>

        {statusList.find(s => s.id_status_os === statusSelecionado)?.status_os === 'Agendado' && (
          <div className="form-group">
            <label htmlFor="dataAgendada">Dia da OS Agendada:</label>
            <input
              type="date"
              id="dataAgendada"
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              required
            />
          </div>
        )}

        {statusList.find(s => s.id_status_os === statusSelecionado)?.status_os === 'Cancelado' && (
          <div className="form-group">
            <label htmlFor="descricaoCancelamento">Descrição do Cancelamento:</label>
            <textarea
              id="descricaoCancelamento"
              value={descricaoCancelamento}
              onChange={(e) => setDescricaoCancelamento(e.target.value)}
              rows="3"
              required
            ></textarea>
          </div>
        )}

        {statusList.find(s => s.id_status_os === statusSelecionado)?.status_os === 'Encaminhado ao Motorista' && (
          <div className="form-group">
            <label htmlFor="motoristaDestino">Nome do Motorista Destino:</label>
            <select
              id="motoristaDestino"
              value={motoristaDestino}
              onChange={(e) => setMotoristaDestino(e.target.value)}
              required
            >
              <option value="">Selecione o motorista...</option>
              {motoristas.map(motorista => (
                <option key={motorista.id} value={motorista.id}>{motorista.nome}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn-primary">Gerar Ordem de Serviço</button>
      </form>
    </div>
  );
};

// --- Componente para a Aba de Rastreamento Motorista ---
const AbaRastreamentoMotorista = () => {
  const [ordensMotorista, setOrdensMotorista] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdensMotorista = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico,
        numero_os,
        data_agendada,
        status_da_os (status_os),
        motoristas (nome_completo) // Supondo que você tenha uma tabela 'motoristas' e um relacionamento
      `)
      .eq('status_da_os.status_os', 'Encaminhado ao Motorista'); // Ajuste para buscar pelo nome do status

    if (error) {
      console.error('Erro ao buscar ordens do motorista:', error);
    } else {
      setOrdensMotorista(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrdensMotorista();
  }, [fetchOrdensMotorista]);

  return (
    <div className="aba-rastreamento-motorista">
      <h1>Rastreamento de Motoristas</h1>
      {loading ? (
        <div className="loading-spinner"></div>
      ) : ordensMotorista.length > 0 ? (
        <div className="ordens-motorista-lista">
          {ordensMotorista.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-motorista-card">
              <h3>OS: {String(ordem.numero_os || ordem.id_ref_ordem_servico).padStart(4, '0')}</h3>
              <p>Motorista: {ordem.motoristas?.nome_completo || 'Não atribuído'}</p>
              <p>Dia Agendado: {ordem.data_agendada ? new Date(ordem.data_agendada).toLocaleDateString() : 'Não agendado'}</p>
              <p>Status: <span className={`status-badge ${ordem.status_da_os?.status_os.toLowerCase().replace(/\s/g, '-')}`}>{ordem.status_da_os?.status_os || 'Desconhecido'}</span></p>
              {/* Adicionar lógica para atualização de status pelo motorista, se aplicável */}
            </div>
          ))}
        </div>
      ) : (
        <p className="sem-ordens-motorista">Nenhuma OS encaminhada para motoristas no momento.</p>
      )}
    </div>
  );
};

// --- Componente para a Aba de Doação de Equipamento ---
const AbaDoacaoEquipamento = () => {
  const [ordensDoacao, setOrdensDoacao] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdensDoacao = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ref_ordem_servico,
        numero_os,
        data_criacao,
        tipos_servicos (tipo_servico),
        usuarios (nome_completo)
      `)
      .eq('tipos_servicos.tipo_servico', 'Doação de Equipamentos'); // Filtra apenas ordens de doação (Corrigido para plural)

    if (error) {
      console.error('Erro ao buscar ordens de doação:', error);
    } else {
      setOrdensDoacao(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrdensDoacao();
  }, [fetchOrdensDoacao]);

  return (
    <div className="aba-doacao-equipamento">
      <h1>Ordens de Doação de Equipamento</h1>
      {loading ? (
        <div className="loading-spinner"></div>
      ) : ordensDoacao.length > 0 ? (
        <div className="ordens-doacao-lista">
          {ordensDoacao.map(ordem => (
            <div key={ordem.id_ref_ordem_servico} className="ordem-doacao-card">
              <h3>OS: {String(ordem.numero_os || ordem.id_ref_ordem_servico).padStart(4, '0')}</h3>
              <p>Cliente: {ordem.usuarios?.nome_completo || 'Desconhecido'}</p>
              <p>Tipo de Serviço: {ordem.tipos_servicos?.tipo_servico || 'Doação de Equipamento'}</p>
              <p>Data da Solicitação: {new Date(ordem.data_criacao).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="sem-ordens-doacao">Nenhuma ordem de doação de equipamento encontrada.</p>
      )}
    </div>
  );
};

// --- Componentes AbaInicio e AbaSolicitacoes (existente, mas AbaSolicitacoes será ajustada) ---
const AbaInicio = ({ ordens }) => {
  const totalOrdens = ordens.length;
  const pendentes = ordens.filter(o => o.status_da_os?.status_os === 'Aguardando Análise').length;
  const emAtendimento = ordens.filter(o => o.status_da_os?.status_os === 'Em Atendimento').length;
  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats-grid"><div className="stat-card"><h3>{totalOrdens}</h3><p>Ordens Totais</p></div><div className="stat-card"><h3>{pendentes}</h3><p>Aguardando Análise</p></div><div className="stat-card"><h3>{emAtendimento}</h3><p>Em Atendimento</p></div></div>
      <div className="welcome-card"><h2>Bem-vindo ao Painel Administrativo</h2><p>Use o menu à esquerda para navegar entre as solicitações e gerenciar clientes.</p></div>
    </>
  );
};

const AbaSolicitacoes = ({ ordens, statusList, onStatusChange }) => {
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const todasOrdens = ordens;
  const handleSelectChange = (e) => { const novoStatusId = e.target.value; if (novoStatusId && selectedOrdem) { onStatusChange(selectedOrdem.id_ref_ordem_servico, novoStatusId); setSelectedOrdem(null); } };
  return (
    <div className="solicitacoes-layout">
      <div className="lista-solicitacoes">
        <div className="lista-header"><h3>Todas as Solicitações</h3><p>{todasOrdens.length} no total</p></div>
        {todasOrdens.length > 0 ? todasOrdens.map(ordem => (
          <div key={ordem.id_ref_ordem_servico} className={`solicitacao-card ${selectedOrdem?.id_ref_ordem_servico === ordem.id_ref_ordem_servico ? 'active' : ''}`} onClick={() => setSelectedOrdem(ordem)}>
            <div className="solicitacao-card-info"><span className="solicitacao-os-number">OS: {String(ordem.numero_os || ordem.id_ref_ordem_servico).padStart(4, '0')}</span><span className="solicitacao-cliente-nome">{ordem.usuarios?.nome_completo}</span></div>
            <FaChevronRight />
          </div>
        )) : <p className="sem-ordens-lista">Nenhuma solicitação encontrada.</p>}
      </div>
      <div className="detalhe-solicitacao">
        {selectedOrdem ? (
          <div className="detalhe-card">
            <div className="detalhe-header"><h2>OS: {String(selectedOrdem.numero_os || selectedOrdem.id_ref_ordem_servico).padStart(4, '0')}</h2><span className="detalhe-status">{selectedOrdem.status_da_os.status_os}</span></div>
            <div className="detalhe-bloco"><h4><FaUser /> Cliente</h4><p><strong>Nome:</strong> {selectedOrdem.usuarios?.nome_completo}</p><p><strong>Email:</strong> {selectedOrdem.usuarios?.email}</p></div>
            <div className="detalhe-bloco"><h4><FaMapMarkerAlt /> Endereço</h4><p>{`${selectedOrdem.usuarios?.endereco || ''}, ${selectedOrdem.usuarios?.numero_casa || ''}`}</p><p>{`${selectedOrdem.usuarios?.bairro || '', selectedOrdem.usuarios?.cidade || ''}`}</p></div>
            <hr/>
            <h4>Detalhes do Serviço</h4><p><strong>Tipo:</strong> {selectedOrdem.tipos_servicos?.tipo_servico}</p><p><strong>Equipamento:</strong> {selectedOrdem.equipamentos_tipos?.equipamento_tipo}</p><p><strong>Descrição:</strong> {selectedOrdem.descricao}</p>
            <hr/>
            <div className="detalhe-acao"><label>Alterar Status:</label><select onChange={handleSelectChange} value=""><option value="" disabled>Selecione um novo status...</option>{statusList.map(s => <option key={s.id_ref_status_os} value={s.id_ref_status_os}>{s.status_os}</option>)}</select></div>
          </div>
        ) : <div className="detalhe-placeholder">Selecione uma solicitação à esquerda para ver os detalhes.</div>}
      </div>
    </div>
  );
};

// --- Componente Principal com Sidebar e Top Menu ---
const TelaAgentesAmbientais = () => {
  const [agenteNome] = useState('Agente Ambiental'); // Pode ser buscado do Supabase
  const [aba, setAba] = useState('inicio');
  const [loading, setLoading] = useState(true);
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [tiposServico, setTiposServico] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para menu mobile
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: ordensData, error: ordensError } = await supabase.from('ordens_servico').select(`
      id_ref_ordem_servico,
      numero_os,
      data_criacao,
      descricao,
      status_da_os (id_status_os, status_os),
      tipos_servicos (id_tipo_servico, tipo_servico),
      equipamentos_tipos (equipamento_tipo),
      usuarios (id_usuario, nome_completo, cpf, email, telefone, endereco, numero_casa, bairro, cidade, estado, cep, foto_url, mie)
    `).order('data_criacao', { ascending: false });

    const { data: clientesData, error: clientesError } = await supabase.from('usuarios').select('*');
    const { data: statusData, error: statusError } = await supabase.from('status_da_os').select('*');
    const { data: tiposServicoData, error: tiposServicoError } = await supabase.from('tipos_servicos').select('*');

    if (ordensError) console.error('Erro ao buscar ordens:', ordensError);
    if (clientesError) console.error('Erro ao buscar clientes:', clientesError);
    if (statusError) console.error('Erro ao buscar status:', statusError);
    if (tiposServicoError) console.error('Erro ao buscar tipos de serviço:', tiposServicoError);
    
    setOrdens(ordensData || []);
    setClientes(clientesData || []);
    setStatusList(statusData || []);
    setTiposServico(tiposServicoData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (ordemId, novoStatusId) => {
    const { error } = await supabase.from('ordens_servico').update({ id_status_os: novoStatusId }).eq('id_ref_ordem_servico', ordemId);
    if (error) console.error('Erro ao atualizar status:', error);
    else fetchData();
  };

  const handleCriarOrdemServico = async (novaOS) => {
    const { error } = await supabase.from('ordens_servico').insert([novaOS]);
    if (error) console.error('Erro ao criar ordem de serviço:', error);
    else fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner"></div>;
    switch (aba) {
      case 'inicio': return <AbaInicio ordens={ordens} />;
      case 'solicitacoes': return <AbaSolicitacoes ordens={ordens} statusList={statusList} onStatusChange={handleStatusChange} />;
      case 'clientes': return <AbaClientes clientes={clientes} />;
      case 'solicitacoes-recebidas': return <AbaSolicitacoesRecebidas />;
      case 'configuracoes': return <AbaConfiguracoes />;
      case 'tarefa-os': return <AbaTarefaOS tiposServico={tiposServico} statusList={statusList} onCriarOrdemServico={handleCriarOrdemServico} />;
      case 'rastreamento-motorista': return <AbaRastreamentoMotorista />;
      case 'doacao-equipamento': return <AbaDoacaoEquipamento />;
      default: return <h1>Página não encontrada</h1>;
    }
  };

  return (
    <div className="agente-dashboard-wrapper">
      {/* Top Menu */}
      <header className="agente-topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
          <span className="topbar-title">Painel do Agente Ambiental</span>
        </div>
        <nav className="topbar-menu">
          <ul>
            <li onClick={() => setAba('solicitacoes-recebidas')} className={aba === 'solicitacoes-recebidas' ? 'active' : ''}>
              <FaBell /><span>Solicitações Recebidas</span>
            </li>
            <li onClick={() => setAba('configuracoes')} className={aba === 'configuracoes' ? 'active' : ''}>
              <FaCog /><span>Configurações</span>
            </li>
            <li onClick={handleLogout} className="logout-item">
              <FaSignOutAlt /><span>Sair</span>
            </li>
          </ul>
        </nav>
      </header>

      <aside className={`agente-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header"><div className="sidebar-logo">L</div><span>Lixo Eletrônico</span></div>
          <nav className="sidebar-menu">
            <ul>
              <li onClick={() => setAba('inicio')} className={aba === 'inicio' ? 'active' : ''}><FaHome /><span>Início</span></li>
              <li onClick={() => setAba('solicitacoes')} className={aba === 'solicitacoes' ? 'active' : ''}><FaClipboardList /><span>Solicitações</span></li>
              <li onClick={() => setAba('clientes')} className={aba === 'clientes' ? 'active' : ''}><FaUsers /><span>Clientes</span></li>
              <li onClick={() => setAba('tarefa-os')} className={aba === 'tarefa-os' ? 'active' : ''}><FaPlusCircle /><span>Tarefa OS</span></li>
              <li onClick={() => setAba('rastreamento-motorista')} className={aba === 'rastreamento-motorista' ? 'active' : ''}><FaTruck /><span>Rastreamento Motorista</span></li>
              <li onClick={() => setAba('doacao-equipamento')} className={aba === 'doacao-equipamento' ? 'active' : ''}><FaRecycle /><span>Doação Equipamento</span></li>
            </ul>
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user-info"><div className="sidebar-avatar">{agenteNome.charAt(0)}</div><span>{agenteNome}</span></div>
        </div>
      </aside>
      <main className="agente-content-area">{renderContent()}</main>
    </div>
  );
};

export default TelaAgentesAmbientais;