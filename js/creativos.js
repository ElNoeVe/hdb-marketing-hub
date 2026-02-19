// ===================================
// creativos.js — Creative Generator
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching between image/video/segmentation sections
    setupTabs('#creativeTabs', switchSection);
});

function switchSection(type) {
    document.getElementById('section-imagenes').classList.toggle('hidden', type !== 'imagenes');
    document.getElementById('section-videos').classList.toggle('hidden', type !== 'videos');
    document.getElementById('section-segmentacion').classList.toggle('hidden', type !== 'segmentacion');
}
