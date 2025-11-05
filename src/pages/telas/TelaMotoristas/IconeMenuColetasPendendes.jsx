import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuColetasPendendes.css';

const IconeMenuColetasPendendes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [ordensPorUsuario, setOrdensPorUsuario] = useState({});
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingOrdens, setLoadingOrdens] = useState(false);
  const [busca, setBusca] = useState('');
  const [modalOrdem, setModalOrdem] = useState(null);
  const [idStatus, setIdStatus] = useState(null);

  const [todasOrdens, setTodasOrdens] = useState([]);
  const [loadingTodasOrdens, setLoadingTodasOrdens] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Busca o id do status 'Destino transporte Coleta' e salva idStatus
  useEffect(() => {
    async function fetchStatus() {
      const { data, error } = await supabase
        .from('status_da_os')
        .select('id_ref_status_os')
        .eq('status_os', 'Destino transporte Coleta')
        .single();
      if (!error && data) {
        setIdStatus(data.id_ref_status_os);
      }
    }
    fetchStatus();
  }, []);

  const buscarUsuariosPorNome = useCallback(async (nome) => {
    if (!nome) {
      setUsuarios([]);
      return;
    }
    setLoadingUsuarios(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nome_completo, cpf')
      .ilike('nome_completo', `%${nome}%`)
      .limit(10);
    if (!error) setUsuarios(data || []);
    else setUsuarios([]);
    setLoadingUsuarios(false);
  }, []);

  const buscarOrdensPorNumero = useCallback(async (numero) => {
    setLoadingUsuarios(true);
    const numValue = parseInt(numero, 10);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id_ref_ordem_servico, numero_os, dia_agendamento_coleta, observacao_agente_ambiental, usuarios!id_usuario(id_usuario, nome_completo, cpf)')
      .eq('status_os', idStatus)
      .eq('numero_os', numValue);
    if (!error && data && data.length > 0) {
      const usuariosMap = {};
      const ordensMap = {};
      data.forEach((os) => {
        const usr = os.usuarios;
        if (usr) {
          usuariosMap[usr.id_usuario] = usr;
          if (!ordensMap[usr.id_usuario]) ordensMap[usr.id_usuario] = [];
          ordensMap[usr.id_usuario].push(os);
        }
      });
      setUsuarios(Object.values(usuariosMap));
      setOrdensPorUsuario(ordensMap);
    } else {
      setUsuarios([]);
      setOrdensPorUsuario({});
    }
    setLoadingUsuarios(false);
  }, [idStatus]);

  const buscarOrdensParaUsuarios = useCallback(async (usuariosList) => {
    setLoadingOrdens(true);
    if (!usuariosList.length || !idStatus) {
      setOrdensPorUsuario({});
      setLoadingOrdens(false);
      return;
    }
    const ids = usuariosList.map(u => u.id_usuario);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id_ref_ordem_servico, id_usuario, numero_os, dia_agendamento_coleta, observacao_agente_ambiental')
      .in('id_usuario', ids)
      .eq('status_os', idStatus)
      .order('dia_agendamento_coleta', { ascending: false });
    if (!error && data) {
      const mapOrdens = {};
      data.forEach(os => {
        if (!mapOrdens[os.id_usuario]) mapOrdens[os.id_usuario] = [];
        mapOrdens[os.id_usuario].push(os);
      });
      setOrdensPorUsuario(mapOrdens);
    } else {
      setOrdensPorUsuario({});
    }
    setLoadingOrdens(false);
  }, [idStatus]);

  useEffect(() => {
    if (!busca.trim()) {
      setUsuarios([]);
      setOrdensPorUsuario({});
      return;
    }
    if (/^\d+$/.test(busca.trim())) {
      buscarOrdensPorNumero(busca.trim());
    } else {
      buscarUsuariosPorNome(busca.trim());
    }
  }, [busca, buscarUsuariosPorNome, buscarOrdensPorNumero]);

  useEffect(() => {
    if (usuarios.length > 0 && !(/^\d+$/.test(busca.trim()))) {
      buscarOrdensParaUsuarios(usuarios);
    }
  }, [usuarios, buscarOrdensParaUsuarios, busca]);

  const buscarTodasOrdens = useCallback(async () => {
    if (!idStatus) return;
    setLoadingTodasOrdens(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id_ref_ordem_servico, numero_os, usuarios!id_usuario(nome_completo, cpf)')
      .eq('status_os', idStatus)
      .not('numero_os', 'is', null)
      .order('numero_os', { ascending: true });
    if (!error) setTodasOrdens(data || []);
    else setTodasOrdens([]);
    setLoadingTodasOrdens(false);
  }, [idStatus]);

  const handleMostrarTodas = () => {
    setMostrarTodas(prev => {
      if (!prev) buscarTodasOrdens();
      return !prev;
    });
  };

  const formatarData = (dt) => {
    if (!dt) return 'Não informado';
    return new Date(dt).toLocaleDateString('pt-BR');
  };

  return (
    <div className="coletas-container">
      <h2>Pesquisa de Usuários e Ordens Coletas Pendentes</h2>

      <input
        type="text"
        className="filtro-input"
        placeholder="Pesquisar por número da OS ou nome do usuário"
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      <button className="filtro-btn" onClick={handleMostrarTodas}>
        {mostrarTodas ? 'Esconder todas as ordens' : 'Mostrar todas as ordens'}
      </button>

      {loadingUsuarios && <p>Buscando usuários...</p>}
      {!loadingUsuarios && usuarios.length === 0 && busca.trim() && <p>Nenhum usuário encontrado.</p>}

      {usuarios.map(u => (
        <div key={u.id_usuario} className="usuario-ordens-bloco">
          <h3>{u.nome_completo} (CPF: {u.cpf})</h3>
          {loadingOrdens ? (
            <p>Carregando ordens...</p>
          ) : ordensPorUsuario[u.id_usuario]?.length ? (
            <table className="tabela-coletas">
              <thead>
                <tr>
                  <th>Nº OS</th>
                  <th>Data Agendamento</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {ordensPorUsuario[u.id_usuario].map(ordem => (
                  <tr key={ordem.id_ref_ordem_servico}>
                    <td>{ordem.numero_os.toString().padStart(4, '0')}</td>
                    <td>{formatarData(ordem.dia_agendamento_coleta)}</td>
                    <td>
                      {ordem.observacao_agente_ambiental ? (
                        <button
                          className="olhinho-btn"
                          title="Visualizar observação"
                          onClick={() => setModalOrdem(ordem)}
                          aria-label="Visualizar observação"
                        >
                          👁️
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Sem ordens para este usuário.</p>
          )}
        </div>
      ))}

      {mostrarTodas && (
        <>
          {loadingTodasOrdens ? (
            <p>Carregando todas as ordens...</p>
          ) : todasOrdens.length === 0 ? (
            <p>Nenhuma ordem encontrada</p>
          ) : (
            <table className="tabela-coletas" style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Nº OS</th>
                  <th>Nome do Usuário</th>
                  <th>CPF</th>
                </tr>
              </thead>
              <tbody>
                {todasOrdens.map(ordem => (
                  <tr key={ordem.id_ref_ordem_servico}>
                    <td>{ordem.numero_os.toString().padStart(4, '0')}</td>
                    <td>{ordem.usuarios?.nome_completo || '-'}</td>
                    <td>{ordem.usuarios?.cpf || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {modalOrdem && (
        <div
          className="modal-fundo"
          onClick={() => setModalOrdem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          aria-describedby="modalDescription"
        >
          <div className="modal-conteudo" onClick={e => e.stopPropagation()}>
            <h3 id="modalTitle">Observação do Agente Ambiental</h3>
            <p id="modalDescription">{modalOrdem.observacao_agente_ambiental}</p>
            <button
              className="fechar-btn"
              onClick={() => setModalOrdem(null)}
              aria-label="Fechar modal"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconeMenuColetasPendendes;
