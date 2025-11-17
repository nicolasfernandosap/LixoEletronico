import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../supabaseClient';
import './IconeMenuRoteiroColeta.css';

// Nomes dos possíveis status da OS
const STATUS_COLETA_CONCLUIDA = 'Coleta Concluida';
const STATUS_CLIENTE_AUSENTE = 'Cliente Ausente';
const STATUS_INICIAL = 'Destino transporte Coleta';

// Chave da API do Google Maps 
const GOOGLE_MAPS_API_KEY = 'AIzaSyDebZ01zrTckNU6oQKPSsAAQqQ30KjcGd4';

const IconeMenuRoteiroColeta = () => {
  // Estados da tela
  const [buscaOS, setBuscaOS] = useState('');
  const [ordemServico, setOrdemServico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [mostrarEndereco, setMostrarEndereco] = useState(false);
  const [observacaoMotorista, setObservacaoMotorista] = useState('');
  const [mostrarObservacao, setMostrarObservacao] = useState(false);

  // --- ESTADOS PARA O MAPA ---
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [, setLocalizacaoAtual] = useState(null);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [erroMapa, setErroMapa] = useState(null);
  const mapRef = useRef(null);
  const mapaInstancia = useRef(null);

  const [statusIds, setStatusIds] = useState({
    inicial: null,
    concluida: null,
    ausente: null,
  });

  useEffect(() => {
    async function fetchStatusIds() {
      const { data, error } = await supabase
        .from('status_da_os')
        .select('id_ref_status_os, status_os')
        .in('status_os', [STATUS_INICIAL, STATUS_COLETA_CONCLUIDA, STATUS_CLIENTE_AUSENTE]);
      if (error) {
        setError('Erro ao carregar status necessários.');
        return;
      }
      const ids = data.reduce((acc, item) => {
        if (item.status_os === STATUS_INICIAL) acc.inicial = item.id_ref_status_os;
        if (item.status_os === STATUS_COLETA_CONCLUIDA) acc.concluida = item.id_ref_status_os;
        if (item.status_os === STATUS_CLIENTE_AUSENTE) acc.ausente = item.id_ref_status_os;
        return acc;
      }, {});
      setStatusIds(ids);
    }
    fetchStatusIds();
  }, []);

  const buscarOrdemServico = useCallback(
    async (e) => {
      e.preventDefault();
      setOrdemServico(null);
      setError(null);
      setSuccess(null);
      setNovoStatus('');
      setObservacaoMotorista('');
      setMostrarObservacao(false);
      setMostrarEndereco(false);
      setMostrarMapa(false);

      const numOS = parseInt(buscaOS, 10);
      if (isNaN(numOS) || !statusIds.inicial) {
        setError('Número da OS inválido ou status não carregado.');
        return;
      }
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ordens_servico')
        .select(`
          id_ref_ordem_servico,
          numero_os,
          observacao_agente_ambiental,
          usuarios!id_usuario (
            id_usuario,
            nome_completo,
            cpf,
            celular,
            endereco,
            numero_casa,
            bairro,
            cidade,
            estado
          )
        `)
        .eq('numero_os', numOS)
        .eq('status_os', statusIds.inicial)
        .single();
      setLoading(false);
      if (fetchError && fetchError.code !== 'PGRST116') {
        setError('Erro ao buscar Ordem de Serviço. Tente novamente.');
        return;
      }
      if (!data) {
        setError('Ordem não encontrada ou já realizada!');
        return;
      }
      setOrdemServico(data);
    },
    [buscaOS, statusIds.inicial]
  );

  const aplicarFluxo = useCallback(async () => {
    if (!ordemServico || !novoStatus) {
      setError('Selecione um novo status antes de aplicar o fluxo.');
      return;
    }
    if (!observacaoMotorista.trim()) {
      setError('O campo de observação é obrigatório para aplicar o fluxo.');
      setMostrarObservacao(true);
      return;
    }
    const novoStatusId =
      novoStatus === STATUS_COLETA_CONCLUIDA ? statusIds.concluida : statusIds.ausente;
    if (!novoStatusId) {
      setError('ID do novo status não encontrado. Recarregue a página.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from('ordens_servico')
      .update({
        status_os: novoStatusId,
        observacao_motorista: observacaoMotorista,
      })
      .eq('id_ref_ordem_servico', ordemServico.id_ref_ordem_servico);

    setLoading(false);

    if (updateError) {
      setError('Erro ao atualizar o status da OS. Tente novamente.');
      return;
    }

    setSuccess(
      `Status da OS Nº ${ordemServico.numero_os.toString().padStart(4, '0')} atualizado para "${novoStatus}" com sucesso!`
    );
    setOrdemServico(null);
    setBuscaOS('');
    setNovoStatus('');
    setObservacaoMotorista('');
    setMostrarObservacao(false);
  }, [ordemServico, novoStatus, observacaoMotorista, statusIds.concluida, statusIds.ausente]);

  const obterLocalizacaoAtual = useCallback(() => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocalizacaoAtual({ lat: latitude, lng: longitude });
            resolve({ lat: latitude, lng: longitude });
          },
          () => {
            const localizacaoPadrao = { lat: -23.5505, lng: -46.6333 };
            setLocalizacaoAtual(localizacaoPadrao);
            resolve(localizacaoPadrao);
          }
        );
      } else {
        const localizacaoPadrao = { lat: -23.5505, lng: -46.6333 };
        setLocalizacaoAtual(localizacaoPadrao);
        resolve(localizacaoPadrao);
      }
    });
  }, []);

  const carregarScriptGoogleMaps = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      if (window.googleMapsLoading) {
        window.googleMapsLoading.then(resolve).catch(reject);
        return;
      }
      window.googleMapsLoading = new Promise((res, rej) => {
        const script = document.createElement('script');
        // Corrigido: removida biblioteca "directions" pois é inválida
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          res();
          resolve();
        };
        script.onerror = () => {
          rej(new Error('Falha ao carregar Google Maps'));
          reject(new Error('Falha ao carregar Google Maps'));
        };
        document.head.appendChild(script);
      });
    });
  }, []);

  const inicializarMapa = useCallback(async () => {
    setLoadingMapa(true);
    setErroMapa(null);

    try {
      await carregarScriptGoogleMaps();
      const locAtual = await obterLocalizacaoAtual();

      if (!mapRef.current) {
        setLoadingMapa(false);
        return;
      }

      const mapa = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: locAtual,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        gestureHandling: "auto",
      });

      mapaInstancia.current = mapa;

      new window.google.maps.Marker({
        position: locAtual,
        map: mapa,
        title: 'Sua localização',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      if (ordemServico && ordemServico.usuarios) {
        const u = ordemServico.usuarios;
        const enderecoDestino = `${u.endereco}, ${u.numero_casa}, ${u.bairro}, ${u.cidade}, ${u.estado}`;

        if (window.google.maps.DirectionsService) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: mapa,
            suppressMarkers: false,
          });

          directionsService.route(
            {
              origin: locAtual,
              destination: enderecoDestino,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
              } else {
                console.error('Erro ao traçar rota:', status);
                if (window.google.maps.Geocoder) {
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode({ address: enderecoDestino }, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                      const destino = results[0].geometry.location;
                      new window.google.maps.Marker({
                        position: destino,
                        map: mapa,
                        title: 'Endereço de destino',
                        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      });
                      mapa.fitBounds(new window.google.maps.LatLngBounds(locAtual, destino));
                    }
                  });
                }
              }
            }
          );
        }
      }

      setLoadingMapa(false);
    } catch (err) {
      console.error('Erro ao inicializar mapa:', err);
      setErroMapa(`Erro ao carregar mapa: ${err.message}`);
      setLoadingMapa(false);
    }
  }, [ordemServico, carregarScriptGoogleMaps, obterLocalizacaoAtual]);

  const abrirMapa = useCallback(() => {
    setMostrarMapa(true);
    setErroMapa(null);
    setTimeout(() => {
      inicializarMapa();
    }, 100);
  }, [inicializarMapa]);

  const renderUserDetails = () => {
    if (!ordemServico || !ordemServico.usuarios) return null;
    const u = ordemServico.usuarios;
    const osNum = ordemServico.numero_os.toString().padStart(4, '0');

    return (
      <div className="roteiro-os-card">
        <h3 className="roteiro-os-card-titulo">
          Detalhes da Ordem de Serviço Nº {osNum}
        </h3>

        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">Nome:</span> {u.nome_completo}
        </div>
        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">CPF:</span> {u.cpf}
        </div>
        <div className="roteiro-detail-item">
          <span className="roteiro-detail-highlight">Celular:</span> {u.celular || 'Não informado'}
        </div>

        <div className="roteiro-toggle-container">
          <input
            type="checkbox"
            id="toggleEndereco"
            checked={mostrarEndereco}
            onChange={() => setMostrarEndereco((prev) => !prev)}
          />
          <label htmlFor="toggleEndereco">Deseja visualizar o endereço?</label>
        </div>

        {mostrarEndereco && (
          <div className="roteiro-detalhes-container">
            <div className="roteiro-address-details">
              Rua: {u.endereco || 'Não informado'}, {u.numero_casa || 'S/N'}
            </div>
            <div className="roteiro-address-details">Bairro: {u.bairro || 'Não informado'}</div>
            <div className="roteiro-address-details">
              Cidade/Estado: {u.cidade || 'Não informado'}/{u.estado || 'N/A'}
            </div>

            <button
              className="roteiro-rastreamento-btn"
              onClick={abrirMapa}
              disabled={loadingMapa}
            >
              {loadingMapa ? 'Carregando Mapa...' : '📍 Rastreamento Endereço'}
            </button>
          </div>
        )}

        {mostrarObservacao && (
          <div className="roteiro-detalhes-container">
            <label htmlFor="obsMotorista" className="roteiro-observacao-label">
              Relato / Observação do Atendimento (Obrigatório)
            </label>
            <textarea
              id="obsMotorista"
              className="roteiro-observacao-textarea"
              placeholder="Descreva o atendimento (Ex: Coleta realizada com sucesso. Cliente ausente. Etc.)"
              value={observacaoMotorista}
              onChange={(e) => setObservacaoMotorista(e.target.value)}
              rows="4"
            />
          </div>
        )}

        <div className="roteiro-status-form">
          <label className="roteiro-status-label">Aplicar Fluxo (Novo Status):</label>
          <div className="roteiro-status-options">
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_COLETA_CONCLUIDA}
                checked={novoStatus === STATUS_COLETA_CONCLUIDA}
                onChange={(e) => {
                  setNovoStatus(e.target.value);
                  setMostrarObservacao(true);
                }}
              />
              {STATUS_COLETA_CONCLUIDA}
            </label>
            <label>
              <input
                type="radio"
                name="novoStatus"
                value={STATUS_CLIENTE_AUSENTE}
                checked={novoStatus === STATUS_CLIENTE_AUSENTE}
                onChange={(e) => {
                  setNovoStatus(e.target.value);
                  setMostrarObservacao(true);
                }}
              />
              {STATUS_CLIENTE_AUSENTE}
            </label>
          </div>
          <button
            className={`roteiro-update-btn${novoStatus ? ' ativo' : ''}`}
            onClick={aplicarFluxo}
            disabled={loading || !novoStatus}
          >
            {loading ? 'Aplicando...' : 'Aplicar Fluxo'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="roteiro-container">
      <h2 className="roteiro-titulo">Roteiro de Coleta - Busca e Atualização</h2>
      <form className="roteiro-busca-form" onSubmit={buscarOrdemServico}>
        <input
          type="text"
          className="roteiro-busca-input"
          placeholder="Buscar por Nº da OS (ex: 0001)"
          value={buscaOS}
          onChange={(e) => setBuscaOS(e.target.value)}
          disabled={loading}
        />
        <button className="roteiro-busca-btn" type="submit" disabled={loading}>
          Buscar OS
        </button>
      </form>
      {loading && <p className="roteiro-loading">Buscando ou atualizando...</p>}
      {error && <p className="roteiro-error">{error}</p>}
      {success && <p className="roteiro-success">{success}</p>}
      {ordemServico && renderUserDetails()}

      {mostrarMapa && (
        <div className="roteiro-mapa-overlay" onClick={() => setMostrarMapa(false)}>
          <div className="roteiro-mapa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="roteiro-mapa-header">
              <h3>Rastreamento de Endereço</h3>
              <button
                className="roteiro-mapa-fechar"
                onClick={() => setMostrarMapa(false)}
              >
                ✕
              </button>
            </div>
            {erroMapa && (
              <div className="roteiro-mapa-erro">
                <p>{erroMapa}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                  Verifique se sua chave da API do Google Maps está configurada corretamente e tem as permissões necessárias.
                </p>
              </div>
            )}
            <div className="roteiro-mapa-container" ref={mapRef}></div>
            {loadingMapa && <p className="roteiro-mapa-loading">Carregando mapa...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconeMenuRoteiroColeta;