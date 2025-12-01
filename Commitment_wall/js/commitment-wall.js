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

  // Global variables
  let commitments = [];
  let currentInputMethod = 'voice';
  let uploadedVideoFile = null;
  let uploadedVideoDataURL = null;
  let recognition = null;
  let isListening = false;

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

  // Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('message').value = transcript;
      toggleVoice();
      analyzeAI(transcript);
    };

    recognition.onerror = function() {
      toggleVoice();
      alert('Voice recognition failed. Please try again or type your commitment.');
    };

    recognition.onend = function() {
      if (isListening) toggleVoice();
    };
  } else {
    if (voiceBtn) {
      voiceBtn.disabled = true;
      voiceBtn.title = "Voice not supported in this browser";
    }
  }

  // Toggle Voice Input
  function toggleVoice() {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      isListening = false;
      voiceBtn.classList.remove('listening');
      voiceBtn.innerHTML = '<span class="mic-icon">🎤</span> Start Voice Input';
      listeningIndicator.style.display = 'none';
    } else {
      recognition.start();
      isListening = true;
      voiceBtn.classList.add('listening');
      voiceBtn.innerHTML = '<span class="mic-icon">🛑</span> Stop Recording';
      listeningIndicator.style.display = 'flex';
    }
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', toggleVoice);
  }

  // Input Method Selection (Voice/Video toggle)
  document.querySelectorAll('input[name="inputType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      currentInputMethod = this.value;
    });
  });

  // Video Upload Handling - Use setTimeout to ensure inline script runs first
  setTimeout(() => {
    const videoUpload = document.getElementById('videoUpload');
    if (videoUpload) {
      // Remove any existing listeners
      const newVideoUpload = videoUpload.cloneNode(true);
      videoUpload.parentNode.replaceChild(newVideoUpload, videoUpload);
      
      newVideoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('Video file is too large. Please upload a video under 50MB.');
          this.value = '';
          return;
        }

        uploadedVideoFile = file;

        // Create preview
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedVideoDataURL = event.target.result;
          const previewPlayer = document.getElementById('previewPlayer');
          if (previewPlayer) {
            previewPlayer.src = uploadedVideoDataURL;
            const videoPreview = document.getElementById('videoPreview');
            if (videoPreview) {
              videoPreview.style.display = 'block';
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, 100);

  // AI Analysis Function
  function analyzeAI(text) {
    if (!text || text.trim().length < 15) {
      if (aiAnalysis) aiAnalysis.style.display = 'none';
      return;
    }

    if (analyzingIndicator) analyzingIndicator.style.display = 'block';

    // Simulate AI analysis
    setTimeout(() => {
      const categories = ['Education', 'Environment', 'Healthcare', 'Technology', 'Economic Development', 'Social Justice', 'Infrastructure', 'Agriculture'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const positiveWords = ['empower', 'improve', 'support', 'develop', 'transform', 'innovate', 'create', 'build', 'enhance', 'strengthen'];
      const isPositive = positiveWords.some(word => text.toLowerCase().includes(word));
      const sentiment = isPositive ? 'Very Positive' : 'Positive';
      
      const impactScore = Math.floor(Math.random() * 41) + 60;

      document.getElementById('aiCategory').textContent = randomCategory;
      document.getElementById('aiSentiment').textContent = sentiment;
      document.getElementById('aiImpactScore').textContent = impactScore + '/100';

      // Set category dropdown
      document.getElementById('category').value = randomCategory;

      if (analyzingIndicator) analyzingIndicator.style.display = 'none';
      if (aiAnalysis) aiAnalysis.style.display = 'block';
    }, 1800);
  }

  // Text input analysis
  const messageInput = document.getElementById('message');
  if (messageInput) {
    messageInput.addEventListener('input', function(e) {
      if (e.target.value.length > 50) {
        analyzeAI(e.target.value);
      }
    });
  }

  // Display Commitments
  function displayCommitments() {
    if (!commitmentsContainer) return;

    if (commitments.length === 0) {
      if (noPledges) noPledges.style.display = 'block';
      commitmentsContainer.innerHTML = '';
      return;
    }

    if (noPledges) noPledges.style.display = 'none';
    commitmentsContainer.innerHTML = '';

    commitments.forEach((commitment, index) => {
      const card = document.createElement('div');
      card.className = 'commitment-card';
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', (index * 100).toString());

      let videoHTML = '';
      if (commitment.inputMethod === 'video' && commitment.videoData) {
        videoHTML = `
          <div class="commitment-video">
            <video controls style="width:100%; border-radius:10px; margin:10px 0;">
              <source src="${commitment.videoData}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="commitment-header">
          <div>
            <div class="commitment-name">${escapeHtml(commitment.name)}</div>
            <div class="commitment-company">${escapeHtml(commitment.company)}</div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <div class="commitment-category">${commitment.category}</div>
            <button type="button" class="edit-btn" data-index="${index}">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="delete-btn" data-index="${index}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        ${videoHTML}
        <div class="commitment-message">"${escapeHtml(commitment.message)}"</div>
        <div class="commitment-footer">
          <div class="commitment-date">${commitment.date}</div>
          <div class="commitment-ai">
            <div class="ai-badge-small">${commitment.aiSentiment || 'Positive'}</div>
            <div class="ai-badge-small">${commitment.aiImpact || '75/100'}</div>
          </div>
        </div>
      `;

      commitmentsContainer.appendChild(card);
    });

    // Add edit and delete button event listeners with setTimeout to ensure DOM is ready
    setTimeout(() => {
      const editButtons = document.querySelectorAll('.edit-btn');
      editButtons.forEach(btn => {
        btn.onclick = () => {
          const index = parseInt(btn.getAttribute('data-index'));
          editPledge(index);
        };
      });

      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(btn => {
        btn.onclick = () => {
          const index = parseInt(btn.getAttribute('data-index'));
          deletePledge(index);
        };
      });
    }, 50);

    AOS.refresh();
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Update Stats
  function updateStats() {
    if (totalPledgesEl) totalPledgesEl.textContent = commitments.length;
    const totalImpact = commitments.reduce((sum, c) => {
      const score = parseInt(c.aiImpact.split('/')[0]) || 0;
      return sum + score;
    }, 0);
    if (totalImpactEl) totalImpactEl.textContent = totalImpact;
  }

  // Load Commitments from localStorage
  function loadCommitments() {
    const saved = JSON.parse(localStorage.getItem('commitments') || '[]');
    commitments = saved;
    displayCommitments();
    updateStats();
  }

  // Generate unique 6-digit passcode
  function generatePasscode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Show passcode modal
  function showPasscodeModal(passcode, name) {
    const modal = document.createElement('div');
    modal.className = 'passcode-modal';
    modal.innerHTML = `
      <div class="passcode-modal-content">
        <div class="passcode-header">
          <i class="fas fa-lock"></i>
          <h3>Your Security Passcode</h3>
        </div>
        <div class="passcode-body">
          <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
          <p>Your pledge has been submitted successfully!</p>
          <p>Please save this passcode to edit or delete your pledge later:</p>
          <div class="passcode-display">${passcode}</div>
          <div class="passcode-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Keep this passcode safe! You'll need it to manage your pledge.</span>
          </div>
          <button class="copy-passcode-btn" onclick="copyPasscode('${passcode}')">
            <i class="fas fa-copy"></i> Copy Passcode
          </button>
        </div>
        <button class="close-modal-btn" onclick="closePasscodeModal()">
          Got it!
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Copy passcode to clipboard
  window.copyPasscode = function(passcode) {
    navigator.clipboard.writeText(passcode).then(() => {
      alert('✅ Passcode copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = passcode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Passcode copied to clipboard!');
    });
  };

  // Close passcode modal
  window.closePasscodeModal = function() {
    const modal = document.querySelector('.passcode-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  };

  // Edit Pledge Function
  function editPledge(index) {
    const commitment = commitments[index];
    
    // Prompt for passcode
    const passcode = prompt('🔒 Enter your security passcode to edit this pledge:');
    
    if (!passcode) return;
    
    if (passcode !== commitment.passcode) {
      alert('❌ Invalid passcode! You cannot edit this pledge.');
      return;
    }
    
    // Passcode is correct, show edit modal
    showEditModal(commitment, index);
  }

  // Show Edit Modal
  function showEditModal(commitment, index) {
    const modal = document.createElement('div');
    modal.className = 'passcode-modal';
    modal.innerHTML = `
      <div class="passcode-modal-content" style="max-width: 600px;">
        <div class="passcode-header">
          <i class="fas fa-edit"></i>
          <h3>Edit Your Pledge</h3>
        </div>
        <div class="passcode-body">
          <form id="editPledgeForm" style="text-align: left;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Name *</label>
              <input type="text" id="editName" value="${escapeHtml(commitment.name)}" 
                style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" required />
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Company *</label>
              <input type="text" id="editCompany" value="${escapeHtml(commitment.company)}" 
                style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" required />
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email *</label>
              <input type="email" id="editEmail" value="${escapeHtml(commitment.email)}" 
                style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" required />
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Message *</label>
              <textarea id="editMessage" rows="4" 
                style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" required>${escapeHtml(commitment.message)}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Category *</label>
              <select id="editCategory" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" required>
                <option value="Education" ${commitment.category === 'Education' ? 'selected' : ''}>Education</option>
                <option value="Environment" ${commitment.category === 'Environment' ? 'selected' : ''}>Environment</option>
                <option value="Healthcare" ${commitment.category === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                <option value="Technology" ${commitment.category === 'Technology' ? 'selected' : ''}>Technology</option>
                <option value="Economic Development" ${commitment.category === 'Economic Development' ? 'selected' : ''}>Economic Development</option>
                <option value="Social Justice" ${commitment.category === 'Social Justice' ? 'selected' : ''}>Social Justice</option>
                <option value="Infrastructure" ${commitment.category === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
                <option value="Agriculture" ${commitment.category === 'Agriculture' ? 'selected' : ''}>Agriculture</option>
              </select>
            </div>
          </form>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button class="close-modal-btn" style="flex: 1; background: #6c757d;" onclick="closePasscodeModal()">
            Cancel
          </button>
          <button class="close-modal-btn" style="flex: 1;" onclick="saveEditedPledge(${index})">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Save Edited Pledge
  window.saveEditedPledge = function(index) {
    const editedCommitment = {
      ...commitments[index],
      name: document.getElementById('editName').value.trim(),
      company: document.getElementById('editCompany').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      message: document.getElementById('editMessage').value.trim(),
      category: document.getElementById('editCategory').value,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' (Edited)'
    };

    // Update commitments array
    commitments[index] = editedCommitment;

    // Save to localStorage
    localStorage.setItem('commitments', JSON.stringify(commitments));

    // Refresh display
    displayCommitments();
    updateStats();

    // Close modal
    closePasscodeModal();

    // Show success message
    alert('✅ Pledge updated successfully!');
  };

  // Delete Pledge Function
  function deletePledge(index) {
    const commitment = commitments[index];
    
    // Prompt for passcode
    const passcode = prompt('🔒 Enter your security passcode to delete this pledge:');
    
    if (!passcode) return;
    
    if (passcode !== commitment.passcode) {
      alert('❌ Invalid passcode! You cannot delete this pledge.');
      return;
    }
    
    console.log('Delete button clicked for index:', index);
    console.log('Current commitments:', commitments.length);
    
    if (confirm('⚠️ Are you sure you want to delete this pledge?\n\nThis action cannot be undone.')) {
      // Remove from array
      commitments.splice(index, 1);
      
      // Update localStorage
      localStorage.setItem('commitments', JSON.stringify(commitments));
      
      // Refresh display
      displayCommitments();
      updateStats();
      
      // Show confirmation
      alert('✅ Pledge deleted successfully!');
      
      console.log('Pledge deleted. Remaining:', commitments.length);
    }
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';

      const name = document.getElementById('name').value.trim();
      const company = document.getElementById('company').value.trim();
      const email = document.getElementById('email').value.trim();
      const category = document.getElementById('category').value;

      // Check which input method is selected
      const selectedRadio = document.querySelector('input[name="inputType"]:checked');
      if (selectedRadio) {
        currentInputMethod = selectedRadio.value;
      }

      let message = '';
      
      if (currentInputMethod === 'voice') {
        message = document.getElementById('message').value.trim();
        if (!message) {
          alert('Please provide your pledge message by typing or using voice input.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
          return;
        }
      } else if (currentInputMethod === 'video') {
        // Check if video file exists
        const videoUploadInput = document.getElementById('videoUpload');
        const videoFile = videoUploadInput && videoUploadInput.files[0];
        
        if (!videoFile && !uploadedVideoFile) {
          alert('Please upload a video file or switch to voice input.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
          return;
        }
        
        // If we have a file but no dataURL yet, read it now
        if (videoFile && !uploadedVideoDataURL) {
          const reader = new FileReader();
          reader.onload = function(event) {
            uploadedVideoDataURL = event.target.result;
            uploadedVideoFile = videoFile;
            // Retry submission after loading video
            form.dispatchEvent(new Event('submit'));
          };
          reader.readAsDataURL(videoFile);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
          return;
        }
        
        message = 'Video Pledge - ' + (uploadedVideoFile ? uploadedVideoFile.name : videoFile.name);
      }

      if (!category) {
        alert('Please select a category.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
        return;
      }

      // Generate unique security passcode
      const securityPasscode = generatePasscode();

      const commitment = {
        id: Date.now() + Math.random().toString(36).substr(2, 9), // Unique ID
        name,
        company,
        email,
        message,
        category,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: new Date().toISOString(),
        inputMethod: currentInputMethod,
        videoData: currentInputMethod === 'video' ? uploadedVideoDataURL : null,
        aiCategory: document.getElementById('aiCategory').textContent || category,
        aiSentiment: document.getElementById('aiSentiment').textContent || 'Positive',
        aiImpact: document.getElementById('aiImpactScore').textContent || '75/100',
        passcode: securityPasscode
      };

      // Simulate submission delay
      setTimeout(() => {
        // Save to localStorage
        const saved = JSON.parse(localStorage.getItem('commitments') || '[]');
        saved.unshift(commitment);
        localStorage.setItem('commitments', JSON.stringify(saved));

        commitments = saved;
        displayCommitments();
        updateStats();

        // Reset form
        form.reset();
        if (aiAnalysis) aiAnalysis.style.display = 'none';
        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview) videoPreview.style.display = 'none';
        const previewPlayer = document.getElementById('previewPlayer');
        if (previewPlayer) previewPlayer.src = '';
        
        uploadedVideoFile = null;
        uploadedVideoDataURL = null;
        currentInputMethod = 'voice';

        // Reset to voice section
        const voiceSection = document.getElementById('voiceSection');
        const videoSection = document.getElementById('videoSection');
        if (voiceSection) voiceSection.style.display = 'block';
        if (videoSection) videoSection.style.display = 'none';

        // Check voice radio button
        const voiceRadio = document.querySelector('input[name="inputType"][value="voice"]');
        if (voiceRadio) voiceRadio.checked = true;

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';

        // Show passcode to user
        showPasscodeModal(securityPasscode, name);
        
        // Scroll to the wall to see the new commitment
        setTimeout(() => {
          const wallSection = document.querySelector('.wall-section');
          if (wallSection) wallSection.scrollIntoView({ behavior: 'smooth' });
        }, 3000);
      }, 2000);
    });
  }

  // Export to Excel Function
  function exportToExcel() {
    if (commitments.length === 0) {
      alert('❌ No pledges to export yet! Please add some commitments first.');
      return;
    }

    // Prepare data for Excel
    const excelData = commitments.map((commitment, index) => {
      return {
        'No': index + 1,
        'Name': commitment.name,
        'Company': commitment.company,
        'Email': commitment.email,
        'Message': commitment.message,
        'Category': commitment.category,
        'Input Method': commitment.inputMethod,
        'AI Category': commitment.aiCategory,
        'AI Sentiment': commitment.aiSentiment,
        'AI Impact Score': commitment.aiImpact,
        'Date': commitment.date,
        'Timestamp': commitment.timestamp
      };
    });

    // Convert to CSV format
    const headers = Object.keys(excelData[0]);
    let csvContent = '\uFEFF'; // UTF-8 BOM for proper Excel encoding
    csvContent += headers.join(',') + '\n';

    excelData.forEach(row => {
      const values = headers.map(header => {
        let value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value + '"';
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Simply_Complex_Africa_Pledges_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert('✅ Excel file downloaded successfully! Check your downloads folder.');
  }

  // Add export button event listener
  const exportBtn = document.getElementById('exportExcelBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      console.log('Export button clicked! Total commitments:', commitments.length);
      exportToExcel();
    });// ========================================
    // Simply Complex Africa™ - Commitment Wall
    // Clean, Modern, Fully Working JavaScript
    // ========================================
    
    document.addEventListener('DOMContentLoaded', function () {
      
      // ========================================
      // INITIALIZE AOS ANIMATION
      // ========================================
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true, offset: 100 });
      }
    
      // ========================================
      // NAVBAR FUNCTIONALITY
      // ========================================
      const navbar = document.getElementById('navbar');
      const hamburger = document.getElementById('hamburger');
      const navMenu = document.getElementById('nav-menu');
    
      if (navbar) {
        window.addEventListener('scroll', () => {
          navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
      }
    
      if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
          hamburger.classList.toggle('active');
          navMenu.classList.toggle('active');
        });
      }
    
      // ========================================
      // GLOBAL STATE
      // ========================================
      let commitments = [];
      let currentInputMethod = 'voice';
      let uploadedVideoBase64 = null;
      let uploadedVideoFile = null;
      let recognition = null;
      let isListening = false;
    
      // ========================================
      // DOM ELEMENTS
      // ========================================
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
      const exportBtn = document.getElementById('exportExcelBtn');
    
      // ========================================
      // SPEECH RECOGNITION SETUP
      // ========================================
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
    
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          const messageField = document.getElementById('message');
          if (messageField) {
            messageField.value = transcript;
            analyzeAI(transcript);
          }
          toggleVoice();
        };
    
        recognition.onerror = function() {
          toggleVoice();
          alert('❌ Voice recognition failed. Please try again or type your pledge.');
        };
    
        recognition.onend = function() {
          if (isListening) toggleVoice();
        };
      } else {
        if (voiceBtn) {
          voiceBtn.disabled = true;
          voiceBtn.title = "Voice not supported in this browser";
        }
      }
    
      // ========================================
      // VOICE INPUT TOGGLE
      // ========================================
      function toggleVoice() {
        if (!recognition || !voiceBtn || !listeningIndicator) return;
        
        if (isListening) {
          recognition.stop();
          isListening = false;
          voiceBtn.classList.remove('listening');
          voiceBtn.innerHTML = '<span class="mic-icon">🎤</span> Start Voice Input';
          listeningIndicator.style.display = 'none';
        } else {
          recognition.start();
          isListening = true;
          voiceBtn.classList.add('listening');
          voiceBtn.innerHTML = '<span class="mic-icon">🛑</span> Stop Recording';
          listeningIndicator.style.display = 'flex';
        }
      }
    
      if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleVoice);
      }
    
      // ========================================
      // INPUT METHOD SELECTION (Voice/Video)
      // ========================================
      document.querySelectorAll('input[name="inputType"]').forEach(radio => {
        radio.addEventListener('change', function() {
          currentInputMethod = this.value;
        });
      });
    
      // ========================================
      // VIDEO UPLOAD HANDLER
      // ========================================
      setTimeout(() => {
        const videoUpload = document.getElementById('videoUpload');
        if (videoUpload) {
          videoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
    
            // Check file size (50MB limit)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
              alert('❌ Video file is too large. Please upload a video under 50MB.');
              this.value = '';
              return;
            }
    
            uploadedVideoFile = file;
    
            // Convert to Base64 for storage
            const reader = new FileReader();
            reader.onload = function(event) {
              uploadedVideoBase64 = event.target.result;
              
              const previewPlayer = document.getElementById('previewPlayer');
              const videoPreview = document.getElementById('videoPreview');
              
              if (previewPlayer) previewPlayer.src = uploadedVideoBase64;
              if (videoPreview) videoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
          });
        }
      }, 100);
    
      // ========================================
      // AI ANALYSIS (MOCK)
      // ========================================
      function analyzeAI(text) {
        if (!text || text.trim().length < 15) {
          if (aiAnalysis) aiAnalysis.style.display = 'none';
          return;
        }
    
        if (analyzingIndicator) analyzingIndicator.style.display = 'block';
    
        setTimeout(() => {
          const categories = ['Education', 'Environment', 'Healthcare', 'Technology', 'Economic Development', 'Social Justice', 'Infrastructure', 'Agriculture'];
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          
          const positiveWords = ['empower', 'improve', 'support', 'develop', 'transform', 'innovate', 'create', 'build', 'enhance', 'strengthen'];
          const isPositive = positiveWords.some(word => text.toLowerCase().includes(word));
          const sentiment = isPositive ? 'Very Positive' : 'Positive';
          
          const impactScore = Math.floor(Math.random() * 41) + 60;
    
          const aiCategoryEl = document.getElementById('aiCategory');
          const aiSentimentEl = document.getElementById('aiSentiment');
          const aiImpactScoreEl = document.getElementById('aiImpactScore');
          const categorySelect = document.getElementById('category');
    
          if (aiCategoryEl) aiCategoryEl.textContent = randomCategory;
          if (aiSentimentEl) aiSentimentEl.textContent = sentiment;
          if (aiImpactScoreEl) aiImpactScoreEl.textContent = impactScore + '/100';
          if (categorySelect) categorySelect.value = randomCategory;
    
          if (analyzingIndicator) analyzingIndicator.style.display = 'none';
          if (aiAnalysis) aiAnalysis.style.display = 'block';
        }, 1800);
      }
    
      // Text input analysis trigger
      const messageInput = document.getElementById('message');
      if (messageInput) {
        messageInput.addEventListener('input', function(e) {
          if (e.target.value.length > 50) {
            analyzeAI(e.target.value);
          }
        });
      }
    
      // ========================================
      // GENERATE 6-DIGIT PASSCODE
      // ========================================
      function generatePasscode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      }
    
      // ========================================
      // ESCAPE HTML (SECURITY)
      // ========================================
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    
      // ========================================
      // FORM SUBMISSION
      // ========================================
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
    
          if (!submitBtn) return;
    
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';
    
          const name = document.getElementById('name').value.trim();
          const company = document.getElementById('company').value.trim();
          const email = document.getElementById('email').value.trim();
          const category = document.getElementById('category').value;
    
          // Check selected input method
          const selectedRadio = document.querySelector('input[name="inputType"]:checked');
          if (selectedRadio) currentInputMethod = selectedRadio.value;
    
          let message = '';
          
          if (currentInputMethod === 'voice') {
            message = document.getElementById('message').value.trim();
            if (!message) {
              alert('❌ Please provide your pledge message.');
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
              return;
            }
          } else if (currentInputMethod === 'video') {
            if (!uploadedVideoBase64) {
              alert('❌ Please upload a video file or switch to voice input.');
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
              return;
            }
            message = 'Video Pledge - ' + (uploadedVideoFile ? uploadedVideoFile.name : 'video.mp4');
          }
    
          if (!category) {
            alert('❌ Please select a category.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
            return;
          }
    
          // Generate passcode
          const passcode = generatePasscode();
    
          // Create commitment object
          const commitment = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            company,
            email,
            message,
            video: currentInputMethod === 'video' ? uploadedVideoBase64 : null,
            category,
            aiCategory: document.getElementById('aiCategory')?.textContent || category,
            aiSentiment: document.getElementById('aiSentiment')?.textContent || 'Positive',
            aiImpactScore: document.getElementById('aiImpactScore')?.textContent || '75/100',
            passcode,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            timestamp: new Date().toISOString()
          };
    
          // Save to localStorage
          setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem('commitments') || '[]');
            saved.unshift(commitment);
            localStorage.setItem('commitments', JSON.stringify(saved));
    
            commitments = saved;
            displayCommitments();
            updateStats();
    
            // CLEAR FORM
            form.reset();
            if (aiAnalysis) aiAnalysis.style.display = 'none';
            
            const videoPreview = document.getElementById('videoPreview');
            const previewPlayer = document.getElementById('previewPlayer');
            if (videoPreview) videoPreview.style.display = 'none';
            if (previewPlayer) previewPlayer.src = '';
            
            uploadedVideoFile = null;
            uploadedVideoBase64 = null;
            currentInputMethod = 'voice';
    
            // Reset to voice section
            const voiceSection = document.getElementById('voiceSection');
            const videoSection = document.getElementById('videoSection');
            if (voiceSection) voiceSection.style.display = 'block';
            if (videoSection) videoSection.style.display = 'none';
    
            const voiceRadio = document.querySelector('input[name="inputType"][value="voice"]');
            if (voiceRadio) voiceRadio.checked = true;
    
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit pledge</span><i class="fas fa-arrow-right"></i>';
    
            // SHOW PASSCODE MODAL
            showPasscodeModal(passcode, name);
            
            // Scroll to wall after 3 seconds
            setTimeout(() => {
              const wallSection = document.querySelector('.wall-section');
              if (wallSection) wallSection.scrollIntoView({ behavior: 'smooth' });
            }, 3000);
          }, 2000);
        });
      }
    
      // ========================================
      // SHOW PASSCODE MODAL
      // ========================================
      function showPasscodeModal(passcode, name) {
        const modal = document.createElement('div');
        modal.className = 'passcode-modal';
        modal.innerHTML = `
          <div class="passcode-modal-content">
            <div class="passcode-header">
              <i class="fas fa-lock"></i>
              <h3>Your Security Passcode</h3>
            </div>
            <div class="passcode-body">
              <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
              <p>Your pledge has been submitted successfully!</p>
              <p>Please save this passcode to edit or delete your pledge later:</p>
              <div class="passcode-display">${passcode}</div>
              <div class="passcode-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Keep this passcode safe! You'll need it to manage your pledge.</span>
              </div>
              <button class="copy-passcode-btn" onclick="window.copyPasscode('${passcode}')">
                <i class="fas fa-copy"></i> Copy Passcode
              </button>
            </div>
            <button class="close-modal-btn" onclick="window.closePasscodeModal()">
              Got it!
            </button>
          </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
      }
    
      // ========================================
      // COPY PASSCODE TO CLIPBOARD
      // ========================================
      window.copyPasscode = function(passcode) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(passcode).then(() => {
            alert('✅ Passcode copied to clipboard!');
          }).catch(() => fallbackCopy(passcode));
        } else {
          fallbackCopy(passcode);
        }
      };
    
      function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ Passcode copied to clipboard!');
      }
    
      // ========================================
      // CLOSE PASSCODE MODAL
      // ========================================
      window.closePasscodeModal = function() {
        const modal = document.querySelector('.passcode-modal');
        if (modal) {
          modal.classList.remove('show');
          setTimeout(() => modal.remove(), 300);
        }
      };
    
      // ========================================
      // DISPLAY COMMITMENTS
      // ========================================
      function displayCommitments() {
        if (!commitmentsContainer) return;
    
        if (commitments.length === 0) {
          if (noPledges) noPledges.style.display = 'block';
          commitmentsContainer.innerHTML = '';
          return;
        }
    
        if (noPledges) noPledges.style.display = 'none';
        commitmentsContainer.innerHTML = '';
    
        commitments.forEach((commitment, index) => {
          const card = document.createElement('div');
          card.className = 'commitment-card';
          card.setAttribute('data-aos', 'fade-up');
          card.setAttribute('data-aos-delay', (index * 100).toString());
    
          let videoHTML = '';
          if (commitment.video) {
            videoHTML = `
              <div class="commitment-video">
                <video controls style="width:100%; border-radius:10px; margin:10px 0;">
                  <source src="${commitment.video}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            `;
          }
    
          card.innerHTML = `
            <div class="commitment-header">
              <div>
                <div class="commitment-name">${escapeHtml(commitment.name)}</div>
                <div class="commitment-company">${escapeHtml(commitment.company)}</div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div class="commitment-category">${escapeHtml(commitment.category)}</div>
                <button type="button" class="edit-btn" data-id="${commitment.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="delete-btn" data-id="${commitment.id}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            ${videoHTML}
            <div class="commitment-message">"${escapeHtml(commitment.message)}"</div>
            <div class="commitment-footer">
              <div class="commitment-date">${commitment.date}</div>
              <div class="commitment-ai">
                <div class="ai-badge-small">${commitment.aiSentiment || 'Positive'}</div>
                <div class="ai-badge-small">${commitment.aiImpactScore || '75/100'}</div>
              </div>
            </div>
          `;
    
          commitmentsContainer.appendChild(card);
        });
    
        // Attach event listeners after DOM update
        setTimeout(() => {
          document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => editPledge(btn.dataset.id);
          });
    
          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => deletePledge(btn.dataset.id);
          });
        }, 50);
    
        if (typeof AOS !== 'undefined') AOS.refresh();
      }
    
      // ========================================
      // UPDATE STATS
      // ========================================
      function updateStats() {
        if (totalPledgesEl) totalPledgesEl.textContent = commitments.length;
        
        const totalImpact = commitments.reduce((sum, c) => {
          const score = parseInt(c.aiImpactScore?.split('/')[0]) || 0;
          return sum + score;
        }, 0);
        
        if (totalImpactEl) totalImpactEl.textContent = totalImpact;
      }
    
      // ========================================
      // EDIT PLEDGE
      // ========================================
      function editPledge(id) {
        const commitment = commitments.find(c => c.id === id);
        if (!commitment) return;
        
        const passcode = prompt('🔒 Enter your security passcode to edit this pledge:');
        if (!passcode) return;
        
        if (passcode !== commitment.passcode) {
          alert('❌ Invalid passcode! You cannot edit this pledge.');
          return;
        }
        
        showEditModal(commitment);
      }
    
      // ========================================
      // SHOW EDIT MODAL
      // ========================================
      function showEditModal(commitment) {
        const modal = document.createElement('div');
        modal.className = 'passcode-modal';
        modal.innerHTML = `
          <div class="passcode-modal-content" style="max-width: 600px;">
            <div class="passcode-header">
              <i class="fas fa-edit"></i>
              <h3>Edit Your Pledge</h3>
            </div>
            <div class="passcode-body">
              <form id="editPledgeForm" style="text-align: left;">
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Name *</label>
                  <input type="text" id="editName" value="${escapeHtml(commitment.name)}" 
                    style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px;" required />
                </div>
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Company *</label>
                  <input type="text" id="editCompany" value="${escapeHtml(commitment.company)}" 
                    style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px;" required />
                </div>
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email *</label>
                  <input type="email" id="editEmail" value="${escapeHtml(commitment.email)}" 
                    style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px;" required />
                </div>
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Message *</label>
                  <textarea id="editMessage" rows="4" 
                    style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px;" required>${escapeHtml(commitment.message)}</textarea>
                </div>
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Category *</label>
                  <select id="editCategory" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px;" required>
                    ${['Education', 'Environment', 'Healthcare', 'Technology', 'Economic Development', 'Social Justice', 'Infrastructure', 'Agriculture'].map(cat => 
                      `<option value="${cat}" ${commitment.category === cat ? 'selected' : ''}>${cat}</option>`
                    ).join('')}
                  </select>
                </div>
              </form>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button class="close-modal-btn" style="flex: 1; background: #6c757d;" onclick="window.closePasscodeModal()">Cancel</button>
              <button class="close-modal-btn" style="flex: 1;" onclick="window.saveEditedPledge('${commitment.id}')">
                <i class="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
      }
    
      // ========================================
      // SAVE EDITED PLEDGE
      // ========================================
      window.saveEditedPledge = function(id) {
        const index = commitments.findIndex(c => c.id === id);
        if (index === -1) return;
    
        commitments[index] = {
          ...commitments[index],
          name: document.getElementById('editName').value.trim(),
          company: document.getElementById('editCompany').value.trim(),
          email: document.getElementById('editEmail').value.trim(),
          message: document.getElementById('editMessage').value.trim(),
          category: document.getElementById('editCategory').value,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' (Edited)'
        };
    
        localStorage.setItem('commitments', JSON.stringify(commitments));
        displayCommitments();
        updateStats();
        window.closePasscodeModal();
        alert('✅ Pledge updated successfully!');
      };
    
      // ========================================
      // DELETE PLEDGE
      // ========================================
      function deletePledge(id) {
        const commitment = commitments.find(c => c.id === id);
        if (!commitment) return;
        
        const passcode = prompt('🔒 Enter your security passcode to delete this pledge:');
        if (!passcode) return;
        
        if (passcode !== commitment.passcode) {
          alert('❌ Invalid passcode! You cannot delete this pledge.');
          return;
        }
        
        if (!confirm('⚠️ Are you sure you want to delete this pledge?\n\nThis action cannot be undone.')) return;
        
        commitments = commitments.filter(c => c.id !== id);
        localStorage.setItem('commitments', JSON.stringify(commitments));
        displayCommitments();
        updateStats();
        alert('✅ Pledge deleted successfully!');
      }
    
      // ========================================
      // EXPORT TO EXCEL
      // ========================================
      function exportToExcel() {
        if (commitments.length === 0) {
          alert('❌ No pledges to export yet!');
          return;
        }
    
        const data = commitments.map((c, i) => ({
          'No': i + 1,
          'Name': c.name,
          'Company': c.company,
          'Email': c.email,
          'Message': c.message,
          'Category': c.category,
          'AI Category': c.aiCategory,
          'AI Sentiment': c.aiSentiment,
          'AI Impact Score': c.aiImpactScore,
          'Date': c.date,
          'Timestamp': c.timestamp
        }));
    
        const headers = Object.keys(data[0]);
        let csv = '\uFEFF' + headers.join(',') + '\n';
    
        data.forEach(row => {
          const values = headers.map(h => {
            let val = String(row[h] || '').replace(/"/g, '""');
            if (val.includes(',') || val.includes('"') || val.includes('\n')) val = `"${val}"`;
            return val;
          });
          csv += values.join(',') + '\n';
        });
    
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Simply_Complex_Africa_Pledges_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        alert('✅ Excel file downloaded successfully!');
      }
    
      if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
      }
    
      // ========================================
      // LOAD COMMITMENTS FROM LOCALSTORAGE
      // ========================================
      function loadCommitments() {
        commitments = JSON.parse(localStorage.getItem('commitments') || '[]');
        displayCommitments();
        updateStats();
      }
    
      // ========================================
      // INITIALIZE
      // ========================================
      loadCommitments();
      console.log('✅ Commitment Wall JS Loaded - ' + commitments.length + ' pledges');
    });
  }

  // Initialize
  loadCommitments();
  
  // Debug: Log initial state
  console.log('Commitment Wall JS Loaded');
  console.log('Initial commitments:', commitments.length);
});z