document.addEventListener('DOMContentLoaded', function () {
  // Initialize AOS
  AOS.init({ duration: 1000, once: true, offset: 100 });

  // Navbar
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Elements
  const form = document.getElementById('pledgeForm');
  const voiceBtn = document.getElementById('voiceBtn');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const aiAnalysis = document.getElementById('aiAnalysis');
  const analyzingIndicator = document.getElementById('analyzingIndicator');
  const submitBtn = document.getElementById('submitBtn');
  const commitmentsContainer = document.getElementById('commitmentsContainer');
  const noPledges = document.getElementById('noPledges');
  const totalPledgesEl = document.getElementById('totalPledges');
  const totalImpactEl = document.getElementById('totalImpact');

  let recognition = null;
  let isListening = false;

  // Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      document.getElementById('message').value = transcript;
      toggleVoice();
      analyzeAI(transcript);
    };
    recognition.onerror = () => toggleVoice();
    recognition.onend = () => { if (isListening) toggleVoice(); };
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice not supported";
  }

  function toggleVoice() {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      isListening = false;
      voiceBtn.classList.remove('listening');
      voiceBtn.innerHTML = '<span class="mic-icon">Microphone</span> Voice Input';
      listeningIndicator.style.display = 'none';
    } else {
      recognition.start();
      isListening = true;
      voiceBtn.classList.add('listening');
      voiceBtn.innerHTML = '<span class="mic-icon">Stop</span> Stop';
      listeningIndicator.style.display = 'flex';
    }
  }

  voiceBtn.addEventListener('click', toggleVoice);

  // AI Analysis
  function analyzeAI(text) {
    if (text.trim().length < 15) {
      aiAnalysis.style.display = 'none';
      return;
    }
    analyzingIndicator.style.display = 'block';
    setTimeout(() => {
      const categories = ['Education','Environment','Healthcare','Technology','Economic Development','Social Justice','Infrastructure','Agriculture'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const impact = Math.floor(60 + Math.random() * 41);

      document.getElementById('aiCategory').textContent = cat;
      document.getElementById('aiSentiment').textContent = impact > 80 ? 'Very Positive' : 'Positive';
      document.getElementById('aiImpactScore').textContent = impact + '/100';
      document.getElementById('category').value = cat;

      aiAnalysis.style.display = 'block';
      analyzingIndicator.style.display = 'none';
    }, 1800);
  }

  document.getElementById('message').addEventListener('input', (e) => analyzeAI(e.target.value));

  // Commitments
  function loadCommitments() {
    const saved = JSON.parse(localStorage.getItem('commitments') || '[]');
    commitmentsContainer.innerHTML = '';
    noPledges.style.display = saved.length === 0 ? 'block' : 'none';

    let totalImpact = 0;
    saved.forEach((c, i) => {
      const impact = Math.floor(Math.random() * 41) + 60;
      totalImpact += impact;
      addCommitmentCard(c, i * 150);
    });

    totalPledgesEl.textContent = saved.length;
    totalImpactEl.textContent = totalImpact;
  }

  function addCommitmentCard(data, delay = 0) {
    const card = document.createElement('div');
    card.className = 'commitment-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', delay);
    card.innerHTML = `
      <div class="commitment-name">${escapeHtml(data.name)}</div>
      <div class="commitment-message">"${escapeHtml(data.message)}"</div>
      <div class="commitment-meta">
        <span>${new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span class="commitment-category">${data.category}</span>
      </div>
    `;
    commitmentsContainer.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 100);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';

    const data = {
      name: document.getElementById('name').value.trim(),
      message: document.getElementById('message').value.trim(),
      category: document.getElementById('category').value,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem('commitments') || '[]');
      saved.unshift(data);
      localStorage.setItem('commitments', JSON.stringify(saved));

      addCommitmentCard(data, 0);
      noPledges.style.display = 'none';

      // Update stats
      const total = saved.length;
      const impact = Math.floor(Math.random() * 41) + 60;
      totalPledgesEl.textContent = total;
      totalImpactEl.textContent = parseInt(totalImpactEl.textContent) + impact;

      form.reset();
      aiAnalysis.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Submit Commitment</span><i class="fas fa-arrow-right"></i>';
      AOS.refresh();
    }, 2000);
  });

  // Init
  loadCommitments();
});