// Theme switching
        const themeSwitcher = document.getElementById('theme-switcher');
        const html = document.documentElement;

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

        // Set current date
        document.getElementById('current-date').textContent = new Date().toLocaleDateString();

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');

        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Generate table of contents
        function generateTOC() {
            const toc = document.getElementById('toc');
            const headings = document.querySelectorAll('h2, h3');
            let currentH2 = null;

            // Create a container UL for the TOC if it doesn't exist
            if (!toc.querySelector('ul')) {
                const mainUl = document.createElement('ul');
                toc.appendChild(mainUl);
            } else {
                // Clear existing TOC if regenerating
                toc.querySelector('ul').innerHTML = '';
            }

            headings.forEach(heading => {
                // Skip headings without IDs
                if (!heading.id) {
                    // Auto-generate an ID if missing
                    heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                }

                const li = document.createElement('li');
                const a = document.createElement('a');
                
                a.href = `#${heading.id}`;
                a.textContent = heading.textContent;

                if (heading.tagName === 'H2') {
                    const ul = document.createElement('ul');
                    a.classList.add('toc-link-1');
                    li.appendChild(a);
                    li.appendChild(ul);
                    toc.querySelector('ul').appendChild(li);
                    currentH2 = ul;
                } else if (heading.tagName === 'H3' && currentH2) {
                    const subLi = document.createElement('li');
                    a.classList.add('toc-link-2');
                    subLi.appendChild(a);
                    currentH2.appendChild(subLi);
                }                
            });

            // Add a "Back to Top" link at the bottom
            const backToTopLi = document.createElement('li');
            const backToTopLink = document.createElement('a');
            backToTopLink.id = "back-to-top";
            backToTopLink.href = '#';
            backToTopLink.textContent = '↑ Back to Top';
            backToTopLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            backToTopLi.appendChild(backToTopLink);
            toc.querySelector('ul').appendChild(backToTopLi);
        }
        // Highlight active TOC item on scroll
        function highlightActiveTOC() {
            const sections = document.querySelectorAll('section');
            const tocLinks = document.querySelectorAll('#toc a');

            window.addEventListener('scroll', () => {
                let current = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;

                    if (pageYOffset >= (sectionTop - 100)) {
                        current = section.getAttribute('id');
                    }
                });

                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            });
        }

        // Smooth scrolling for TOC links
        function enableSmoothScrolling() {
            document.querySelectorAll('#toc a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 20,
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open
                        sidebar.classList.remove('open');
                    }
                });
            });
        }

        // Initialize everything when DOM is loaded

        generateTOC();
        highlightActiveTOC();
        enableSmoothScrolling();