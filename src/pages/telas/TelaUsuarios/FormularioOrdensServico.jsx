import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './FormularioOrdensServico.css';
import { FaCamera, FaTrash, FaCheckCircle } from 'react-icons/fa';

const FormularioOrdensServico = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    id_tipo_servico: '',
    url_foto: '',
    mensagem: ''
  });
  
  const [tiposServico, setTiposServico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [userId, setUserId] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [loadingOrdens, setLoadingOrdens] = useState(true);

  // Buscar tipos de serviço disponíveis
  useEffect(() => {
    const buscarTiposServico = async () => {
      const { data: tiposData, error } = await supabase
        .from('tipos_servico')
        .select('id_tipo, nome_tipo')
        .neq('nome_tipo', 'Doação de Equipamentos');
      
      if (error) {
        console.error('Erro ao buscar tipos de serviço:', error);
      } else {
        setTiposServico(tiposData || []);
      }
    };

    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    buscarTiposServico();
    buscarUsuarioAtual();
  }, []);

  // Função memoizada para buscar ordens de serviço do usuário
  const buscarOrdensServico = useCallback(async () => {
    if (!userId) return;
    setLoadingOrdens(true);
    const { data: ordensData, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ordem,
        descricao,
        data_criacao,
        data_conclusao,
        id_status,
        mensagem,
        tipos_servico (nome_tipo),
        status_ordem (descricao_status)
      `)
      .eq('id_usuario', userId)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
    } else {
      setOrdens(ordensData || []);
    }
    setLoadingOrdens(false);
  }, [userId]);

  // Buscar ordens de serviço do usuário quando userId muda
  useEffect(() => {
    buscarOrdensServico();
  }, [buscarOrdensServico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

    if (!formData.id_tipo_servico) {
      setMensagemErro('Por favor, selecione o tipo de serviço.');
      setLoading(false);
      return;
    }
    
    if (!userId) {
      setMensagemErro('Erro de autenticação. Usuário não identificado.');
      setLoading(false);
      return;
    }

    try {
      const { data: insertedData, error } = await supabase
        .from('ordens_servico')
        .insert([
          {
            id_usuario: userId,
            descricao: formData.descricao,
            id_tipo_servico: parseInt(formData.id_tipo_servico),
            url_foto: formData.url_foto || null,
            mensagem: formData.mensagem || null,
            id_status: 1 // Status inicial: Aguardando Análise
          }
        ])
        .select(); // Adicionar .select() para garantir que os dados inseridos sejam retornados

      if (error) throw error;

      // Verificação opcional para garantir que a inserção retornou dados
      if (!insertedData || insertedData.length === 0) {
        console.warn('Supabase insert did not return data. Assuming success.');
      }

      setMensagemSucesso('Ordem de serviço criada com sucesso!');
      
      setFormData({
        descricao: '',
        id_tipo_servico: '',
        url_foto: '',
        mensagem: ''
      });

      buscarOrdensServico();

      setTimeout(() => {
        setMensagemSucesso('');
      }, 5000);

    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
      setMensagemErro(`Erro ao criar ordem de serviço: ${error.message}`);
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
      'Finalizado': 'status-concluido',
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

        {mensagemSucesso && (
          <div className="mensagem-sucesso">
            <FaCheckCircle /> {mensagemSucesso}
          </div>
        )}

        {mensagemErro && (
          <div className="mensagem-erro">
            {mensagemErro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ordem-form">
          <div className="form-group">
            <label htmlFor="id_tipo_servico">Tipo de Serviço *</label>
            <select
              id="id_tipo_servico"
              name="id_tipo_servico"
              value={formData.id_tipo_servico}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o tipo de serviço</option>
              {tiposServico.map(tipo => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nome_tipo}
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
              <div key={ordem.id_ordem} className="ordem-card">
                <div className="ordem-header">
                  <span className={`status-badge ${getStatusClass(ordem.status_ordem?.descricao_status)}`}>
                    {ordem.status_ordem?.descricao_status || 'Sem status'}
                  </span>
                  <span className="ordem-tipo">
                    {ordem.tipos_servico?.nome_tipo || 'Tipo não definido'}
                  </span>
                </div>
                
                <div className="ordem-body">
                  <p className="ordem-descricao">{ordem.descricao}</p>
                  {ordem.mensagem && (
                    <p className="ordem-mensagem">
                      <strong>Observações:</strong> {ordem.mensagem}
                    </p>
                  )}
                </div>
                
                <div className="ordem-footer">
                  <small>Criado em: {formatarData(ordem.data_criacao)}</small>
                  {ordem.data_conclusao && (
                    <small>Concluído em: {formatarData(ordem.data_conclusao)}</small>
                  )}
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
