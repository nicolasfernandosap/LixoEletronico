import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';
import './FormularioDoacaoEquipamento.css';
import { FaCamera, FaCheckCircle, FaHeart, FaTimes } from 'react-icons/fa'; // Adicionado FaTimes

const FormularioDoacaoEquipamento = () => {
  // --- ESTADOS DO COMPONENTE ---
  const [formData, setFormData] = useState({
    id_equipamento_tipo: '',
    descricao: '',
    mensagem: '',
  });
  // Estado separado para o arquivo da foto, facilitando o gerenciamento.
  const [fotoFile, setFotoFile] = useState(null);

  const [tiposEquipamento, setTiposEquipamento] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // --- EFEITOS (useEffect) ---
  // Busca os dados iniciais (tipos de equipamento e usuário) quando o componente é montado.
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      // Busca os tipos de equipamento.
      const { data: equipamentosData, error: equipamentosError } = await supabase
        .from('equipamentos_tipos')
        .select('id_ref_equipamento_tipo, equipamento_tipo')
        .order('equipamento_tipo', { ascending: true });

      if (equipamentosError) {
        console.error('Erro ao carregar tipos de equipamento:', equipamentosError);
        setMensagemErro('Erro ao carregar a lista de equipamentos.');
      } else {
        setTiposEquipamento(equipamentosData || []);
      }

      // Busca o usuário atual.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        setMensagemErro('Sessão de usuário não encontrada. Por favor, faça login.');
      }
    };

    carregarDadosIniciais();
  }, []); // Array vazio garante que o efeito rode apenas uma vez.

  // --- MANIPULADORES DE EVENTOS ---
  // Função unificada para lidar com mudanças nos campos do formulário.
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto_arquivo' && files && files.length > 0) {
      setFotoFile(files[0]); // Armazena o arquivo de foto no estado dedicado.
    } else {
      setFormData(prev => ({ ...prev, [name]: value })); // Atualiza outros campos.
    }
  };

  // Função principal de envio do formulário.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagemErro('');
    setMensagemSucesso('');

    // Validações dos campos.
    if (!formData.id_equipamento_tipo || !formData.descricao.trim()) {
      setMensagemErro('Por favor, preencha todos os campos obrigatórios (*).');
      setLoading(false);
      return;
    }

    if (!userId) {
      setMensagemErro('Erro de autenticação. Usuário não identificado.');
      setLoading(false);
      return;
    }

    try {
      let fotoUrl = null;

      // --- LÓGICA DE UPLOAD DA FOTO (se houver) ---
      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        // ATUALIZAÇÃO: Organiza as fotos por ID de usuário para maior segurança e organização.
        const filePath = `${userId}/${fileName}`;

        // ATUALIZAÇÃO: Usando o bucket 'ordens_fotos' para centralizar todas as imagens.
        const { error: uploadError } = await supabase.storage
          .from('ordens_fotos')
          .upload(filePath, fotoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Falha ao enviar a foto: ${uploadError.message}`);
        }

        // Obtém a URL pública da imagem recém-enviada.
        const { data: publicUrlData } = supabase.storage
          .from('ordens_fotos')
          .getPublicUrl(filePath);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('Não foi possível obter a URL pública da imagem.');
        }
        fotoUrl = publicUrlData.publicUrl;
      }

      // --- INSERÇÃO NO BANCO DE DADOS ---
      const { error: insertError } = await supabase
        .from('ordens_servico')
        .insert([
          {
            id_usuario: userId,
            descricao: formData.descricao,
            mensagem: formData.mensagem || null,
            // ATUALIZAÇÃO PRINCIPAL: Salvando na coluna correta 'foto_armazenamento'.
            foto_armazenamento: fotoUrl,
            tipo_servico: 3, // ID fixo para "Doação de Equipamentos".
            equipamento_tipo: parseInt(formData.id_equipamento_tipo),
            status_os: 1 // Status inicial "Aguardando Análise".
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // Feedback de sucesso e limpeza do formulário.
      setMensagemSucesso('Doação registrada com sucesso! Agradecemos sua contribuição.');
      setFormData({ id_equipamento_tipo: '', descricao: '', mensagem: '' });
      setFotoFile(null);
      // Limpa o campo de input de arquivo.
      const fileInput = document.getElementById('foto_arquivo');
      if (fileInput) {
        fileInput.value = '';
      }

      setTimeout(() => setMensagemSucesso(''), 5000);

    } catch (err) {
      console.error('Erro ao registrar doação:', err);
      setMensagemErro(`Erro ao registrar doação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar o card de sucesso manualmente
  const handleCloseSuccess = () => {
    setMensagemSucesso('');
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="formulario-ordens-container">
      
      {/* NOVO CARD DE NOTIFICAÇÃO DE SUCESSO */}
      {mensagemSucesso && (
        <div className="card-notificacao-backdrop">
          <div className="card-doacao-equipamento"> {/* Classe solicitada */}
            <button className="close-btn" onClick={handleCloseSuccess}>
              <FaTimes />
            </button>
            <FaCheckCircle size={40} />
            <h3>Sucesso!</h3>
            <p>{mensagemSucesso}</p>
          </div>
        </div>
      )}

      <div className="formulario-section">
        <h2><FaHeart className="icon-heart" /> Doação de Equipamento</h2>
        <p className="descricao-formulario">
          Preencha os campos abaixo para registrar sua doação. Nossa equipe analisará e entrará em contato.
        </p>

        {/* A mensagem de sucesso antiga foi removida. A de erro permanece. */}
        {mensagemErro && <div className="mensagem-erro">{mensagemErro}</div>}

        <form onSubmit={handleSubmit} className="ordem-form" noValidate>
          <div className="form-group">
            <label htmlFor="id_equipamento_tipo">Tipo de Equipamento *</label>
            <select id="id_equipamento_tipo" name="id_equipamento_tipo" value={formData.id_equipamento_tipo} onChange={handleChange} required>
              <option value="">Selecione o tipo de equipamento</option>
              {tiposEquipamento.map(tipo => (
                <option key={tipo.id_ref_equipamento_tipo} value={tipo.id_ref_equipamento_tipo}>
                  {tipo.equipamento_tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição do Equipamento *</label>
            <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Descreva o equipamento e seu estado de conservação..." rows="5" required />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Observações adicionais</label>
            <textarea id="mensagem" name="mensagem" value={formData.mensagem} onChange={handleChange} placeholder="Informações complementares que possam ajudar..." rows="3" />
          </div>

          <div className="form-group">
            <label htmlFor="foto_arquivo">Foto do Equipamento (opcional)</label>
            <input type="file" id="foto_arquivo" name="foto_arquivo" accept="image/*" onChange={handleChange} />
            <small className="form-help"><FaCamera /> Escolha uma foto do seu dispositivo.</small>
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