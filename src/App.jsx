import { useEffect, useRef, useState } from 'react'

const memories = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. A tiny placeholder for a sweet memory. ♡',
  // Replace this with /photos/photo-1.jpg (and so on) after adding your pictures to public/photos.
  image: `https://images.unsplash.com/photo-${[
    '1516589178581-6cd7833ae3b2', '1518199266791-5375a83190b7',
    '1497366754035-f200968a6e72', '1516589091380-5d42b1b3a8d1',
    '1518988246986-2a1c8c6fdda8', '1524504388940-b1c1722653e1',
    '1487412720507-e7ab37603c6f', '1494790108377-be9c29b29330',
  ][index]}?auto=format&fit=crop&w=900&q=80`,
}))

function Sparkles() {
  return <div className="sparkles" aria-hidden="true">
    {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
  </div>
}

function SoundToggle({ playing, onToggle }) {
  return <button className="sound-toggle" type="button" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'}>
    <span>{playing ? '♫' : '♪'}</span><small>{playing ? 'music on' : 'music off'}</small>
  </button>
}

function useGentleMusic() {
  const audioContext = useRef(null)
  const timer = useRef(null)
  const [playing, setPlaying] = useState(false)

  const stop = () => {
    clearInterval(timer.current)
    audioContext.current?.close()
    audioContext.current = null
    setPlaying(false)
  }
  const start = () => {
    if (audioContext.current) return
    const context = new AudioContext()
    audioContext.current = context
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]
    let note = 0
    const playNote = () => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = notes[note++ % notes.length]
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.25)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 1.3)
    }
    playNote()
    timer.current = setInterval(playNote, 1350)
    setPlaying(true)
  }
  useEffect(() => () => stop(), [])
  return { playing, toggle: () => playing ? stop() : start(), start }
}

function Intro({ next }) {
  return <main className="screen intro">
    <Sparkles />
    <div className="intro-copy">
      <p className="eyebrow">a tiny corner of the internet, just for you</p>
      <h1>Hi, pretty girl<span>♡</span></h1>
      <p className="intro-text">I made a little something with all my love.</p>
      <button className="primary-button" onClick={next}>enter pin <b>→</b></button>
    </div>
    <div className="heart-cluster" aria-hidden="true"><span>♥</span><i>♥</i><b>♥</b></div>
  </main>
}

function PinScreen({ next, startMusic }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  function handleChange(event) {
    const value = event.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value); setError(false)
    if (value.length === 4) {
      if (value === '2407') { startMusic(); setTimeout(next, 250) }
      else { setError(true); setPin('') }
    }
  }
  return <main className="screen pin-screen">
    <Sparkles />
    <div className="pin-card">
      <div className="lock-heart">♥</div>
      <p className="eyebrow">only you know the way in</p>
      <h1>One tiny secret</h1>
      <p>Enter the special four digits, love.</p>
      <input className="pin-input" autoFocus inputMode="numeric" autoComplete="one-time-code" value={pin} onChange={handleChange} aria-label="Four digit pin" placeholder="♡ ♡ ♡ ♡" />
      <span className={`pin-message ${error ? 'visible' : ''}`}>Oops… try again, pretty.</span>
    </div>
  </main>
}

function Gallery({ next }) {
  return <main className="screen gallery-screen">
    <Sparkles />
    <header className="page-heading"><p className="eyebrow">eight little reasons to smile</p><h1>Us, in snapshots</h1><p>Hover a memory to find its secret note ♡</p></header>
    <div className="memory-grid">
      {memories.map((memory, index) => <article className={`memory memory-${index + 1}`} key={memory.id}>
        <img src={memory.image} alt={`Memory placeholder ${memory.id}`} />
        <div className="polaroid-note"><span>memory no. {String(memory.id).padStart(2, '0')}</span><p>{memory.caption}</p></div>
      </article>)}
    </div>
    <button className="primary-button gallery-next" onClick={next}>a little love letter <b>→</b></button>
  </main>
}

function Letter() {
  return <main className="screen letter-screen">
    <Sparkles />
    <section className="letter-hero"><p className="eyebrow">and this is only the beginning</p><div className="beating-heart" aria-label="A beating heart">♥</div><p className="heart-caption">all of this is for you</p></section>
    <article className="love-letter"><span>dear you,</span><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is where you can write the softest, sweetest things you want her to read.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><em>with all my love,<br />your favourite person ♡</em></article>
  </main>
}

export default function App() {
  const [page, setPage] = useState('intro')
  const music = useGentleMusic()
  const pages = { intro: <Intro next={() => setPage('pin')} />, pin: <PinScreen next={() => setPage('gallery')} startMusic={music.start} />, gallery: <Gallery next={() => setPage('letter')} />, letter: <Letter /> }
  return <><div className="app-shell">{pages[page]}</div>{page !== 'intro' && <SoundToggle playing={music.playing} onToggle={music.toggle} />}</>
}
