/* ===========================================================
   EDIT HERE: name, letter, moments photos
   =========================================================== */
const CONFIG = {
  name: "Babe",
  letterTitle: "happy birthday, my love",
  letterPhoto: "", // Photo displayed on the letter page
  letter: [
    "Happy birthday to my favourite person!!",
    "Thank you for being my best friend for the past 7 years or so—I don't even know the exact number anymore. I still don't know how you became such a big part of my life, though I remember how you came into it.",
    "I hope this year brings you more joy, more strength, and every new beginning you've been praying for."
  ],
  signOff: "With love,\nAkku",
  photos: [
    { src: "fav moment.jpg", caption: "My fav Moment of you" },
    { src: "laughs.jpg", caption: "Smiles & laughter" }
  ]
};

(function(){
  const $ = s => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* content */
  const lb = $("#letterBody");
  if (CONFIG.letterPhoto) {
    $("#letterPhoto").innerHTML = '<img src="' + CONFIG.letterPhoto + '" alt="A photo of the two of us">';
  } else {
    $("#letterPhoto").innerHTML = "";
  }
  CONFIG.letter.forEach(t => {
    const p = document.createElement("p");
    p.textContent = t;
    lb.appendChild(p);
  });
  if (CONFIG.signOff) {
    $("#signOff").innerHTML = CONFIG.signOff.replace(/\n/g, "<br>");
  } else {
    $("#signOff").hidden = true;
  }
  $("#endName").textContent = CONFIG.name;
  document.title = "Happy Birthday, " + CONFIG.name;

  /* moments frames */
  const frames = $("#frames");
  if (frames) {
    CONFIG.photos.forEach(ph => {
      const fig = document.createElement("figure");
      fig.className = "polaroid";
      const shot = document.createElement("div");
      if (ph.src) {
        shot.className = "shot";
        if (ph.src.endsWith("moments.mp4") || ph.src.endsWith("moments.webm")) {
          const vid = document.createElement("video");
          vid.src = ph.src;
          vid.autoplay = true;
          vid.loop = true;
          vid.muted = true;
          vid.playsInline = true;
          shot.appendChild(vid);
        } else {
          const im = document.createElement("img");
          im.src = ph.src;
          im.alt = ph.caption || "";
          shot.appendChild(im);
        }
      } else {
        shot.className = "shot placeholder";
        shot.innerHTML = '<svg viewBox="0 0 100 100" width="46" height="46" aria-hidden="true"><path d="M50 84C30 70 14 58 14 42a20 20 0 0 1 36-12 20 20 0 0 1 36 12c0 16-16 28-36 42Z" fill="#C98A93" opacity=".6"/></svg><span>Photo coming soon</span>';
      }
      const cap = document.createElement("figcaption");
      cap.className = "cap";
      cap.textContent = ph.caption || "";
      fig.append(shot, cap);
      frames.appendChild(fig);
    });
  }

  /* navigation */
  function go(id){
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id));
    window.scrollTo({top:0, behavior: reduce ? "auto" : "smooth"});
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-go]");
    if (!t) return;
    const key = t.dataset.key;
    if (key) mark(key);
    go(t.dataset.go);
  });

  /* confetti */
  function confetti(n){
    if (reduce) return;
    const colors = ["#2A3676","#E8C35C","#C9D0EC","#8FB8E8","#E9A9B8"];
    for (let i=0;i<(n||34);i++){
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random()*100 + "vw";
      c.style.background = colors[i % colors.length];
      document.body.appendChild(c);
      c.animate([{transform:"translateY(0) rotate(0)",opacity:1},
                 {transform:"translateY(106vh) rotate("+(360+Math.random()*540)+"deg)",opacity:.9}],
                {duration:2200+Math.random()*1700, easing:"cubic-bezier(.3,.6,.5,1)"}).onfinish = () => c.remove();
    }
  }

  /* cake & blow detection */
  const cake = $("#cakeBtn");
  let extinguished = false;
  let audioStream = null;
  let audioCtx = null;

  function stopAudio() {
    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
      audioStream = null;
    }
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close();
      audioCtx = null;
    }
  }

  function extinguishCandle() {
    if (extinguished) return;
    extinguished = true;
    stopAudio();
    cake.classList.remove("flicker");
    cake.classList.add("out");
    $("#cakeHint").textContent = "wish made! 🤍✨";
    const micWrap = $("#micPromptWrap");
    if (micWrap) micWrap.innerHTML = "";
    confetti(42);
    // Take directly to page 2 (s-ask) after celebration delay
    setTimeout(() => go("s-ask"), 1200);
  }

  // Candle only blows out via microphone detection (touch/click removed)
  $("#toAsk").addEventListener("click", () => go("s-ask"));

  async function startBlowDetection() {
    if (extinguished) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      const source = audioCtx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let rushCount = 0;

      const micWrap = $("#micPromptWrap");
      if (micWrap) {
        micWrap.innerHTML = '<span class="mic-live"><span class="mic-dot"></span> Mic listening — blow into your mic! 🌬️</span>';
      }

      function checkAudio() {
        if (extinguished) {
          stopAudio();
          return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Wind / rushing breath noise has heavy low-frequency energy (approx 60-400Hz)
        let lowEnergy = 0;
        for (let i = 1; i <= 6; i++) {
          lowEnergy += dataArray[i];
        }
        let lowAvg = lowEnergy / 6;

        let totalEnergy = 0;
        for (let i = 0; i < bufferLength; i++) {
          totalEnergy += dataArray[i];
        }
        let totalAvg = totalEnergy / bufferLength;

        // Sound level reaches the level of rushing wind
        if (lowAvg > 100 && totalAvg > 70) {
          rushCount++;
          cake.classList.add("flicker");
          if (rushCount >= 4) { // Sustained for ~120-150ms
            extinguishCandle();
            return;
          }
        } else {
          rushCount = Math.max(0, rushCount - 1);
          if (rushCount === 0) {
            cake.classList.remove("flicker");
          }
        }

        requestAnimationFrame(checkAudio);
      }

      checkAudio();
    } catch (err) {
      console.log("Microphone access unavailable or denied:", err);
      const micWrap = $("#micPromptWrap");
      if (micWrap) {
        micWrap.innerHTML = '<button class="btn ghost small-btn" id="micEnableBtn" type="button">🎤 enable mic to blow</button>';
      }
    }
  }

  const micWrap = $("#micPromptWrap");
  if (micWrap) {
    micWrap.addEventListener("click", e => {
      if (e.target.closest("#micEnableBtn")) {
        e.stopPropagation();
        startBlowDetection();
      }
    });
  }

  // Attempt auto-start where permissions allow
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startBlowDetection();
  }

  /* yes / no */
  const noBtn = $("#noBtn");
  let dodges = 0;
  function dodge(e){
    if (dodges >= 5) return;
    dodges++;
    if (e) e.preventDefault();
    const x = (Math.random()*220 - 110);
    const y = (Math.random()*120 - 40);
    noBtn.style.transform = "translate(" + x + "px," + y + "px) scale(" + (1 - dodges*0.09) + ")";
    if (dodges === 5) noBtn.textContent = "fine, no";
  }
  noBtn.addEventListener("pointerdown", dodge);
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener("click", e => {
    if (dodges < 5){ dodge(e); return; }
    go("s-no");
    noBtn.style.transform = ""; noBtn.textContent = "no"; dodges = 0;
  });
  $("#yesBtn").addEventListener("click", () => { confetti(30); go("s-bouquet"); });

  /* gift progress */
  const opened = new Set();
  function mark(key){
    if (opened.has(key)) return;
    opened.add(key);
    const card = document.querySelector('[data-key="'+key+'"]');
    if (card) card.classList.add("opened");
    if (opened.size === 2){
      $("#giftsSub").textContent = "that's everything — one last page";
      $("#toEnd").hidden = false;
    }
  }
  $("#toEnd").addEventListener("click", () => { go("s-end"); confetti(50); });
})();
