export function triggerHaptic(type: 'tap' | 'eat' | 'insect' | 'crash' | 'boost') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(12);
        break;
      case 'eat':
        navigator.vibrate(25);
        break;
      case 'insect':
        navigator.vibrate([25, 30, 45]);
        break;
      case 'boost':
        navigator.vibrate(18);
        break;
      case 'crash':
        navigator.vibrate([80, 40, 120]);
        break;
    }
  } catch {
    // Unsupported or blocked by browser policy
  }
}
