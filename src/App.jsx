import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";

function App() {
  const [stage, setStage] = useState("meme");
  const [currentMeme, setCurrentMeme] = useState(1);
  const [caughtEmojis, setCaughtEmojis] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [knockCount, setKnockCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("idle");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tiltPos, setTiltPos] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const knockAudioRef = useRef(null);

  const TOTAL_MEMES = 13;
  const TOTAL_EMOJIS = 5;
  const TOTAL_KNOCKS = 5;

  const actions = [
    { id: "idle", icon: "🐻", label: "Chill", color: "#8B6F47", shortcut: "1" },
    { id: "kiss", icon: "💋", label: "Kiss", color: "#FF1F6D", shortcut: "K" },
    { id: "hug", icon: "🤗", label: "Hug", color: "#FF6B9D", shortcut: "H" },
    { id: "dance", icon: "💃", label: "Dance", color: "#9B59B6", shortcut: "D" },
    { id: "sleep", icon: "😴", label: "Sleep", color: "#4A5568", shortcut: "S" },
    { id: "party", icon: "🎉", label: "Party", color: "#FFD93D", shortcut: "P" },
    { id: "wave", icon: "👋", label: "Wave", color: "#4ECDC4", shortcut: "W" },
  ];

  useEffect(() => {
    const randomMeme = Math.floor(Math.random() * TOTAL_MEMES) + 1;
    setCurrentMeme(randomMeme);
  }, []);

  useEffect(() => {
    if (stage !== "meme") return;
    const newEmojis = Array.from({ length: TOTAL_EMOJIS }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      vx: (Math.random() - 0.5) * 3 + (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() - 0.5) * 3 + (Math.random() > 0.5 ? 1 : -1),
      speed: 0.5 + Math.random() * 1.5,
    }));
    setEmojis(newEmojis);
  }, [stage]);

  useEffect(() => {
    if (stage !== "meme") return;
    const interval = setInterval(() => {
      setEmojis((prev) =>
        prev.map((emoji) => {
          if (caughtEmojis.includes(emoji.id)) return emoji;
          let newX = emoji.x + emoji.vx * emoji.speed;
          let newY = emoji.y + emoji.vy * emoji.speed;
          let newVx = emoji.vx;
          let newVy = emoji.vy;

          if (newX <= 5 || newX >= 92) {
            newVx = -emoji.vx;
            newX = Math.max(5, Math.min(92, newX));
          }
          if (newY <= 15 || newY >= 80) {
            newVy = -emoji.vy;
            newY = Math.max(15, Math.min(80, newY));
          }

          if (Math.random() < 0.02) {
            newVx = (Math.random() - 0.5) * 4;
            newVy = (Math.random() - 0.5) * 4;
          }

          return { ...emoji, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [stage, caughtEmojis]);

  useEffect(() => {
    if (caughtEmojis.length === TOTAL_EMOJIS) {
      setTimeout(() => {
        triggerHearts();
        setTimeout(() => setStage("knock"), 800);
      }, 500);
    }
  }, [caughtEmojis]);

  useEffect(() => {
    if (stage !== "experience") return;
    const handleMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [stage]);

  useEffect(() => {
    if (stage !== "experience") return;
    const handleKey = (e) => {
      const action = actions.find(
        (a) => a.shortcut.toLowerCase() === e.key.toLowerCase()
      );
      if (action) handleAction(action.id);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage, currentVideo]);

  const catchEmoji = (id) => {
    if (caughtEmojis.includes(id)) return;
    setCaughtEmojis((prev) => [...prev, id]);
    confetti({
      particleCount: 20,
      spread: 60,
      origin: {
        x: emojis.find((e) => e.id === id)?.x / 100 || 0.5,
        y: emojis.find((e) => e.id === id)?.y / 100 || 0.5,
      },
      colors: ["#FFD93D", "#FF6B9D", "#FF1F6D"],
      scalar: 0.8,
    });
  };

  const playKnockSound = () => {
    if (knockAudioRef.current) {
      knockAudioRef.current.currentTime = 0;
      knockAudioRef.current.volume = 0.7;
      knockAudioRef.current.play().catch(() => {});
      setTimeout(() => {
        if (knockAudioRef.current) {
          knockAudioRef.current.pause();
          knockAudioRef.current.currentTime = 0;
        }
      }, 500);
    }
  };

  const handleKnock = () => {
    if (knockCount >= TOTAL_KNOCKS) return;
    playKnockSound();
    const newCount = knockCount + 1;
    setKnockCount(newCount);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);

    if (newCount === TOTAL_KNOCKS) {
      setTimeout(() => {
        if (knockAudioRef.current) {
          knockAudioRef.current.pause();
          knockAudioRef.current.currentTime = 0;
        }
        triggerHearts();
        triggerConfetti("#FF1F6D");
        setTimeout(() => setStage("experience"), 1000);
      }, 500);
    }
  };

  const triggerConfetti = (color) => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: [color, "#FF6B9D", "#FFD93D", "#FF1F6D"],
      scalar: 1.3,
    });
  };

  const triggerHearts = () => {
    const scalar = 2;
    const heart = confetti.shapeFromText({ text: "💕", scalar });
    confetti({
      shapes: [heart],
      particleCount: 40,
      spread: 120,
      origin: { y: 0.6 },
      scalar,
      startVelocity: 35,
    });
  };

  const handleAction = (actionId) => {
    if (actionId === currentVideo) return;
    setIsTransitioning(true);
    const action = actions.find((a) => a.id === actionId);

    if (actionId === "kiss" || actionId === "hug") {
      setTimeout(() => triggerHearts(), 400);
    } else if (actionId === "party") {
      setTimeout(() => {
        triggerConfetti(action.color);
        setTimeout(() => triggerConfetti("#FF1F6D"), 200);
        setTimeout(() => triggerConfetti("#FFD93D"), 400);
      }, 400);
    } else if (actionId === "dance") {
      setTimeout(() => triggerConfetti(action.color), 400);
    }

    setTimeout(() => {
      setCurrentVideo(actionId);
      setIsTransitioning(false);
    }, 300);
  };

  const handleVideoEnd = () => {
    if (currentVideo !== "idle" && currentVideo !== "sleep") {
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentVideo("idle");
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  };

  const handleVideoTilt = (e) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTiltPos({ x, y });
  };

  const getKnockMessage = () => {
    if (knockCount === 0) return "Knock on the drawing to wake them up... 🚪";
    if (knockCount === 1) return "Hmm... did you hear that? 👂";
    if (knockCount === 2) return "Shhh... they might be sleeping 😴";
    if (knockCount === 3) return "Wait... something's moving! 👀";
    if (knockCount === 4) return "Almost there... one more knock! ✨";
    return "THEY'RE WAKING UP! 💥";
  };

  const isNight = currentVideo === "sleep";

  return (
    <>
      <audio ref={knockAudioRef} src="/knock.mp3" preload="auto" />

      {/* ============ STAGE 1: MEME + EMOJI HUNT ============ */}
      <AnimatePresence>
        {stage === "meme" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "fixed",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "20px",
              zIndex: 100,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none",
              }}
            />

            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 100, -100, 0],
                  y: [0, -100, 100, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 15 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background: ["#FF1F6D", "#9B59B6", "#4ECDC4"][i],
                  filter: "blur(120px)",
                  opacity: 0.4,
                  top: `${20 + i * 25}%`,
                  left: `${10 + i * 30}%`,
                  pointerEvents: "none",
                }}
              />
            ))}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                zIndex: 5,
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  padding: "16px",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow:
                    "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(255,31,109,0.2)",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={`/memes/meme${currentMeme}.jpg`}
                    alt="meme"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = `/memes/meme1.jpg`;
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  textAlign: "center",
                  padding: "20px 30px",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(18px, 3vw, 24px)",
                    fontWeight: "800",
                    color: "white",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Catch all 5 🤣 to unlock
                </h2>
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "500",
                  }}
                >
                  They're fast... good luck 😈
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  {[...Array(TOTAL_EMOJIS)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: caughtEmojis.length > i ? [1, 1.5, 1] : 1,
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          caughtEmojis.length > i
                            ? "linear-gradient(135deg, #FFD93D, #FF6B9D)"
                            : "rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        border:
                          caughtEmojis.length > i
                            ? "2px solid #FFD93D"
                            : "2px solid rgba(255,255,255,0.15)",
                        boxShadow:
                          caughtEmojis.length > i
                            ? "0 0 15px #FFD93D80"
                            : "none",
                      }}
                    >
                      {caughtEmojis.length > i ? "✓" : "?"}
                    </motion.div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#FFD93D",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  {caughtEmojis.length} / {TOTAL_EMOJIS} CAUGHT
                </div>
              </motion.div>
            </div>

            {emojis.map((emoji) => {
              if (caughtEmojis.includes(emoji.id)) return null;
              return (
                <motion.button
                  key={emoji.id}
                  onClick={() => catchEmoji(emoji.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  style={{
                    position: "fixed",
                    left: `${emoji.x}%`,
                    top: `${emoji.y}%`,
                    fontSize: `${40 + Math.random() * 20}px`,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    zIndex: 200,
                    filter: "drop-shadow(0 5px 20px rgba(255,215,0,0.6))",
                    userSelect: "none",
                    transition: "left 0.05s linear, top 0.05s linear",
                  }}
                >
                  🤣
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ STAGE 2: KNOCK KNOCK ============ */}
      <AnimatePresence>
        {stage === "knock" && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "fixed",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, #FFE4EC 0%, #FFB6C1 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "20px",
              zIndex: 90,
            }}
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
                style={{
                  position: "absolute",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${16 + Math.random() * 12}px`,
                  pointerEvents: "none",
                }}
              >
                {["💕", "💗", "❤️"][i % 3]}
              </motion.div>
            ))}

            <motion.h1
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: "900",
                margin: "0 0 20px 0",
                background:
                  "linear-gradient(135deg, #FF1F6D 0%, #C44569 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
                letterSpacing: "-1.5px",
              }}
            >
              Almost there... 🚪
            </motion.h1>

            <motion.div
              animate={
                isShaking
                  ? {
                      x: [0, -15, 15, -10, 10, 0],
                      y: [0, -5, 5, -3, 3, 0],
                      rotate: [0, -2, 2, -1, 1, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              onClick={handleKnock}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "450px",
                cursor: "pointer",
                padding: "20px 20px 60px 20px",
                background: "white",
                borderRadius: "20px",
                boxShadow:
                  "0 40px 100px rgba(255,31,109,0.35), 0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(-3deg)",
                  width: "80px",
                  height: "24px",
                  background: "rgba(255,215,0,0.7)",
                  borderRadius: "2px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                }}
              />

              <img
                src="/drawing-raw.jpg"
                alt="drawing"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  display: "block",
                  pointerEvents: "none",
                }}
              />

              <AnimatePresence>
                {isShaking && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      border: "4px solid #FF1F6D",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>

              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  fontSize: "18px",
                  color: "#8B4B6B",
                  fontWeight: "700",
                  fontStyle: "italic",
                }}
              >
                👆 TAP TO KNOCK
              </div>
            </motion.div>

            <motion.div
              key={knockCount}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: "24px",
                padding: "16px 28px",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: "700",
                color: "#C44569",
                textAlign: "center",
                boxShadow: "0 15px 40px rgba(255,31,109,0.2)",
                maxWidth: "400px",
              }}
            >
              {getKnockMessage()}
            </motion.div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
              }}
            >
              {[...Array(TOTAL_KNOCKS)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: knockCount > i ? [1, 1.5, 1] : 1,
                  }}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background:
                      knockCount > i
                        ? "linear-gradient(135deg, #FF1F6D, #FF6B9D)"
                        : "rgba(255,255,255,0.6)",
                    boxShadow:
                      knockCount > i ? "0 0 15px #FF1F6D80" : "none",
                    border: "2px solid rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ STAGE 3: MAIN EXPERIENCE ============ */}
      {stage === "experience" && (
        <div
          style={{
            width: "100%",
            minHeight: "100vh",
            background: isNight
              ? "radial-gradient(ellipse at center, #1A2E5C 0%, #0F1729 100%)"
              : "radial-gradient(ellipse at top, #FFE4EC 0%, #FFF0F5 40%, #FFEAA7 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            margin: 0,
            padding: "20px",
            position: "relative",
            transition: "background 1.5s ease",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
            boxSizing: "border-box",
          }}
        >
          <motion.div
            animate={{ x: mousePos.x - 12, y: mousePos.y - 12 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.5,
            }}
            style={{
              position: "fixed",
              width: 24,
              height: 24,
              pointerEvents: "none",
              zIndex: 1000,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 0 8px rgba(255,105,180,0.8))",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ x: mousePos.x - 8, y: mousePos.y - 8 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            style={{
              position: "fixed",
              fontSize: 14,
              pointerEvents: "none",
              zIndex: 999,
              opacity: 0.6,
            }}
          >
            💕
          </motion.div>

          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`petal-${i}`}
              initial={{
                y: -50,
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 0,
              }}
              animate={{
                y: window.innerHeight + 50,
                x: Math.random() * window.innerWidth,
                rotate: 360,
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear",
              }}
              style={{
                position: "fixed",
                fontSize: `${16 + Math.random() * 12}px`,
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              {["🌸", "🌺", "💮"][i % 3]}
            </motion.div>
          ))}

          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              position: "relative",
            }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                textAlign: "center",
                marginBottom: "20px",
                width: "100%",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: "900",
                  margin: 0,
                  letterSpacing: "-2px",
                  background: isNight
                    ? "linear-gradient(135deg, #E8F4F8 0%, #B8C6DB 100%)"
                    : "linear-gradient(135deg, #FF1F6D 0%, #FF6B9D 50%, #C88A4A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                Two Hearts, One Story
              </h1>
            </motion.div>

            <motion.div
              ref={videoContainerRef}
              onMouseMove={handleVideoTilt}
              onMouseLeave={() => setTiltPos({ x: 0, y: 0 })}
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                rotateY: tiltPos.x,
                rotateX: tiltPos.y,
              }}
              transition={{
                scale: { duration: 0.8, delay: 0.3 },
                opacity: { duration: 0.8, delay: 0.3 },
                y: { duration: 0.8, delay: 0.3 },
                rotateY: { type: "spring", stiffness: 300, damping: 30 },
                rotateX: { type: "spring", stiffness: 300, damping: 30 },
              }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
                padding: "20px 20px 50px 20px",
                background: isNight
                  ? "linear-gradient(135deg, #2D3561 0%, #1E2A5E 100%)"
                  : "linear-gradient(135deg, #FFFFFF 0%, #FFF5F8 100%)",
                borderRadius: "20px",
                boxShadow: isNight
                  ? "0 40px 100px rgba(0,0,0,0.6), 0 0 100px rgba(100,120,200,0.3)"
                  : "0 40px 100px rgba(255,31,109,0.25), 0 20px 60px rgba(0,0,0,0.15)",
                transformStyle: "preserve-3d",
                transformPerspective: 1000,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(-3deg)",
                  width: "80px",
                  height: "24px",
                  background: "rgba(255,215,0,0.6)",
                  borderRadius: "2px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  zIndex: 5,
                }}
              />

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.video
                    key={currentVideo}
                    ref={videoRef}
                    src={`/${currentVideo}.mp4`}
                    autoPlay
                    loop={currentVideo === "idle" || currentVideo === "sleep"}
                    muted={isMuted}
                    playsInline
                    onEnded={handleVideoEnd}
                    initial={{ opacity: 0, scale: 1.1, filter: "blur(30px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                    transition={{
                      duration: 0.7,
                      ease: [0.43, 0.13, 0.23, 0.96],
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </AnimatePresence>

                <AnimatePresence>
                  {isTransitioning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.8, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,105,180,0.6) 40%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(15px)",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 20,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {isMuted ? "🔇" : "🔊"}
                </motion.button>

                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    padding: "6px 12px",
                    background: "rgba(255,31,109,0.9)",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "800",
                    color: "white",
                    letterSpacing: "1.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 15px rgba(255,31,109,0.4)",
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "white",
                    }}
                  />
                  LIVE
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  fontSize: "20px",
                  color: isNight ? "#B8C6DB" : "#8B4B6B",
                  fontWeight: "600",
                  fontStyle: "italic",
                }}
              >
                {currentVideo === "kiss" && "~ a little moment ~"}
{currentVideo === "hug" && "~ warmest place on earth ~"}
{currentVideo === "idle" && "~ just chilling ~"}
{currentVideo === "dance" && "~ vibes on ~"}
{currentVideo === "sleep" && "~ goodnight ~"}
{currentVideo === "party" && "~ celebration mode ~"}
{currentVideo === "wave" && "~ hey there ~"}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                marginTop: "28px",
                padding: "18px",
                background: isNight
                  ? "rgba(30, 42, 94, 0.7)"
                  : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(30px)",
                borderRadius: "28px",
                border: isNight
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 25px 60px rgba(255, 31, 109, 0.15)",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                maxWidth: "700px",
              }}
            >
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "16px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background:
                      currentVideo === action.id
                        ? `linear-gradient(135deg, ${action.color} 0%, ${action.color}CC 100%)`
                        : isNight
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.95)",
                    color:
                      currentVideo === action.id
                        ? "white"
                        : isNight
                        ? "white"
                        : "#5A3E1B",
                    boxShadow:
                      currentVideo === action.id
                        ? `0 15px 35px ${action.color}70`
                        : "0 4px 15px rgba(0,0,0,0.06)",
                    letterSpacing: "0.3px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{action.icon}</span>
                  <span>{action.label}</span>
                  <span
                    style={{
                      marginLeft: "4px",
                      padding: "2px 6px",
                      background:
                        currentVideo === action.id
                          ? "rgba(255,255,255,0.25)"
                          : isNight
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.06)",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "800",
                      opacity: 0.8,
                    }}
                  >
                    {action.shortcut}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
