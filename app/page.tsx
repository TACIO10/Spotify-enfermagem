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
  },
  {
    id: 2,
    title: "Mecanismo de Ação",
    subtitle: "Farmacologia • Faixa educativa",
    topic: "Farmacologia",
    src: "/audio/mecanismo-de-acao.mp3",
    color: "violet",
    icon: "↯",
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
            <button aria-label="Voltar">‹</button><button aria-label="Avançar">›</button>
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
                <button className={`cover cover-${track.color}`} onClick={() => playTrack(track)} aria-label={`Ouvir ${track.title}`}>
                  <div className="cover-symbol">{track.icon}</div>
                  <div className="wave"><i /><i /><i /><i /><i /><i /></div>
                  <span className="card-play">{current.id === track.id && isPlaying ? "Ⅱ" : "▶"}</span>
                </button>
                <div className="track-meta">
                  <button onClick={() => playTrack(track)}>
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
