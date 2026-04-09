/* ============================================
   .md viewer — Profile Screen
   Onboarding / profile creation
   ============================================ */

const ProfileScreen = (() => {
  const AVATARS = ['✍️', '🧠', '🚀', '💎', '🔮', '⚡', '🎯', '🌊'];

  let selectedAvatar = '✍️';

  function render() {
    return `
      <div class="profile-screen screen" id="profile-screen">
        <div class="profile-logo anim-bounce-in">
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>

        <h1 class="profile-title anim-fade-in-up stagger-1">
          <span class="accent-text">.md viewer</span>
        </h1>
        <p class="profile-subtitle anim-fade-in-up stagger-2">
          Your markdown companion.<br>Write, preview, organize — all on your phone.
        </p>

        <div class="profile-form anim-fade-in-up stagger-3">
          <div class="profile-input-group">
            <label>What should we call you?</label>
            <input type="text" id="profile-name" placeholder="Your name" maxlength="24" autocomplete="off">
          </div>

          <div class="profile-input-group">
            <label>Pick your vibe</label>
            <div class="avatar-picker" id="avatar-picker">
              ${AVATARS.map(a => `
                <button class="avatar-option ${a === selectedAvatar ? 'selected' : ''}" data-avatar="${a}">
                  ${a}
                </button>
              `).join('')}
            </div>
          </div>

          <button class="btn-primary profile-submit" id="profile-submit" disabled>
            Let's go →
          </button>
        </div>

        <span class="profile-version anim-fade-in stagger-5">.md viewer v1.2</span>
      </div>
    `;
  }

  function bind() {
    const nameInput = document.getElementById('profile-name');
    const submitBtn = document.getElementById('profile-submit');
    const picker = document.getElementById('avatar-picker');

    if (!nameInput || !submitBtn || !picker) return;

    // Name input validation
    nameInput.addEventListener('input', () => {
      const valid = nameInput.value.trim().length >= 2;
      submitBtn.disabled = !valid;
      if (valid) {
        submitBtn.style.opacity = '1';
      } else {
        submitBtn.style.opacity = '0.5';
      }
    });

    // Avatar picker
    picker.addEventListener('click', (e) => {
      const btn = e.target.closest('.avatar-option');
      if (!btn) return;
      selectedAvatar = btn.dataset.avatar;
      picker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => btn.style.transform = '', 200);
    });

    // Submit
    submitBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (name.length < 2) return;

      Store.saveProfile({ name, avatar: selectedAvatar });

      // Animate out then navigate
      const screen = document.getElementById('profile-screen');
      screen.style.transition = 'opacity 0.3s, transform 0.3s';
      screen.style.opacity = '0';
      screen.style.transform = 'scale(0.95)';
      setTimeout(() => Router.navigate('home'), 350);
    });

    // Auto-focus
    setTimeout(() => nameInput.focus(), 600);
  }

  return { render, bind };
})();
