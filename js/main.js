document.addEventListener('DOMContentLoaded', function() {
    // Theme switching
    const themeSwitcher = document.getElementById('theme-switcher');
    const html = document.documentElement;
    
    if (themeSwitcher) {
        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // Apply the saved theme
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        // Theme switcher button click handler
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
        
        function updateThemeIcon(theme) {
            const toBeEnabled = theme === 'light' ? '#sun-icon' : '#moon-icon';
            const toBeDisabled = theme === 'light' ? '#moon-icon' : '#sun-icon';
            document.querySelector(toBeEnabled).classList.remove('hide');
            document.querySelector(toBeDisabled).classList.add('hide');
        }
    }

    // Mobile menu toggle - only if elements exist
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    // Code tabs functionality - only if elements exist
    const codeTabHeaders = document.querySelectorAll('.code-tab-header button');
    if (codeTabHeaders.length > 0) {
        codeTabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const tabId = header.getAttribute('data-tab');
                const tabContainer = header.closest('.code-tabs');
                
                if (!tabContainer) return;
                
                // Update active tab header
                const activeHeader = tabContainer.querySelector('.code-tab-header button.active');
                if (activeHeader) activeHeader.classList.remove('active');
                header.classList.add('active');
                
                // Update active tab content
                const activeContent = tabContainer.querySelector('.code-tab-content .tab-pane.active');
                if (activeContent) activeContent.classList.remove('active');
                
                const newActiveContent = tabContainer.querySelector(`.code-tab-content #${tabId}`);
                if (newActiveContent) newActiveContent.classList.add('active');
                
                // Re-run Prism highlighting for the active tab if Prism exists
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAllUnder(tabContainer);
                }
            });
        });
    }
    
    // Set current year in footer if element exists
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});