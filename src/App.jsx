import { useEffect, useMemo, useRef, useState } from "react";

const memories = [
  {
    image: `${import.meta.env.BASE_URL}photos/photo-1.jpeg`,
    message: "The day we met. I still can't believe I am this lucky. ♡",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-2.jpeg`,
    message: "Every picture with you somehow becomes my favourite.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-3.jpeg`,
    message:
      "You looked so beautiful here that I forgot what I was trying to say.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-4.jpeg`,
    message: "A tiny moment, a lifetime memory.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-5.jpeg`,
    message: "You smiled and I forgot how to function.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-6.jpeg`,
    message: "If I could pause time, I'd choose this day.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-7.jpeg`,
    message: "My camera roll is basically your fan page.",
  },
  {
    image: `${import.meta.env.BASE_URL}photos/photo-8.jpeg`,
    message: "And this is only the beginning of our story. ❤️",
  },
];

const heartWords = ["I love you", "love you", "forever", "my heart", "<3"];
const heartPoints = [];
for (let y = 1.35; y >= -1.25; y -= 0.105) {
  for (let x = -1.45; x <= 1.45; x += 0.105) {
    if (Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3) <= 0)
      heartPoints.push({
        x: 50 + x * 31,
        y: 53 - y * 35,
        boost: 1 - Math.min(1, Math.hypot(x, y) / 1.55),
      });
  }
}

function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <i key={i} style={{ "--i": i }} />
      ))}
    </div>
  );
}

function SoundToggle({ playing, onToggle }) {
  return (
    <button
      className="sound-toggle"
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause music" : "Play music"}
    >
      <span>{playing ? "♫" : "♪"}</span>
      <small>{playing ? "music on" : "music off"}</small>
    </button>
  );
}

function useGentleMusic() {
  const audioContext = useRef(null);
  const timer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const stop = () => {
    clearInterval(timer.current);
    audioContext.current?.close();
    audioContext.current = null;
    setPlaying(false);
  };
  const start = () => {
    if (audioContext.current) return;
    const context = new AudioContext();
    audioContext.current = context;
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
    let note = 0;
    const playNote = () => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[note++ % notes.length];
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 1.25,
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 1.3);
    };
    playNote();
    timer.current = setInterval(playNote, 1350);
    setPlaying(true);
  };
  useEffect(() => () => stop(), []);
  return { playing, toggle: () => (playing ? stop() : start()), start };
}

function Intro({ next }) {
  return (
    <main className="loading-screen">
      <div className="loading-glow" />
      <section className="loading-intro">
        <h1>Welcome, My love</h1>
        <div className="loading-log">
          <p>[system] Initializing HEART_PROTOCOL...</p>
          <p>[status] Loading memory fragments...</p>
          <p>[fonts] Preloading custom heart font for you...</p>
          <p>[ready] Enter pin to view message...</p>
        </div>
        <button className="loading-button" onClick={next}>
          ENTER PIN
        </button>
      </section>
    </main>
  );
}

function PinScreen({ next, startMusic }) {
  const [pin, setPin] = useState([]);
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  function press(key) {
    if (key === "back") {
      setPin((value) => value.slice(0, -1));
      setError(false);
      return;
    }
    if (pin.length === 4) return;
    const nextPin = [...pin, key];
    setPin(nextPin);
    setError(false);
    if (nextPin.length === 4) {
      if (nextPin.join("") === "2407") {
        startMusic();
        setTimeout(next, 280);
      } else {
        setError(true);
        setShowHint(true);
        setTimeout(() => setPin([]), 650);
      }
    }
  }
  return (
    <main className="screen pin-screen">
      <Sparkles />
      <div className="pin-card">
        <div className="lock-heart">♥</div>
        <p className="eyebrow">only you know the way in</p>
        <h1>One tiny secret</h1>
        <p>Tap the special four digits, love.</p>
        <div
          className="pin-dots"
          aria-label={`${pin.length} of 4 digits entered`}
        >
          {[0, 1, 2, 3].map((dot) => (
            <i className={pin[dot] !== undefined ? "filled" : ""} key={dot} />
          ))}
        </div>
        <div className="keypad" aria-label="PIN keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button key={number} onClick={() => press(number)}>
              {number}
            </button>
          ))}
          <span />
          <button onClick={() => press(0)}>0</button>
          <button
            className="backspace"
            aria-label="Delete last number"
            onClick={() => press("back")}
          >
            ⌫
          </button>
        </div>
        <span className={`pin-message ${error ? "visible" : ""}`}>
          Oops… try again, pretty lady.
        </span>
        <p className={`pin-hint ${showHint ? "visible" : ""}`}>
          Hint: the day our forever started ♡
        </p>
      </div>
    </main>
  );
}

function Gallery({ next }) {
  const [openMemory, setOpenMemory] = useState(null);
  useEffect(() => {
    function handlePointerDown(e) {
      if (!e.target.closest(".memory")) {
        setOpenMemory(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);
  return (
    <main className="screen gallery-screen">
      <Sparkles />
      <header className="page-heading">
        <p className="eyebrow">Our little reasons to smile</p>
        <h1>Us, in snapshots</h1>
        <p>Touch a memory to find its secret note ♡</p>
      </header>
      <div className="memory-grid">
        {memories.map((memory, index) => (
          <article
            className={`memory memory-${index + 1} ${openMemory === index ? "is-open" : ""}`}
            tabIndex="0"
            key={memory.image}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMemory(openMemory === index ? null : index);
            }}
          >
            <div className="polaroid-paper">
              <div className="photo-window">
                <img src={memory.image} alt={`Memory ${index + 1}`} />
                <i className="photo-glare" />
              </div>
              <div className="polaroid-note">
                <p>{memory.message}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <button className="primary-button gallery-next" onClick={next}>
        a little love letter <b>→</b>
      </button>
    </main>
  );
}

function HeartField() {
  const words = useMemo(
    () =>
      heartPoints.map((point, index) => ({
        ...point,
        delay: 160 + ((index * 73) % 900) + point.y * 4,
        hue: 336 + ((index * 11) % 15),
        light: 50 + point.boost * 34 + ((index * 7) % 8),
        opacity: 0.56 + point.boost * 0.42,
        rot: ((index * 17) % 10) - 5,
      })),
    [],
  );
  return (
    <div
      className="reference-heart-wrap"
      aria-label="A beating heart made from love notes"
    >
      {words.map((point, index) => (
        <span
          className="reference-heart-word"
          key={index}
          style={{
            "--x": point.x,
            "--y": point.y,
            "--delay": `${point.delay}ms`,
            "--hue": point.hue,
            "--light": `${point.light}%`,
            "--opacity": point.opacity,
            "--rot": `${point.rot}deg`,
          }}
        >
          {heartWords[(index + Math.floor(point.x)) % heartWords.length]}
        </span>
      ))}
      <div className="reference-heart-center">Love you.</div>
    </div>
  );
}

function Letter() {
  return (
    <main className="screen letter-screen">
      <Sparkles />
      <section className="letter-hero">
        <p className="eyebrow">and this is only the beginning</p>
        <HeartField />
        <p className="heart-caption">I love you so much</p>
      </section>
      <article className="love-letter">
        <span>To my pasandida aurat,</span>
        <p>
          There are so many things I want to tell you that I don't think a
          single letter could ever hold them all. Still, if I had to choose one
          place to keep a tiny piece of my heart, it would be here.
        </p>
        <p>
          Sometimes I think back to our first date, and I still smile. I know
          things weren't easy for you that day, and you had every reason to
          cancel. But you still came. I don't know if you realize how much that
          meant to me. I was excited before we met, but the moment I saw you,
          every bit of nervousness disappeared. Looking back now, I don't think
          I just went on a first date that day. I found my favourite person.
        </p>
        <p>
          A random conversation, a walk together, sitting quietly beside each
          other... none of it ever feels ordinary when it's with you. You have
          this beautiful way of making every moment feel worth remembering.
        </p>
        <p>
          One of my favourite gifts will always be the canvas you made for me.
          It isn't just because it's beautiful. It's because you spent your
          time, your effort, and a little piece of your heart making something
          just for me. Every time I look at it, I don't just see a painting. I
          see love that was carefully created by the person I love most.
        </p>
        <p>And then there was that night.</p>
        <p>
          Standing with you on that terrace, with the city glowing behind us,
          felt like time had stopped just for us. The lights behind you were
          beautiful, but I don't think I noticed them much because I couldn't
          stop looking at you. Asking you to spend forever with me was the best
          decision I've ever made, and hearing you say yes was the happiest
          moment of my life. I don't think any view, no matter how breathtaking,
          will ever compare to the one I had standing beside you that night.
        </p>
        <p>
          You make me feel loved in every way possible. Through grand
          gestures.Through little things. Through your patience, your kindness,
          your hugs, your laughter, and the way you remember the smallest
          details about me and take care of me.
        </p>
        <p>
          Thank you for being my favourite person. Thank you for being my home.
          Thank you for being my everything.
        </p>
        <p>
          {" "}
          Thank you for choosing me. Thank you for loving me. Thank you for
          becoming the safest place my heart has ever known.
        </p>
        <p>
          No matter how many years pass, I hope we never stop taking silly
          pictures, making new memories, laughing at nothing, and finding new
          reasons to fall in love with each other all over again.
        </p>
        <p>I loved you yesterday.</p>
        <p>I love you today.</p>
        <p>
          And I know, without a single doubt, I'll love you even more tomorrow.
        </p>
        <p>Forever yours,</p>
        <em>
          with all my love,
          <br />
          the luckiest man alive ♡
        </em>
      </article>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("intro");
  const music = useGentleMusic();
  const pages = {
    intro: <Intro next={() => setPage("pin")} />,
    pin: <PinScreen next={() => setPage("gallery")} startMusic={music.start} />,
    gallery: <Gallery next={() => setPage("letter")} />,
    letter: <Letter />,
  };
  return (
    <>
      <div className="app-shell">{pages[page]}</div>
      {page !== "intro" && (
        <SoundToggle playing={music.playing} onToggle={music.toggle} />
      )}
    </>
  );
}
