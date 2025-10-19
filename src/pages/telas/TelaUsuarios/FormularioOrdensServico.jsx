import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './FormularioOrdensServico.css';
import { FaCamera, FaCheckCircle } from 'react-icons/fa';

const FormularioOrdensServico = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    id_ref_tipo_servico: '',
    id_equipamento_tipo: '', 
    url_foto: '',
    mensagem: ''
  });

  const [tiposServico, setTiposServico] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [userId, setUserId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingOrdens, setLoadingOrdens] = useState(true);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Buscar tipos e usuário
  useEffect(() => {
    const buscarTiposServico = async () => {
      const { data, error } = await supabase
        .from('tipos_servicos')
        .select('id_ref_tipo_servico, tipo_servico')
        .order('tipo_servico', { ascending: true });

      if (error) console.error('Erro ao buscar tipos de serviço:', error);
      else setTiposServico(data || []);
    };

    const buscarTiposEquipamento = async () => {
      const { data, error } = await supabase
        .from('equipamentos_tipos')
        .select('id_ref_equipamento_tipo, equipamento_tipo')
        .order('equipamento_tipo', { ascending: true });

      if (error) console.error('Erro ao buscar tipos de equipamento:', error);
      else setTiposEquipamento(data || []);
    };

    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };

    buscarTiposServico();
    buscarTiposEquipamento();
    buscarUsuarioAtual();
  }, []);

  // Buscar ordens do usuário
  const buscarOrdensServico = useCallback(async () => {
    if (!userId) return;
    setLoadingOrdens(true);

    const { data, error } = await supabase
      .from('ordens_servico')
      // CORREÇÃO: Usa o nome EXATO do ID da Ordem de Serviço: 'id_ref_ordem_servico'
      .select('id_ref_ordem_servico,descricao,data_criacao,url_foto,mensagem,tipos_servicos(tipo_servico),equipamentos_tipos(equipamento_tipo),status_da_os(status_os)')
      .eq('id_usuario', userId)
      .order('data_criacao', { ascending: false });

    if (error) console.error('Erro ao buscar ordens de serviço:', error);
    else setOrdens(data || []);

    setLoadingOrdens(false);
  }, [userId]);

  useEffect(() => {
    buscarOrdensServico();
  }, [buscarOrdensServico]);

  // Manipular campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagemErro('');
    setMensagemSucesso('');

    if (!formData.descricao.trim()) {
      setMensagemErro('Por favor, descreva o problema ou serviço necessário.');
      setLoading(false);
      return;
    }

    if (!formData.id_ref_tipo_servico) {
      setMensagemErro('Por favor, selecione o tipo de serviço.');
      setLoading(false);
      return;
    }

    if (!formData.id_equipamento_tipo) {
      setMensagemErro('Por favor, selecione o tipo de equipamento.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setMensagemErro('Erro de autenticação. Usuário não identificado.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .insert([
          {
            id_usuario: userId,
            descricao: formData.descricao,
            tipo_servico: parseInt(formData.id_ref_tipo_servico),
            // Nome da coluna no DB 'ordens_servico' para o FK do equipamento
            equipamento_tipo: parseInt(formData.id_equipamento_tipo), 
            url_foto: formData.url_foto || null,
            mensagem: formData.mensagem || null,
            status_os: 1 
          }
        ]);

      if (error) throw error;

      setMensagemSucesso('Ordem de serviço criada com sucesso!');
      setFormData({
        descricao: '',
        id_ref_tipo_servico: '',
        id_equipamento_tipo: '',
        url_foto: '',
        mensagem: ''
      });

      buscarOrdensServico();
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao criar ordem de serviço:', err);
      
      let errorMessage = `Erro ao criar ordem de serviço: ${err.message}`;
      if (err.code === '23503') { 
          errorMessage = 'Erro de Chave Estrangeira: O tipo de serviço ou equipamento selecionado não existe no banco de dados, ou a FK não foi configurada. Verifique suas FKs.';
      } else if (err.message.includes('Could not find')) {
          errorMessage = 'Erro de Conexão: Um nome de coluna ou Chave Estrangeira está incorreto no seu banco de dados.';
      }
      setMensagemErro(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="formulario-ordens-container">
      <div className="formulario-section">
        <h2>Nova Ordem de Serviço</h2>
        <p className="descricao-formulario">
          Preencha o formulário abaixo para solicitar um serviço. Nossa equipe entrará em contato em breve.
        </p>

        {mensagemSucesso && <div className="mensagem-sucesso"><FaCheckCircle /> {mensagemSucesso}</div>}
        {mensagemErro && <div className="mensagem-erro">{mensagemErro}</div>}

        <form onSubmit={handleSubmit} className="ordem-form">
          <div className="form-group">
            <label htmlFor="id_ref_tipo_servico">Tipo de Serviço *</label>
            <select
              id="id_ref_tipo_servico"
              name="id_ref_tipo_servico"
              value={formData.id_ref_tipo_servico}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o tipo de serviço</option>
              {tiposServico.map(tipo => (
                <option key={tipo.id_ref_tipo_servico} value={tipo.id_ref_tipo_servico}>
                  {tipo.tipo_servico}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="id_equipamento_tipo">Tipo de Equipamento *</label>
            <select
              id="id_equipamento_tipo"
              name="id_equipamento_tipo"
              value={formData.id_equipamento_tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o tipo de equipamento</option>
              {tiposEquipamento.map(tipo => (
                <option key={tipo.id_ref_equipamento_tipo} value={tipo.id_ref_equipamento_tipo}>
                  {tipo.equipamento_tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição do Problema/Serviço *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente o problema ou serviço necessário..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Observações Adicionais</label>
            <textarea
              id="mensagem"
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Informações adicionais que possam ajudar no atendimento..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="url_foto">URL da Foto (opcional)</label>
            <input
              type="url"
              id="url_foto"
              name="url_foto"
              value={formData.url_foto}
              onChange={handleChange}
              placeholder="https://exemplo.com/foto.jpg"
            />
            <small className="form-help">
              <FaCamera /> Você pode adicionar uma foto do problema para facilitar o diagnóstico
            </small>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Criar Ordem de Serviço'}
          </button>
        </form>
      </div>

      <div className="ordens-lista-section">
        <h2>Minhas Ordens de Serviço</h2>
        {loadingOrdens ? (
          <div className="loading-ordens">Carregando ordens...</div>
        ) : ordens.length === 0 ? (
          <p className="sem-ordens">Nenhuma ordem de serviço encontrada.</p>
        ) : (
          <div className="ordens-grid">
            {ordens.map(ordem => (
              // CORREÇÃO: Usa o nome EXATO do ID da Ordem de Serviço
              <div key={ordem.id_ref_ordem_servico} className="ordem-card">
                <div className="ordem-header">
                  <div className="ordem-info-linha">
                    <span className={`status-badge ${getStatusClass(ordem.status_da_os?.status_os)}`}>
                      {ordem.status_da_os?.status_os || 'Sem status'}
                    </span>
                    <span className="ordem-numero">
                      {/* CORREÇÃO: Usa o nome EXATO do ID da Ordem de Serviço */}
                      OS: {String(ordem.id_ref_ordem_servico).slice(0, 6)}
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
    </div>
  );
};

export default FormularioOrdensServico;