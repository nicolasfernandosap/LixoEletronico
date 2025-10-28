import React, { useState, useEffect,} from 'react';
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

  const [userId, setUserId] = useState(null);

  const [loading, setLoading] = useState(false);

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

      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao criar ordem de serviço:', err);
      
      let errorMessage = `Erro ao criar ordem de serviço: ${err.message}`;
      if (err.code === '23503') { 
          errorMessage = 'Erro de Chave Estrangeira: O tipo de serviço ou equipamento selecionado não existe no banco de dados.';
      } else if (err.message.includes('Could not find')) {
          errorMessage = 'Erro de Conexão: Um nome de coluna ou Chave Estrangeira está incorreto.';
      }
      setMensagemErro(errorMessage);
    } finally {
      setLoading(false);
    }
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

            {tiposServico
          // 🔹 Oculta a opção "Doação de Equipamentos"
          .filter(tipo => tipo.tipo_servico !== 'Doação de Equipamentos')
          .map(tipo => (
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
	    </div>
  );
};

export default FormularioOrdensServico;