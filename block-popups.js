// Override window.open to block popups
window.open = function() {
    console.log('[Play IMDb] Blocked popup attempt from video provider.');
    return null; 
};

// Some ad scripts create hidden links and simulate clicks on them
document.addEventListener('click', function(e) {
    // Intercept clicks on links that target a new window/tab
    const target = e.target.closest('a');
    if (target && target.target === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Play IMDb] Blocked _blank link click.');
    }
}, true); // Use capture phase to intercept before other scripts
