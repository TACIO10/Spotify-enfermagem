"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    src: "/audio/classe-farmacologica.mp3",
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
    src: "/audio/mecanismo-de-acao.mp3",
    color: "violet",
    icon: "↯",
    description: "Entenda como os medicamentos atuam no organismo e fixe os mecanismos mais cobrados em prova.",
    highlights: ["Ação no organismo", "Alvos farmacológicos", "Memorização por ritmo"],
  },
];

const categories = [
  { name: "Farmacologia", count: "2 faixas", color: "mint", icon: "Rx" },
  { name: "Urgência e emergência", count: "Em breve", color: "orange", icon: "✚" },
  { name: "Saúde coletiva", count: "Em breve", color: "blue", icon: "◎" },
  { name: "Procedimentos", count: "Em breve", color: "pink", icon: "⌁" },
];

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<number[]>([]);
  const [activeNav, setActiveNav] = useState("Início");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const filteredTracks = useMemo(
    () =>
      tracks.filter((track) =>
        `${track.title} ${track.topic}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const playTrack = (track: Track) => {
    const changed = current.id !== track.id;
    setCurrent(track);
    setIsPlaying(true);
    if (!audioRef.current) return;
    if (changed) {
      audioRef.current.src = track.src;
      audioRef.current.load();
    }
    audioRef.current.play().catch(() => setIsPlaying(false));
  };

  const openTrack = (track: Track) => {
    setSelectedTrack(track);
    setCurrent(track);
    setActiveNav("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  const skip = (direction: number) => {
    const index = tracks.findIndex((track) => track.id === current.id);
    playTrack(tracks[(index + direction + tracks.length) % tracks.length]);
  };

  const toggleLike = (id: number) => {
    setLiked((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Pulso, início">
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
              onClick={() => setActiveNav(label)}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className="side-section">
          <p>MINHA COLEÇÃO</p>
          <button onClick={() => setQuery("")}><span className="plus">＋</span>Criar playlist</button>
          <button onClick={() => setQuery(liked.length ? "" : "___")}>
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
              onChange={(event) => setQuery(event.target.value)}
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
              <button className="detail-track-row" onDoubleClick={() => playTrack(selectedTrack)}>
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
        ) : (
        <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> NOVO POR AQUI</span>
            <h1>Estude enfermagem<br />no seu <em>ritmo.</em></h1>
            <p>Conteúdo de concurso transformado em música.<br />Dê o play e faça o conhecimento ficar.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => playTrack(tracks[0])}>
                <span>▶</span> Começar a ouvir
              </button>
              <button className="secondary" onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}>
                Explorar catálogo
              </button>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit one" /><div className="orbit two" />
            <div className="vinyl">
              <div className="vinyl-ring" />
              <div className="vinyl-label"><span>⚕</span><small>PULSO</small></div>
            </div>
            <div className="pulse-line"><i /><i /><i /><i /><i /><i /><i /></div>
            <span className="float-note note-one">♪</span>
            <span className="float-note note-two">♫</span>
            <span className="float-pill">Rx</span>
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
                onClick={() => category.count !== "Em breve" && setQuery(category.name)}
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
          return <button key={label} className={label === "Início" ? "active" : ""}><span>{icon}</span>{label}</button>;
        })}
      </nav>

      <div className="player">
        <audio
          ref={audioRef}
          src={current.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => skip(1)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        />
        <div className="now-playing">
          <div className={`mini-cover cover-${current.color}`}>{current.icon}</div>
          <div><strong>{current.title}</strong><span>{current.topic} • Pulso</span></div>
          <button className={liked.includes(current.id) ? "liked" : "like"} onClick={() => toggleLike(current.id)} aria-label="Curtir faixa">♥</button>
        </div>
        <div className="player-center">
          <div className="controls">
            <button aria-label="Aleatório">⌘</button>
            <button onClick={() => skip(-1)} aria-label="Faixa anterior">▮◀</button>
            <button className="main-play" onClick={togglePlay} aria-label={isPlaying ? "Pausar" : "Reproduzir"}>
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
            <button onClick={() => skip(1)} aria-label="Próxima faixa">▶▮</button>
            <button aria-label="Repetir">↻</button>
          </div>
          <div className="timeline">
            <span>{formatTime(time)}</span>
            <input
              aria-label="Progresso da faixa"
              type="range"
              min="0"
              max={duration || 0}
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
        </div>
        <div className="player-tools">
          <button aria-label="Fila">☷</button><span>◖</span>
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
