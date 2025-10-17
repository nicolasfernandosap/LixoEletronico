import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import './FormularioDoacaoEquipamento.css';
import { FaHeart, FaCheckCircle, FaLaptop, FaMobileAlt, FaTv, FaKeyboard } from 'react-icons/fa';

const FormularioDoacaoEquipamento = () => {
  const [formData, setFormData] = useState({
    tipo_equipamento: '',
    marca: '',
    modelo: '',
    estado_conservacao: '',
    descricao: '',
    quantidade: 1,
    url_foto: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [userId, setUserId] = useState(null);
  const [doacoes, setDoacoes] = useState([]);
  const [loadingDoacoes, setLoadingDoacoes] = useState(true);

  const tiposEquipamento = [
    { valor: 'notebook', label: 'Notebook/Laptop', icone: <FaLaptop /> },
    { valor: 'desktop', label: 'Computador Desktop', icone: <FaLaptop /> },
    { valor: 'monitor', label: 'Monitor', icone: <FaTv /> },
    { valor: 'celular', label: 'Celular/Smartphone', icone: <FaMobileAlt /> },
    { valor: 'tablet', label: 'Tablet', icone: <FaMobileAlt /> },
    { valor: 'teclado', label: 'Teclado', icone: <FaKeyboard /> },
    { valor: 'mouse', label: 'Mouse', icone: <FaKeyboard /> },
    { valor: 'impressora', label: 'Impressora', icone: <FaLaptop /> },
    { valor: 'outros', label: 'Outros', icone: <FaLaptop /> }
  ];

  const estadosConservacao = [
    { valor: 'excelente', label: 'Excelente - Funcionando perfeitamente' },
    { valor: 'bom', label: 'Bom - Pequenos sinais de uso' },
    { valor: 'regular', label: 'Regular - Funciona mas precisa de reparos' },
    { valor: 'ruim', label: 'Ruim - Não funciona, apenas para peças' }
  ];

  useEffect(() => {
    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    buscarUsuarioAtual();
  }, []);

  useEffect(() => {
    if (userId) {
      buscarDoacoes();
    }
  }, [userId]);

  const buscarDoacoes = async () => {
    setLoadingDoacoes(true);
    // Nota: Esta query pressupõe que você criará uma tabela 'doacoes_equipamentos'
    // Por enquanto, vamos simular com ordens_servico filtradas por tipo
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        id_ordem,
        descricao,
        data_criacao,
        mensagem,
        tipos_servico (nome_tipo)
      `)
      .eq('id_usuario', userId)
      .eq('id_tipo_servico', 4) // Tipo 4 = Doação de Equipamentos
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar doações:', error);
    } else {
      setDoacoes(data || []);
    }
    setLoadingDoacoes(false);
  };

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

    // Validações básicas
    if (!formData.tipo_equipamento) {
      setMensagemErro('Por favor, selecione o tipo de equipamento.');
      setLoading(false);
      return;
    }

    if (!formData.estado_conservacao) {
      setMensagemErro('Por favor, informe o estado de conservação do equipamento.');
      setLoading(false);
      return;
    }

    try {
      // Criar descrição detalhada para a ordem de serviço
      const descricaoCompleta = `
DOAÇÃO DE EQUIPAMENTO
Tipo: ${tiposEquipamento.find(t => t.valor === formData.tipo_equipamento)?.label || formData.tipo_equipamento}
Marca: ${formData.marca || 'Não informada'}
Modelo: ${formData.modelo || 'Não informado'}
Estado: ${estadosConservacao.find(e => e.valor === formData.estado_conservacao)?.label || formData.estado_conservacao}
Quantidade: ${formData.quantidade}
${formData.descricao ? `\nDescrição adicional: ${formData.descricao}` : ''}
      `.trim();

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert([
          {
            id_usuario: userId,
            descricao: descricaoCompleta,
            id_tipo_servico: 4, // Tipo 4 = Doação de Equipamentos
            url_foto: formData.url_foto || null,
            mensagem: `Doação: ${formData.tipo_equipamento} - ${formData.estado_conservacao}`,
            id_status: 1 // Status inicial: Pendente
          }
        ]);

      if (error) throw error;

      setMensagemSucesso('Doação registrada com sucesso! Nossa equipe entrará em contato para agendar a coleta.');
      
      // Limpar formulário
      setFormData({
        tipo_equipamento: '',
        marca: '',
        modelo: '',
        estado_conservacao: '',
        descricao: '',
        quantidade: 1,
        url_foto: ''
      });

      // Atualizar lista de doações
      buscarDoacoes();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setMensagemSucesso('');
      }, 5000);

    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      setMensagemErro('Erro ao registrar doação. Tente novamente.');
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

  return (
    <div className="formulario-doacao-container">
      <div className="doacao-header">
        <FaHeart className="doacao-icon" />
        <div className="doacao-header-text">
          <h2>Doe seus Equipamentos Eletrônicos</h2>
          <p>Ajude o meio ambiente e pessoas que precisam. Seus equipamentos podem ter uma segunda vida!</p>
        </div>
      </div>

      <div className="formulario-section">
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

        <form onSubmit={handleSubmit} className="doacao-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_equipamento">Tipo de Equipamento *</label>
              <select
                id="tipo_equipamento"
                name="tipo_equipamento"
                value={formData.tipo_equipamento}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o tipo</option>
                {tiposEquipamento.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marca">Marca</label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ex: Dell, Samsung, HP..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo</label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ex: Inspiron 15, Galaxy S20..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado_conservacao">Estado de Conservação *</label>
            <select
              id="estado_conservacao"
              name="estado_conservacao"
              value={formData.estado_conservacao}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o estado</option>
              {estadosConservacao.map(estado => (
                <option key={estado.valor} value={estado.valor}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição Adicional</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o equipamento, acessórios inclusos, etc..."
              rows="4"
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
              Adicione fotos do equipamento para facilitar a avaliação
            </small>
          </div>

          <button type="submit" className="btn-submit-doacao" disabled={loading}>
            <FaHeart /> {loading ? 'Enviando...' : 'Registrar Doação'}
          </button>
        </form>
      </div>

      <div className="doacoes-lista-section">
        <h2>Minhas Doações</h2>
        
        {loadingDoacoes ? (
          <div className="loading-doacoes">Carregando doações...</div>
        ) : doacoes.length === 0 ? (
          <p className="sem-doacoes">Você ainda não registrou nenhuma doação.</p>
        ) : (
          <div className="doacoes-grid">
            {doacoes.map(doacao => (
              <div key={doacao.id_ordem} className="doacao-card">
                <div className="doacao-card-header">
                  <FaHeart className="doacao-card-icon" />
                  <span className="doacao-badge">Doação Registrada</span>
                </div>
                
                <div className="doacao-card-body">
                  <p className="doacao-descricao">{doacao.descricao}</p>
                  {doacao.mensagem && (
                    <p className="doacao-mensagem">
                      <strong>Detalhes:</strong> {doacao.mensagem}
                    </p>
                  )}
                </div>
                
                <div className="doacao-card-footer">
                  <small>Registrado em: {formatarData(doacao.data_criacao)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-doacao-section">
        <h3>Como funciona a doação?</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Registre sua doação</h4>
              <p>Preencha o formulário com as informações do equipamento que deseja doar.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Aguarde o contato</h4>
              <p>Nossa equipe entrará em contato para agendar a coleta ou informar o ponto de entrega mais próximo.</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Contribua com o meio ambiente</h4>
              <p>Seu equipamento será recondicionado ou reciclado de forma adequada, ajudando o planeta e pessoas necessitadas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioDoacaoEquipamento;