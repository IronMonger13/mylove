import { useEffect, useMemo, useRef, useState } from 'react'

// To add your photos: put 8 JPG files in public/photos and name them photo-1.jpg through photo-8.jpg.
// Write the matching note beside each photo. You only need to edit the text inside the quotes.
const memories = [
  { image: '/photos/photo-1.jpg', message: 'Write your note for photo 1 here.' },
  { image: '/photos/photo-2.jpg', message: 'Write your note for photo 2 here.' },
  { image: '/photos/photo-3.jpg', message: 'Write your note for photo 3 here.' },
  { image: '/photos/photo-4.jpg', message: 'Write your note for photo 4 here.' },
  { image: '/photos/photo-5.jpg', message: 'Write your note for photo 5 here.' },
  { image: '/photos/photo-6.jpg', message: 'Write your note for photo 6 here.' },
  { image: '/photos/photo-7.jpg', message: 'Write your note for photo 7 here.' },
  { image: '/photos/photo-8.jpg', message: 'Write your note for photo 8 here.' },
]

const heartWords = ['I love you', 'love you', 'forever', 'my heart', '<3']
const heartPoints = []
for (let y = 1.35; y >= -1.25; y -= 0.105) {
  for (let x = -1.45; x <= 1.45; x += 0.105) {
    if (Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3) <= 0) heartPoints.push({ x: 50 + x * 31, y: 53 - y * 35, boost: 1 - Math.min(1, Math.hypot(x, y) / 1.55) })
  }
}

function Sparkles() { return <div className="sparkles" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div> }

function SoundToggle({ playing, onToggle }) {
  return <button className="sound-toggle" type="button" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}><span>{playing ? '♫' : '♪'}</span><small>{playing ? 'music on' : 'music off'}</small></button>
}

function useGentleMusic() {
  const audioContext = useRef(null); const timer = useRef(null); const [playing, setPlaying] = useState(false)
  const stop = () => { clearInterval(timer.current); audioContext.current?.close(); audioContext.current = null; setPlaying(false) }
  const start = () => {
    if (audioContext.current) return
    const context = new AudioContext(); audioContext.current = context
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]; let note = 0
    const playNote = () => { const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = notes[note++ % notes.length]; gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.12); gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.25); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 1.3) }
    playNote(); timer.current = setInterval(playNote, 1350); setPlaying(true)
  }
  useEffect(() => () => stop(), [])
  return { playing, toggle: () => playing ? stop() : start(), start }
}

function Intro({ next }) {
  return <main className="loading-screen">
    <div className="loading-glow" />
    <section className="loading-intro">
      <h1>Love you.</h1>
      <div className="loading-log">
        <p>[system] Initializing HEART_PROTOCOL_v2.0...</p><p>[status] Loading memory fragments...</p><p>[fonts] Preloading custom heart font for you...</p><p>[ready] Enter pin to view message...</p>
      </div>
      <button className="loading-button" onClick={next}>ENTER PIN</button>
    </section>
  </main>
}

function PinScreen({ next, startMusic }) {
  const [pin, setPin] = useState([]); const [error, setError] = useState(false); const [showHint, setShowHint] = useState(false)
  function press(key) {
    if (key === 'back') { setPin((value) => value.slice(0, -1)); setError(false); return }
    if (pin.length === 4) return
    const nextPin = [...pin, key]; setPin(nextPin); setError(false)
    if (nextPin.length === 4) {
      if (nextPin.join('') === '2407') { startMusic(); setTimeout(next, 280) }
      else { setError(true); setShowHint(true); setTimeout(() => setPin([]), 650) }
    }
  }
  return <main className="screen pin-screen"><Sparkles /><div className="pin-card">
    <div className="lock-heart">♥</div><p className="eyebrow">only you know the way in</p><h1>One tiny secret</h1><p>Tap the special four digits, love.</p>
    <div className="pin-dots" aria-label={`${pin.length} of 4 digits entered`}>{[0, 1, 2, 3].map((dot) => <i className={pin[dot] !== undefined ? 'filled' : ''} key={dot} />)}</div>
    <div className="keypad" aria-label="PIN keypad">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => <button key={number} onClick={() => press(number)}>{number}</button>)}<span /><button onClick={() => press(0)}>0</button><button className="backspace" aria-label="Delete last number" onClick={() => press('back')}>⌫</button></div>
    <span className={`pin-message ${error ? 'visible' : ''}`}>Oops… try again, pretty.</span><p className={`pin-hint ${showHint ? 'visible' : ''}`}>a tiny clue: the day our forever started ♡</p>
  </div></main>
}

function Gallery({ next }) {
  const [openMemory, setOpenMemory] = useState(null)
  return <main className="screen gallery-screen"><Sparkles /><header className="page-heading"><p className="eyebrow">eight little reasons to smile</p><h1>Us, in snapshots</h1><p>Touch a memory to find its secret note ♡</p></header>
    <div className="memory-grid">{memories.map((memory, index) => <article className={`memory memory-${index + 1} ${openMemory === index ? 'is-open' : ''}`} tabIndex="0" key={memory.image} onClick={() => setOpenMemory(openMemory === index ? null : index)}><div className="polaroid-paper"><div className="photo-window"><img src={memory.image} alt={`Memory ${index + 1}`} /><i className="photo-glare" /></div><div className="polaroid-note"><p>{memory.message}</p></div></div></article>)}</div>
    <button className="primary-button gallery-next" onClick={next}>a little love letter <b>→</b></button>
  </main>
}

function HeartField() {
  const words = useMemo(() => heartPoints.map((point, index) => ({ ...point, delay: 160 + ((index * 73) % 900) + point.y * 4, hue: 336 + ((index * 11) % 15), light: 50 + point.boost * 34 + ((index * 7) % 8), opacity: .56 + point.boost * .42, rot: ((index * 17) % 10) - 5 })), [])
  return <div className="reference-heart-wrap" aria-label="A beating heart made from love notes">{words.map((point, index) => <span className="reference-heart-word" key={index} style={{ '--x': point.x, '--y': point.y, '--delay': `${point.delay}ms`, '--hue': point.hue, '--light': `${point.light}%`, '--opacity': point.opacity, '--rot': `${point.rot}deg` }}>{heartWords[(index + Math.floor(point.x)) % heartWords.length]}</span>)}<div className="reference-heart-center">Love you.</div></div>
}

function Letter() { return <main className="screen letter-screen"><Sparkles /><section className="letter-hero"><p className="eyebrow">and this is only the beginning</p><HeartField /><p className="heart-caption">all of this is for you</p></section><article className="love-letter"><span>dear you,</span><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is where you can write the softest, sweetest things you want her to read.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><em>with all my love,<br />your favourite person ♡</em></article></main> }

export default function App() { const [page, setPage] = useState('intro'); const music = useGentleMusic(); const pages = { intro: <Intro next={() => setPage('pin')} />, pin: <PinScreen next={() => setPage('gallery')} startMusic={music.start} />, gallery: <Gallery next={() => setPage('letter')} />, letter: <Letter /> }; return <><div className="app-shell">{pages[page]}</div>{page !== 'intro' && <SoundToggle playing={music.playing} onToggle={music.toggle} />}</> }
