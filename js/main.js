import { initializeUI } from './ui.js';
import { initializeIO } from './io.js';
import { initializeThemeToggle } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    initializeIO();
    initializeThemeToggle();
});
