import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient'; // Garanta que o caminho para seu cliente Supabase está correto.
import './FormularioOrdensServico.css'; // Arquivo de estilos para o componente.
import { FaCamera, FaCheckCircle } from 'react-icons/fa'; // Ícones para a interface.

const FormularioOrdensServico = () => {
  // --- ESTADOS DO COMPONENTE ---

  // Estado para armazenar os dados dos campos do formulário (exceto o arquivo de foto).
  const [formData, setFormData] = useState({
    descricao: '',
    id_ref_tipo_servico: '',
    id_equipamento_tipo: '',
    mensagem: ''
  });

  // Estado dedicado para armazenar o objeto do arquivo de foto selecionado pelo usuário.
  const [fotoFile, setFotoFile] = useState(null);

  // Estados para armazenar as listas de opções dos campos <select>.
  const [tiposServico, setTiposServico] = useState([]);
  const [tiposEquipamento, setTiposEquipamento] = useState([]);

  // Estado para guardar o ID do usuário autenticado.
  const [userId, setUserId] = useState(null);

  // Estado para controlar a exibição de feedback de carregamento (ex: desabilitar o botão de submit).
  const [loading, setLoading] = useState(false);

  // Estados para exibir mensagens de feedback para o usuário.
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // --- EFEITOS (useEffect) ---

  // Este useEffect é executado uma vez quando o componente é montado.
  // Sua responsabilidade é buscar os dados iniciais necessários para o formulário.
  useEffect(() => {
    // Função assíncrona para buscar os tipos de serviço da tabela 'tipos_servicos'.
    const buscarTiposServico = async () => {
      const { data, error } = await supabase
        .from('tipos_servicos')
        .select('id_ref_tipo_servico, tipo_servico')
        .order('tipo_servico', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tipos de serviço:', error);
        setMensagemErro('Falha ao carregar os tipos de serviço.');
      } else {
        setTiposServico(data || []);
      }
    };

    // Função assíncrona para buscar os tipos de equipamento da tabela 'equipamentos_tipos'.
    const buscarTiposEquipamento = async () => {
      const { data, error } = await supabase
        .from('equipamentos_tipos')
        .select('id_ref_equipamento_tipo, equipamento_tipo')
        .order('equipamento_tipo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tipos de equipamento:', error);
        setMensagemErro('Falha ao carregar os tipos de equipamento.');
      } else {
        setTiposEquipamento(data || []);
      }
    };

    // Função assíncrona para obter a sessão do usuário atual e extrair seu ID.
    // O ID é crucial para associar a ordem de serviço ao usuário que a criou.
    const buscarUsuarioAtual = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        // Se não houver sessão, é uma boa prática informar o usuário.
        setMensagemErro('Sessão de usuário não encontrada. Por favor, faça login novamente.');
      }
    };

    // Execução das funções de busca.
    buscarTiposServico();
    buscarTiposEquipamento();
    buscarUsuarioAtual();
  }, []); // O array de dependências vazio [] garante que o efeito rode apenas uma vez.

  // --- MANIPULADORES DE EVENTOS ---

  // Função chamada sempre que o valor de um campo do formulário muda.
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Tratamento especial para o campo de arquivo (input type="file").
    if (name === 'foto_armazenamento' && files && files.length > 0) {
      // Armazena o objeto do arquivo no estado 'fotoFile'.
      setFotoFile(files[0]);
    } else {
      // Para todos os outros campos, atualiza o estado 'formData'.
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função principal, chamada quando o formulário é submetido.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do navegador de recarregar a página.
    setLoading(true);
    setMensagemErro('');
    setMensagemSucesso('');

    // --- VALIDAÇÕES DO FORMULÁRIO ---
    if (!formData.descricao.trim() || !formData.id_ref_tipo_servico || !formData.id_equipamento_tipo) {
      setMensagemErro('Por favor, preencha todos os campos obrigatórios (*).');
      setLoading(false);
      return;
    }

    if (!userId) {
      setMensagemErro('Erro de autenticação. Usuário não identificado. Recarregue a página.');
      setLoading(false);
      return;
    }

    let fotoUrl = null; // Variável para armazenar a URL pública da foto, se houver.

    try {
      // --- LÓGICA DE UPLOAD DA FOTO (se uma foto foi selecionada) ---
      if (fotoFile) {
        console.log('Iniciando upload da foto...');
        const fileExt = fotoFile.name.split('.').pop(); // Pega a extensão do arquivo (ex: "png").
        const fileName = `${Date.now()}.${fileExt}`; // Cria um nome de arquivo único usando o timestamp.
        const filePath = `${userId}/${fileName}`; // Define o caminho no bucket, organizando por ID de usuário.

        // 1. Faz o upload do arquivo para o bucket 'ordens_fotos' no Supabase Storage.
        const { error: uploadError } = await supabase.storage
          .from('ordens_fotos')
          .upload(filePath, fotoFile, {
            cacheControl: '3600', // Define o cache do arquivo no navegador por 1 hora.
            upsert: false, // Não sobrescreve se um arquivo com o mesmo nome já existir.
          });

        if (uploadError) {
          // Se o upload falhar, lança um erro para ser pego pelo bloco catch.
          throw new Error(`Erro no upload da foto: ${uploadError.message}`);
        }
        console.log('Upload concluído com sucesso.');

        // 2. Obtém a URL pública do arquivo que acabamos de enviar.
        const { data: publicUrlData } = supabase.storage
          .from('ordens_fotos')
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('Não foi possível obter a URL pública da imagem após o upload.');
        }
        
        fotoUrl = publicUrlData.publicUrl; // Armazena a URL para salvar no banco de dados.
        console.log('URL pública obtida:', fotoUrl);
      }

      // --- INSERÇÃO DA ORDEM DE SERVIÇO NO BANCO DE DADOS ---
      console.log('Inserindo ordem de serviço no banco de dados...');
      const { error: insertError } = await supabase
        .from('ordens_servico')
        .insert([
          {
            id_usuario: userId,
            descricao: formData.descricao,
            tipo_servico: parseInt(formData.id_ref_tipo_servico), // Converte para inteiro.
            equipamento_tipo: parseInt(formData.id_equipamento_tipo), // Converte para inteiro.
            foto_armazenamento: fotoUrl, // Salva a URL da foto (ou null se não houver foto).
            mensagem: formData.mensagem || null,
            status_os: 1 // Define um status inicial (ex: 1 para "Aberta").
          }
        ]);

      if (insertError) {
        // Se a inserção no banco de dados falhar, lança um erro.
        throw insertError;
      }

      // --- FEEDBACK DE SUCESSO E LIMPEZA DO FORMULÁRIO ---
      console.log('Ordem de serviço criada com sucesso!');
      setMensagemSucesso('Ordem de serviço criada com sucesso!');
      
      // Limpa os campos do formulário para uma nova inserção.
      setFormData({
        descricao: '',
        id_ref_tipo_servico: '',
        id_equipamento_tipo: '',
        mensagem: ''
      });
      setFotoFile(null); // Limpa o estado do arquivo.
      document.getElementById('foto_armazenamento').value = ''; // Limpa o campo de input de arquivo.

      // Remove a mensagem de sucesso após 5 segundos.
      setTimeout(() => setMensagemSucesso(''), 5000);

    } catch (err) {
      // --- TRATAMENTO DE ERROS ---
      console.error('Erro detalhado ao criar ordem de serviço:', err);
      // Define uma mensagem de erro genérica e amigável para o usuário.
      setMensagemErro(`Erro ao criar ordem de serviço: ${err.message}`);

    } finally {
      // Este bloco é executado sempre, independentemente de sucesso ou erro.
      // Perfeito para reativar o botão de submit.
      setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="formulario-ordens-container">
      <div className="formulario-section">
        <h2>Nova Ordem de Serviço</h2>
        <p className="descricao-formulario">
          Preencha o formulário abaixo para solicitar um serviço. Nossa equipe entrará em contato em breve.
        </p>

        {/* Exibição condicional das mensagens de feedback */}
        {mensagemSucesso && <div className="mensagem-sucesso"><FaCheckCircle /> {mensagemSucesso}</div>}
        {mensagemErro && <div className="mensagem-erro">{mensagemErro}</div>}

        <form onSubmit={handleSubmit} className="ordem-form" noValidate>
          {/* Campo Tipo de Serviço */}
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
                .filter(tipo => tipo.tipo_servico !== 'Doação de Equipamentos') // Exemplo de filtro.
                .map(tipo => (
                  <option key={tipo.id_ref_tipo_servico} value={tipo.id_ref_tipo_servico}>
                    {tipo.tipo_servico}
                  </option>
                ))}
            </select>
          </div>

          {/* Campo Tipo de Equipamento */}
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

          {/* Campo Descrição */}
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

          {/* Campo Observações */}
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

          {/* Campo de Upload de Foto */}
          <div className="form-group">
            <label htmlFor="foto_armazenamento">Escolha uma foto (opcional)</label>
            <input
              type="file"
              id="foto_armazenamento"
              name="foto_armazenamento"
              onChange={handleChange}
              accept="image/*" // Restringe a seleção de arquivos apenas para imagens.
            />
            <small className="form-help">
              <FaCamera /> Uma foto do problema pode facilitar o diagnóstico.
            </small>
          </div>

          {/* Botão de Submissão */}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Criar Ordem de Serviço'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioOrdensServico;
