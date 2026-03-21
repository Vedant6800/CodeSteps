/* =============================================
   CodeSteps — Playground JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('playground-main')) return;

    const htmlCode = document.getElementById('code-html');
    const cssCode = document.getElementById('code-css');
    const jsCode = document.getElementById('code-js');
    const previewFrame = document.getElementById('preview-frame');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const copyBtn = document.getElementById('copy-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const autoRunToggle = document.getElementById('auto-run-toggle');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const editorPanes = document.querySelectorAll('.editor-pane');
    const statusEl = document.getElementById('pg-status');

    let autoRunTimer;

    const DEFAULT_HTML = `<!-- Welcome to the Live Code Playground! -->
<div class="card">
  <h2>Hello, CodeSteps! 🚀</h2>
  <p>Start editing to see your changes instantly.</p>
  <button id="clickMe">Click Me</button>
</div>`;

    const DEFAULT_CSS = `/* Stylish defaults */
body {
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f1f5f9;
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

button:hover { 
  background: #1d4ed8;
  transform: translateY(-2px);
}`;

    const DEFAULT_JS = `// Add interactivity
document.getElementById('clickMe').addEventListener('click', () => {
  alert('Great job! You are writing JavaScript!');
});`;

    // Initialize from LocalStorage or Defaults
    function loadStorage() {
        const storedHtml = localStorage.getItem('codesteps-pg-html');
        const storedCss = localStorage.getItem('codesteps-pg-css');
        const storedJs = localStorage.getItem('codesteps-pg-js');

        htmlCode.value = storedHtml !== null ? storedHtml : DEFAULT_HTML;
        cssCode.value = storedCss !== null ? storedCss : DEFAULT_CSS;
        jsCode.value = storedJs !== null ? storedJs : DEFAULT_JS;
    }

    function saveStorage() {
        localStorage.setItem('codesteps-pg-html', htmlCode.value);
        localStorage.setItem('codesteps-pg-css', cssCode.value);
        localStorage.setItem('codesteps-pg-js', jsCode.value);
    }

    function updatePreview() {
        // Clear previous timeouts if updating instantly via RUN
        clearTimeout(autoRunTimer);

        const h = htmlCode.value;
        const c = cssCode.value;
        const j = jsCode.value;

        const combined = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>${c}</style>
                </head>
                <body>
                    ${h}
                    <script>
                        try {
                            ${j}
                        } catch(err) {
                            console.error(err);
                        }
                    <\/script>
                </body>
            </html>
        `;

        const blob = new Blob([combined], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        previewFrame.onload = () => URL.revokeObjectURL(url);
        previewFrame.src = url;

        saveStorage();
        showStatus('Updated', 'success');
    }

    function showStatus(text, type) {
        statusEl.textContent = text;
        statusEl.className = 'pg-status show ' + type;
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 2000);
    }

    // Event Listeners
    runBtn.addEventListener('click', updatePreview);

    const onInput = () => {
        saveStorage();
        if (autoRunToggle.checked) {
            clearTimeout(autoRunTimer);
            autoRunTimer = setTimeout(updatePreview, 600);
        }
    };

    htmlCode.addEventListener('input', onInput);
    cssCode.addEventListener('input', onInput);
    jsCode.addEventListener('input', onInput);

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all code to the default template?')) {
            htmlCode.value = DEFAULT_HTML;
            cssCode.value = DEFAULT_CSS;
            jsCode.value = DEFAULT_JS;
            updatePreview();
        }
    });

    copyBtn.addEventListener('click', () => {
        const activePane = document.querySelector('.editor-pane.active textarea');
        if (activePane) {
            navigator.clipboard.writeText(activePane.value).then(() => {
                showStatus('Copied!', 'success');
            });
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        const container = document.getElementById('playground-main');
        container.classList.toggle('fullscreen');
        if (container.classList.contains('fullscreen')) {
            fullscreenBtn.innerHTML = '⛕'; // exit icon approx
            fullscreenBtn.title = "Exit Fullscreen";
        } else {
            fullscreenBtn.innerHTML = '⛶'; // enter icon approx
            fullscreenBtn.title = "Toggle Fullscreen";
        }
    });

    // Editor Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.getAttribute('data-lang');

            editorPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById('pane-' + lang).classList.add('active');
        });
    });

    // Syntax-friendly spacing (Tab key support)
    document.querySelectorAll('.code-editor').forEach(editor => {
        editor.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                // Add two spaces
                this.value = this.value.substring(0, start) + "  " + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 2;
                onInput();
            }
        });
    });

    // Check localStorage flag to see if we should auto-switch tabs
    const focusTab = localStorage.getItem('codesteps-pg-focus');
    if (focusTab) {
        // Safe query selector without escaping issues
        const targetTab = document.querySelector('.tab-btn[data-lang="' + focusTab + '"]');
        if (targetTab) targetTab.click();
        localStorage.removeItem('codesteps-pg-focus');
    }

    loadStorage();
    updatePreview();
});
