import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import './FormularioDoacaoEquipamento.css';
import { FaCamera, FaCheckCircle, FaHeart } from 'react-icons/fa';

const FormularioDoacaoEquipamento = () => {
  const [formData, setFormData] = useState({
    id_equipamento_tipo: '',
    descricao: '',
    mensagem: '',
    url_foto: ''
  });

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Buscar tipos de equipamento e usuário logado
  useEffect(() => {
    const carregarEquipamentos = async () => {
      const { data, error } = await supabase
        .from('equipamentos_tipos')
        .select('id_ref_equipamento_tipo, equipamento_tipo') // ✅ nome correto das colunas
        .order('equipamento_tipo', { ascending: true });

      if (error) {
        console.error('Erro ao carregar tipos de equipamento:', error);
        setMensagemErro('Erro ao carregar a lista de equipamentos.');
      } else {
        setTiposEquipamento(data || []);
      }
    };

    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };

    carregarEquipamentos();
    buscarUsuarioAtual();
  }, []);

  // Manipular campos
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

    if (!formData.id_equipamento_tipo) {
      setMensagemErro('Selecione o tipo de equipamento.');
      setLoading(false);
      return;
    }

    if (!formData.descricao.trim()) {
      setMensagemErro('Por favor, descreva o equipamento.');
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
            mensagem: formData.mensagem || null,
            url_foto: formData.url_foto || null,
            tipo_servico: 3, // ✅ ID fixo referente à "Doação de Equipamentos"
            equipamento_tipo: parseInt(formData.id_equipamento_tipo),
            status_os: 1 // status inicial
          }
        ]);

      if (error) throw error;

      setMensagemSucesso('Doação registrada com sucesso!');
      setFormData({
        id_equipamento_tipo: '',
        descricao: '',
        mensagem: '',
        url_foto: ''
      });

      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao registrar doação:', err);
      setMensagemErro(`Erro ao registrar doação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-ordens-container">
      <div className="formulario-section">
        <h2><FaHeart color="#e74c3c" /> Doação de Equipamento</h2>
        <p className="descricao-formulario">
          Preencha os campos abaixo para registrar sua doação de equipamento eletrônico.
          Nossa equipe analisará as informações e entrará em contato.
        </p>

        {mensagemSucesso && <div className="mensagem-sucesso"><FaCheckCircle /> {mensagemSucesso}</div>}
        {mensagemErro && <div className="mensagem-erro">{mensagemErro}</div>}

        <form onSubmit={handleSubmit} className="ordem-form">
          {/* Tipo de Equipamento */}
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

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="descricao">Descrição do Equipamento *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o equipamento e seu estado de conservação..."
              rows="5"
              required
            />
          </div>

          {/* Observações */}
          <div className="form-group">
            <label htmlFor="mensagem">Observações adicionais</label>
            <textarea
              id="mensagem"
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Informações complementares que possam ajudar..."
              rows="3"
            />
          </div>

          {/* URL da Foto */}
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
              <FaCamera /> Adicione uma foto do equipamento, se desejar.
            </small>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Registrar Doação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioDoacaoEquipamento;
