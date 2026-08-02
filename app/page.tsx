"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Track = {
  id: number;
  title: string;
  subtitle: string;
  topic: string;
  src: string;
  color: string;
  icon: string;
  description: string;
  highlights: string[];
};

const tracks: Track[] = [
  {
    id: 1,
    title: "Classe Farmacológica",
    subtitle: "Farmacologia • Faixa educativa",
    topic: "Farmacologia",
    src: `${basePath}/audio/classe-farmacologica.mp3`,
    color: "lime",
    icon: "Rx",
    description: "Uma revisão musical das principais classes de medicamentos cobradas em concursos de enfermagem.",
    highlights: ["Classes e indicações", "Associações para memorizar", "Revisão para concursos"],
  },
  {
    id: 2,
    title: "Mecanismo de Ação",
    subtitle: "Farmacologia • Faixa educativa",
    topic: "Farmacologia",
    src: `${basePath}/audio/mecanismo-de-acao.mp3`,
    color: "violet",
    icon: "↯",
    description: "Entenda como os medicamentos atuam no organismo e fixe os mecanismos mais cobrados em prova.",
    highlights: ["Ação no organismo", "Alvos farmacológicos", "Memorização por ritmo"],
  },
  {
    id: 3,
    title: "Atenção Primária",
    subtitle: "Saúde coletiva • Faixa educativa",
    topic: "Saúde Coletiva",
    src: `${basePath}/audio/atencao-primaria.mp3`,
    color: "blue",
    icon: "APS",
    description: "Revise os fundamentos da Atenção Primária e seu papel como porta de entrada para o cuidado em saúde.",
    highlights: ["Porta de entrada", "Cuidado contínuo", "Território e comunidade"],
  },
  {
    id: 4,
    title: "SUS em Ação",
    subtitle: "Saúde coletiva • Faixa educativa",
    topic: "Saúde Coletiva",
    src: `${basePath}/audio/sus-em-acao.mp3`,
    color: "orange",
    icon: "SUS",
    description: "Uma revisão musical sobre o funcionamento do SUS e a organização do cuidado na prática.",
    highlights: ["Rede de atenção", "Acesso universal", "Cuidado integrado"],
  },
  {
    id: 5,
    title: "Os Três Pilares da Saúde",
    subtitle: "Saúde coletiva • Faixa educativa",
    topic: "Saúde Coletiva",
    src: `${basePath}/audio/tres-pilares-da-saude.mp3`,
    color: "pink",
    icon: "3+",
    description: "Fixe os três pilares essenciais da saúde pública e reconheça como eles aparecem nas questões de concurso.",
    highlights: ["Promoção da saúde", "Prevenção de agravos", "Recuperação do cuidado"],
  },
];

const categories = [
  { name: "Farmacologia", count: "2 faixas", color: "mint", icon: "Rx" },
  { name: "Urgência e emergência", count: "Em breve", color: "orange", icon: "✚" },
  { name: "Saúde coletiva", count: "3 faixas", color: "blue", icon: "◎" },
  { name: "Procedimentos", count: "Em breve", color: "pink", icon: "⌁" },
];

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [current, setCurrent] = useState(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<number[]>([]);
  const [activeNav, setActiveNav] = useState("Início");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; trackIds: number[] }>>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeatOne, setRepeatOne] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const filteredTracks = useMemo(
    () =>
      tracks.filter((track) =>
        `${track.title} ${track.topic}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const likedTracks = useMemo(() => tracks.filter((track) => liked.includes(track.id)), [liked]);
  const recentTracks = useMemo(
    () => history.map((id) => tracks.find((track) => track.id === id)).filter((track): track is Track => Boolean(track)),
    [history],
  );

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pulso-library") || "{}");
      if (Array.isArray(saved.liked)) setLiked(saved.liked);
      if (Array.isArray(saved.history)) setHistory(saved.history);
      if (Array.isArray(saved.playlists)) setPlaylists(saved.playlists);
      if (typeof saved.volume === "number") setVolume(saved.volume);
    } catch {
      // A biblioteca continua funcionando mesmo se o armazenamento local estiver indisponível.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("pulso-library", JSON.stringify({ liked, history, playlists, volume }));
  }, [hydrated, liked, history, playlists, volume]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => undefined);
  }, []);

  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = 220 * ratio;
    canvas.height = 42 * ratio;
    context.scale(ratio, ratio);
    context.fillStyle = "#526058";
    const idleBars = [5, 9, 14, 7, 18, 11, 22, 8, 16, 25, 12, 7, 20, 10, 15, 6, 18, 9, 23, 12, 7, 16, 10, 20, 8, 13, 6, 17, 11, 21, 8, 15, 10, 6, 19, 27, 12, 17, 8, 23, 14, 29, 10, 18, 7, 22, 13, 25, 9, 17, 6, 20, 11, 26, 8, 15, 10, 23, 7, 18, 12, 27, 9, 16];
    idleBars.forEach((height, index) => {
      context.fillRect(index * 3.45, (42 - height) / 2, 1.8, height);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  const ensureVisualizer = () => {
    const audio = audioRef.current;
    const canvas = visualizerRef.current;
    if (!audio || !canvas) return;

    if (!audioContextRef.current) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    audioContextRef.current.resume().catch(() => undefined);
    if (animationRef.current) return;

    const draw = () => {
      const analyser = analyserRef.current;
      const drawingContext = canvas.getContext("2d");
      if (!analyser || !drawingContext) return;
      const frequencies = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencies);
      drawingContext.clearRect(0, 0, 220, 42);
      const gradient = drawingContext.createLinearGradient(0, 0, 220, 0);
      gradient.addColorStop(0, "#a5b3aa");
      gradient.addColorStop(0.45, "#20db78");
      gradient.addColorStop(1, "#8ff0ba");
      drawingContext.fillStyle = gradient;

      for (let index = 0; index < 64; index += 1) {
        const sampleIndex = Math.min(frequencies.length - 1, Math.floor(index * 0.72));
        const energy = frequencies[sampleIndex] / 255;
        const shaped = Math.max(0.12, Math.pow(energy, 0.72));
        const variation = 0.72 + Math.abs(Math.sin(index * 1.63)) * 0.45;
        const height = Math.min(39, 4 + shaped * 34 * variation);
        drawingContext.fillRect(index * 3.45, (42 - height) / 2, 1.8, height);
      }
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const playTrack = (track: Track) => {
    const changed = current.id !== track.id;
    setCurrent(track);
    setIsPlaying(true);
    setHistory((items) => [track.id, ...items.filter((id) => id !== track.id)].slice(0, 12));
    if (!audioRef.current) return;
    ensureVisualizer();
    if (changed) {
      audioRef.current.src = track.src;
      audioRef.current.load();
    }
    audioRef.current.play().catch(() => setIsPlaying(false));
  };

  const openTrack = (track: Track) => {
    setSelectedTrack(track);
    setActiveNav("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    ensureVisualizer();
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  const skip = (direction: number) => {
    const index = tracks.findIndex((track) => track.id === current.id);
    if (shuffle && tracks.length > 1 && direction > 0) {
      const alternatives = tracks.filter((track) => track.id !== current.id);
      playTrack(alternatives[Math.floor(Math.random() * alternatives.length)]);
      return;
    }
    playTrack(tracks[(index + direction + tracks.length) % tracks.length]);
  };

  const toggleLike = (id: number) => {
    setLiked((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  };

  const navigate = (destination: string) => {
    const normalized = destination === "Biblioteca" ? "Sua biblioteca" : destination;
    setSelectedTrack(null);
    setActiveNav(normalized);
    if (normalized !== "Explorar") setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPlaylist = () => {
    const name = window.prompt("Qual será o nome da sua playlist de estudos?");
    if (!name?.trim()) return;
    setPlaylists((items) => [
      ...items,
      { id: `${Date.now()}`, name: name.trim(), trackIds: [current.id] },
    ]);
    navigate("Sua biblioteca");
  };

  const playCollection = (collection: Track[]) => {
    if (!collection.length) return;
    playTrack(collection[0]);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" onClick={() => navigate("Início")} aria-label="Pulso, início">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>PULSO</span>
        </a>

        <nav className="main-nav" aria-label="Navegação principal">
          {[
            ["Início", "⌂"],
            ["Explorar", "⌕"],
            ["Sua biblioteca", "▥"],
          ].map(([label, icon]) => (
            <button
              className={activeNav === label ? "active" : ""}
              key={label}
              onClick={() => navigate(label)}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className="side-section">
          <p>MINHA COLEÇÃO</p>
          <button onClick={createPlaylist}><span className="plus">＋</span>Criar playlist</button>
          <button onClick={() => navigate("Sua biblioteca")}>
            <span className="heart-tile">♥</span>Curtidas
            {liked.length > 0 && <b>{liked.length}</b>}
          </button>
        </div>

        <div className="study-card">
          <span>♫</span>
          <div>
            <strong>Seu ritmo de estudo</strong>
            <p>Transforme revisão em refrão.</p>
          </div>
        </div>

        <div className="profile">
          <div className="avatar">TE</div>
          <div><strong>Tacio Estudante</strong><span>Plano gratuito</span></div>
          <button aria-label="Mais opções">•••</button>
        </div>
      </aside>

      <main className="main" id="top">
        <header>
          <div className="history-buttons">
            <button
              className={selectedTrack ? "history-active" : ""}
              aria-label="Voltar"
              onClick={() => {
                setSelectedTrack(null);
                setActiveNav("Início");
              }}
            >‹</button>
            <button aria-label="Avançar">›</button>
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              aria-label="Buscar músicas e temas"
              value={query}
              onFocus={() => { if (!selectedTrack) setActiveNav("Explorar"); }}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedTrack(null);
                setActiveNav("Explorar");
              }}
              placeholder="O que você quer revisar?"
            />
            {query && <button onClick={() => setQuery("")} aria-label="Limpar busca">×</button>}
          </label>
          <button className="upgrade">Conheça o Pulso Pro</button>
          <button className="bell" aria-label="Notificações">♢</button>
        </header>

        {selectedTrack ? (
          <section className={`track-detail detail-${selectedTrack.color}`}>
            <div className="detail-hero">
              <div className={`detail-cover cover-${selectedTrack.color}`}>
                <div className="detail-cover-orbit" />
                <span>{selectedTrack.icon}</span>
                <small>PULSO • ENFERMAGEM</small>
              </div>
              <div className="detail-heading">
                <span className="detail-type">FAIXA EDUCATIVA</span>
                <h1>{selectedTrack.title}</h1>
                <p>{selectedTrack.description}</p>
                <div className="detail-byline">
                  <b className="detail-avatar">P</b>
                  <strong>Pulso</strong>
                  <i /> <span>2026</span> <i /> <span>1 música</span>
                </div>
              </div>
            </div>

            <div className="detail-body">
              <div className="detail-actions">
                <button className="detail-play" onClick={() => current.id === selectedTrack.id ? togglePlay() : playTrack(selectedTrack)} aria-label={isPlaying && current.id === selectedTrack.id ? "Pausar" : "Reproduzir"}>
                  {isPlaying && current.id === selectedTrack.id ? "Ⅱ" : "▶"}
                </button>
                <button
                  className={`detail-like ${liked.includes(selectedTrack.id) ? "liked" : ""}`}
                  onClick={() => toggleLike(selectedTrack.id)}
                  aria-label="Curtir faixa"
                >♥</button>
                <button className="detail-more" aria-label="Mais opções">•••</button>
              </div>

              <div className="detail-table-head">
                <span>#</span><span>TÍTULO</span><span>CONTEÚDO</span><span>◷</span>
              </div>
              <button className="detail-track-row" onClick={() => current.id === selectedTrack.id ? togglePlay() : playTrack(selectedTrack)}>
                <span className="row-index" onClick={(event) => { event.stopPropagation(); playTrack(selectedTrack); }}>
                  {isPlaying && current.id === selectedTrack.id ? "▮▮" : "1"}
                </span>
                <span className="row-title"><strong>{selectedTrack.title}</strong><small>Pulso</small></span>
                <span className="row-topic">{selectedTrack.topic} para concursos</span>
                <span>{current.id === selectedTrack.id ? formatTime(duration) : "—"}</span>
              </button>

              <div className="detail-columns">
                <article className="about-track">
                  <span className="detail-kicker">SOBRE ESTA FAIXA</span>
                  <h2>Aprenda cantando,<br />lembre na prova.</h2>
                  <p>{selectedTrack.description} Coloque no repeat durante a rotina e transforme os conceitos em memória de longo prazo.</p>
                  <div className="highlight-list">
                    {selectedTrack.highlights.map((item, index) => (
                      <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>
                    ))}
                  </div>
                </article>
                <aside className="study-tip">
                  <span>✦</span>
                  <small>DICA DE ESTUDO</small>
                  <h3>Ouça 3 vezes</h3>
                  <p>Primeiro acompanhe o tema. Depois tente antecipar os conceitos. Na terceira, cante junto.</p>
                  <button onClick={() => playTrack(selectedTrack)}>▶ Ouvir agora</button>
                </aside>
              </div>

              <section className="more-tracks">
                <div className="section-heading"><div><h2>Mais para estudar</h2><p>Continue sua sessão de farmacologia.</p></div></div>
                <div className="compact-track-list">
                  {tracks.filter((track) => track.id !== selectedTrack.id).map((track) => (
                    <button key={track.id} onClick={() => openTrack(track)}>
                      <span className={`compact-cover cover-${track.color}`}>{track.icon}</span>
                      <span><strong>{track.title}</strong><small>{track.subtitle}</small></span>
                      <b>→</b>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        ) : activeNav === "Explorar" ? (
          <section className="app-view explore-view">
            <div className="view-heading">
              <span className="view-kicker">DESCUBRA SEU PRÓXIMO TEMA</span>
              <h1>Explorar</h1>
              <p>Busque uma faixa ou escolha uma matéria para começar a revisão.</p>
            </div>

            <div className="category-grid explore-categories">
              {categories.map((category) => (
                <button
                  className={`category category-${category.color} ${query === category.name ? "selected" : ""}`}
                  key={category.name}
                  onClick={() => setQuery(category.count === "Em breve" ? "" : category.name)}
                >
                  <span>{category.icon}</span>
                  <div><strong>{category.name}</strong><small>{category.count}</small></div>
                  <b>{category.count === "Em breve" ? "•" : "→"}</b>
                </button>
              ))}
            </div>

            <div className="view-section-heading">
              <div><h2>{query ? `Resultados para “${query}”` : "Todas as faixas"}</h2><p>{filteredTracks.length} músicas disponíveis</p></div>
              {filteredTracks.length > 0 && <button className="collection-play" onClick={() => playCollection(filteredTracks)}>▶ Reproduzir tudo</button>}
            </div>
            <div className="track-list">
              {filteredTracks.length ? filteredTracks.map((track, index) => (
                <div className={`track-list-item ${current.id === track.id ? "current" : ""}`} key={track.id}>
                  <button className="list-index" onClick={() => playTrack(track)} aria-label={`Reproduzir ${track.title}`}>
                    {current.id === track.id && isPlaying ? "▮▮" : index + 1}
                  </button>
                  <button className={`list-cover cover-${track.color}`} onClick={() => openTrack(track)}>{track.icon}</button>
                  <button className="list-title" onClick={() => openTrack(track)}><strong>{track.title}</strong><span>Pulso • {track.topic}</span></button>
                  <span className="list-topic">{track.description}</span>
                  <button className={liked.includes(track.id) ? "liked" : "like"} onClick={() => toggleLike(track.id)}>♥</button>
                  <button className="row-play" onClick={() => current.id === track.id ? togglePlay() : playTrack(track)}>{current.id === track.id && isPlaying ? "Ⅱ" : "▶"}</button>
                </div>
              )) : <div className="empty-library"><span>⌕</span><h3>Nenhuma música encontrada</h3><p>Tente buscar “farmacologia”.</p><button onClick={() => setQuery("")}>Limpar busca</button></div>}
            </div>
          </section>
        ) : activeNav === "Sua biblioteca" ? (
          <section className="app-view library-view">
            <div className="view-heading library-heading">
              <span className="view-kicker">SUA COLEÇÃO</span>
              <h1>Biblioteca</h1>
              <p>Suas músicas, playlists e revisões recentes ficam guardadas neste dispositivo.</p>
              <button className="new-playlist" onClick={createPlaylist}>＋ Criar playlist</button>
            </div>

            <div className="library-stats">
              <div><strong>{liked.length}</strong><span>músicas curtidas</span></div>
              <div><strong>{history.length}</strong><span>revisões recentes</span></div>
              <div><strong>{playlists.length}</strong><span>playlists</span></div>
            </div>

            <div className="view-section-heading"><div><h2>Músicas curtidas</h2><p>Toque para continuar estudando.</p></div>{likedTracks.length > 0 && <button className="collection-play" onClick={() => playCollection(likedTracks)}>▶ Ouvir curtidas</button>}</div>
            {likedTracks.length ? (
              <div className="library-cards">
                {likedTracks.map((track) => (
                  <article key={track.id} onClick={() => openTrack(track)}>
                    <div className={`library-cover cover-${track.color}`}>{track.icon}<button onClick={(event) => { event.stopPropagation(); playTrack(track); }}>▶</button></div>
                    <strong>{track.title}</strong><span>{track.subtitle}</span>
                  </article>
                ))}
              </div>
            ) : <div className="empty-library"><span>♥</span><h3>Sua coleção está esperando</h3><p>Curta uma faixa para encontrá-la aqui.</p><button onClick={() => navigate("Explorar")}>Explorar músicas</button></div>}

            {playlists.length > 0 && <><div className="view-section-heading"><div><h2>Suas playlists</h2><p>Coleções criadas por você.</p></div></div><div className="playlist-grid">{playlists.map((playlist) => { const collection = playlist.trackIds.map((id) => tracks.find((track) => track.id === id)).filter((track): track is Track => Boolean(track)); return <button key={playlist.id} onClick={() => playCollection(collection)}><span>♫</span><div><strong>{playlist.name}</strong><small>{collection.length} faixa</small></div><b>▶</b></button>; })}</div></>}

            {recentTracks.length > 0 && <><div className="view-section-heading"><div><h2>Ouvidas recentemente</h2><p>Continue de onde parou.</p></div></div><div className="recent-list">{recentTracks.map((track) => <button key={track.id} onClick={() => playTrack(track)}><span className={`compact-cover cover-${track.color}`}>{track.icon}</span><div><strong>{track.title}</strong><small>{track.topic}</small></div><b>▶</b></button>)}</div></>}
          </section>
        ) : (
        <>
        <section className="quick-start">
          <div>
            <span className="quick-kicker"><i /> PULSO ENFERMAGEM</span>
            <h1>Por onde você quer começar?</h1>
            <p>Explore as músicas ou instale o Pulso no celular para estudar quando quiser.</p>
          </div>
          <div className="quick-actions">
            <button className="explore-button" onClick={() => navigate("Explorar")}><span>⌕</span><div><strong>Explorar músicas</strong><small>Encontre uma matéria</small></div><b>→</b></button>
            <button className="install-button" onClick={() => setInstallGuideOpen(true)}><span>↓</span><div><strong>Instalar no celular</strong><small>Veja o tutorial</small></div><b>→</b></button>
          </div>
        </section>

        <section className="content-section" id="catalogo">
          <div className="section-heading">
            <div><h2>Feito para a sua aprovação</h2><p>Comece pelas faixas que já estão tocando.</p></div>
            <button onClick={() => setQuery("")}>Ver tudo <span>→</span></button>
          </div>

          <div className="track-grid">
            {filteredTracks.length ? filteredTracks.map((track) => (
              <article className="track-card" key={track.id}>
                <button className={`cover cover-${track.color}`} onClick={() => openTrack(track)} aria-label={`Abrir ${track.title}`}>
                  <div className="cover-symbol">{track.icon}</div>
                  <div className="wave"><i /><i /><i /><i /><i /><i /></div>
                  <span className="card-play">→</span>
                </button>
                <div className="track-meta">
                  <button onClick={() => openTrack(track)}>
                    <strong>{track.title}</strong><span>{track.subtitle}</span>
                  </button>
                  <button
                    className={liked.includes(track.id) ? "liked" : "like"}
                    onClick={() => toggleLike(track.id)}
                    aria-label={liked.includes(track.id) ? "Remover das curtidas" : "Curtir"}
                  >♥</button>
                </div>
              </article>
            )) : (
              <div className="empty-state">Nenhuma faixa encontrada. Tente buscar “farmacologia”.</div>
            )}
            <article className="track-card coming-card">
              <div className="cover cover-coming"><span>＋</span><small>Novas faixas<br />em breve</small></div>
              <div className="track-meta"><div><strong>Próxima revisão</strong><span>Seu catálogo está crescendo</span></div></div>
            </article>
          </div>
        </section>

        <section className="content-section category-section">
          <div className="section-heading">
            <div><h2>Explore por matéria</h2><p>Encontre o som certo para cada tema.</p></div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <button
                className={`category category-${category.color}`}
                key={category.name}
                onClick={() => {
                  if (category.count === "Em breve") return;
                  setQuery(category.name);
                  navigate("Explorar");
                }}
              >
                <span>{category.icon}</span>
                <div><strong>{category.name}</strong><small>{category.count}</small></div>
                <b>→</b>
              </button>
            ))}
          </div>
        </section>

        <footer className="page-footer">
          <span><i /> PULSO</span><p>Ouça. Memorize. Passe.</p>
        </footer>
        </>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {["⌂|Início", "⌕|Explorar", "▥|Biblioteca"].map((item) => {
          const [icon, label] = item.split("|");
          const normalized = label === "Biblioteca" ? "Sua biblioteca" : label;
          return <button key={label} onClick={() => navigate(label)} className={activeNav === normalized ? "active" : ""}><span>{icon}</span>{label}</button>;
        })}
      </nav>

      {installGuideOpen && (
        <div className="install-overlay" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={() => setInstallGuideOpen(false)}>
          <section className="install-guide" onClick={(event) => event.stopPropagation()}>
            <button className="install-close" onClick={() => setInstallGuideOpen(false)} aria-label="Fechar tutorial">×</button>
            <span className="install-kicker">PULSO NO SEU CELULAR</span>
            <h2 id="install-title">Instale como um aplicativo</h2>
            <p className="install-intro">Não ocupa quase espaço e abre em tela cheia, direto da sua tela inicial.</p>
            <div className="phone-guides">
              <article>
                <div className="phone-heading"><span>●</span><div><strong>Android</strong><small>Google Chrome</small></div></div>
                <ol>
                  <li><b>1</b><span>Abra o Pulso no <strong>Chrome</strong>.</span></li>
                  <li><b>2</b><span>Toque nos <strong>três pontinhos ⋮</strong> no alto da tela.</span></li>
                  <li><b>3</b><span>Escolha <strong>“Adicionar à tela inicial”</strong> ou “Instalar app”.</span></li>
                  <li><b>4</b><span>Confirme em <strong>Instalar</strong>.</span></li>
                </ol>
              </article>
              <article>
                <div className="phone-heading apple"><span>●</span><div><strong>iPhone</strong><small>Safari</small></div></div>
                <ol>
                  <li><b>1</b><span>Abra o Pulso no <strong>Safari</strong>.</span></li>
                  <li><b>2</b><span>Toque no botão <strong>Compartilhar</strong> na barra inferior.</span></li>
                  <li><b>3</b><span>Role e escolha <strong>“Adicionar à Tela de Início”</strong>.</span></li>
                  <li><b>4</b><span>Confirme tocando em <strong>Adicionar</strong>.</span></li>
                </ol>
              </article>
            </div>
            <div className="install-result"><span>✓</span><p>Pronto! O ícone do Pulso aparecerá junto com seus outros aplicativos.</p></div>
            <button className="install-done" onClick={() => setInstallGuideOpen(false)}>Entendi</button>
          </section>
        </div>
      )}

      {queueOpen && (
        <aside className="queue-panel">
          <div className="queue-heading"><div><span>FILA DE REPRODUÇÃO</span><strong>A seguir</strong></div><button onClick={() => setQueueOpen(false)}>×</button></div>
          {tracks.map((track, index) => (
            <button className={track.id === current.id ? "active" : ""} key={track.id} onClick={() => playTrack(track)}>
              <span className={`queue-cover cover-${track.color}`}>{track.icon}</span>
              <span><strong>{track.title}</strong><small>{track.id === current.id ? "Tocando agora" : `${index + 1} • ${track.topic}`}</small></span>
              <b>{track.id === current.id && isPlaying ? "▮▮" : "▶"}</b>
            </button>
          ))}
        </aside>
      )}

      <div className="player">
        <audio
          ref={audioRef}
          src={current.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (repeatOne && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => setIsPlaying(false));
            } else {
              skip(1);
            }
          }}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        />
        <div className="global-seek">
          <span>{formatTime(time)}</span>
          <input
            aria-label="Voltar ou avançar para qualquer ponto da música"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={time}
            onChange={(event) => {
              const next = Number(event.target.value);
              setTime(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }}
            style={{ "--progress": `${duration ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
          />
          <span>{formatTime(duration)}</span>
        </div>
        <div className="now-playing">
          <button className={`mini-cover cover-${current.color}`} onClick={() => openTrack(current)}>{current.icon}</button>
          <button className="now-playing-title" onClick={() => openTrack(current)}><strong>{current.title}</strong><span>{current.topic} • Pulso</span></button>
          <div className={`visualizer-shell ${isPlaying ? "is-live" : ""}`} title="Visualização do áudio em tempo real">
            <canvas ref={visualizerRef} className="audio-visualizer" aria-label="Visualização do áudio em tempo real" />
            <i />
          </div>
          <button className={`transport-button ${isPlaying ? "playing" : ""}`} onClick={togglePlay} aria-label={isPlaying ? "Pausar música" : "Continuar música"}>{isPlaying ? "Ⅱ" : "▶"}</button>
          <button className={liked.includes(current.id) ? "liked" : "like"} onClick={() => toggleLike(current.id)} aria-label="Curtir faixa">♥</button>
        </div>
        <div className="player-center">
          <div className="controls">
            <button className={shuffle ? "control-active" : ""} onClick={() => setShuffle((value) => !value)} aria-label="Aleatório">⌘</button>
            <button onClick={() => skip(-1)} aria-label="Faixa anterior">▮◀</button>
            <button onClick={() => skip(1)} aria-label="Próxima faixa">▶▮</button>
            <button className={repeatOne ? "control-active" : ""} onClick={() => setRepeatOne((value) => !value)} aria-label="Repetir faixa">↻</button>
          </div>
        </div>
        <div className="player-tools">
          <button className={queueOpen ? "control-active" : ""} onClick={() => setQueueOpen((value) => !value)} aria-label="Abrir fila">☷</button><span>◖</span>
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
