"use client";

class AudioService {
  constructor() {
    this.sounds = {};
    this.volume = 0.7; // Âm lượng mặc định (0-1)
    this.isEnabled = true; // Cho phép bật/tắt âm thanh
    this.lastPlayTime = {}; // Để debounce âm thanh
    this.debounceDelay = 1000; // 1 giây debounce

    this.initSounds();
    this.loadSettings();
  }

  // Khởi tạo các file âm thanh
  initSounds() {
    this.sounds = {
      notification: {
        path: '/sounds/notification.mp3',
        audio: null,
        volume: 0.7
      },
      messageReceived: {
        path: '/sounds/notification.mp3', // Tạm dùng chung file
        audio: null,
        volume: 0.6
      },
      messageSent: {
        path: '/sounds/notification.mp3', // Tạm dùng chung file
        audio: null,
        volume: 0.4
      }
    };

    // Preload tất cả âm thanh (only in browser)
    if (typeof window !== 'undefined') this.preloadSounds();
  }

  // Preload âm thanh để tránh delay khi phát
  preloadSounds() {
    if (typeof window === 'undefined') return;
    Object.keys(this.sounds).forEach(soundKey => {
      const sound = this.sounds[soundKey];

      // Tạo Audio object
      sound.audio = new Audio();
      sound.audio.src = sound.path;
      sound.audio.volume = sound.volume * this.volume;
      sound.audio.preload = 'auto';

      // Error handling
      sound.audio.addEventListener('error', (e) => {
        console.warn(`⚠️ Could not load sound: ${sound.path}`, e);
      });

      // Load event
      sound.audio.addEventListener('canplaythrough', () => {
        console.log(`🔊 Audio loaded: ${soundKey}`);
      });
    });
  }

  // Load settings từ localStorage
  loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const savedSettings = localStorage.getItem('audioSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.volume = settings.volume ?? 0.7;
        this.isEnabled = settings.isEnabled ?? true;

        // Update volume cho tất cả âm thanh
        this.updateVolume();
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  // Lưu settings vào localStorage
  saveSettings() {
    try {
      const settings = {
        volume: this.volume,
        isEnabled: this.isEnabled
      };
      localStorage.setItem('audioSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  }

  // Cập nhật âm lượng cho tất cả âm thanh
  updateVolume() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.audio) {
        sound.audio.volume = sound.volume * this.volume;
      }
    });
  }

  // Phát âm thanh với debounce
  playSound(soundKey, forcePlay = false) {
    if (!this.isEnabled) return;

    const sound = this.sounds[soundKey];
    if (!sound || !sound.audio) {
      console.warn(`⚠️ Sound not found: ${soundKey}`);
      return;
    }

    // Debounce logic
    const now = Date.now();
    const lastPlay = this.lastPlayTime[soundKey] || 0;

    if (!forcePlay && (now - lastPlay) < this.debounceDelay) {
      console.log(`🔇 Sound debounced: ${soundKey}`);
      return;
    }

    try {
      // Reset audio để có thể phát lại ngay lập tức
      sound.audio.currentTime = 0;

      // Phát âm thanh
      const playPromise = sound.audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🔊 Playing sound: ${soundKey}`);
            this.lastPlayTime[soundKey] = now;
          })
          .catch(error => {
            console.warn(`⚠️ Could not play sound: ${soundKey}`, error);
          });
      }
    } catch (error) {
      console.error(`❌ Error playing sound: ${soundKey}`, error);
    }
  }

  // Phát âm thanh thông báo chat
  playNotificationSound(notificationType = 'notification') {
    console.log(`🔊 AudioService: Playing notification sound type: ${notificationType}`);

    let soundKey;

    switch (notificationType) {
      case 'chat_received':
        soundKey = 'messageReceived';
        break;
      case 'chat_sent':
        soundKey = 'messageSent';
        break;
      case 'notification':
      default:
        soundKey = 'notification';
        break;
    }

    console.log(`🔊 AudioService: Mapped to sound key: ${soundKey}`);
    console.log(`🔊 AudioService: Audio enabled: ${this.isEnabled}`);
    console.log(`🔊 AudioService: Volume: ${Math.round(this.volume * 100)}%`);

    this.playSound(soundKey);
  }

  // Bật/tắt âm thanh
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.saveSettings();
    console.log(`🔊 Audio ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Đặt âm lượng (0-1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
    this.saveSettings();
    console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
  }

  // Test âm thanh
  testSound(soundKey = 'notification') {
    this.playSound(soundKey, true); // Force play để test
  }

  // Get trạng thái hiện tại
  getSettings() {
    return {
      volume: this.volume,
      isEnabled: this.isEnabled,
      availableSounds: Object.keys(this.sounds)
    };
  }

  // Cleanup khi không cần dùng
  destroy() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.audio) {
        sound.audio.pause();
        sound.audio.src = '';
        sound.audio = null;
      }
    });
    this.sounds = {};
  }
}

// Tạo instance duy nhất (lazy on client)
let _instance = null;
const audioService = typeof window !== 'undefined'
  ? (() => { _instance = _instance || new AudioService(); return _instance; })()
  : { playSound: () => { }, playNotificationSound: () => { }, setEnabled: () => { }, setVolume: () => { }, getSettings: () => ({}), destroy: () => { } };

export default audioService; 