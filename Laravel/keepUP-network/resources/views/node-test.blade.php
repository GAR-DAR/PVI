
<x-layout>
    <div class="container">
        <h1>Node.js Compatibility Test</h1>
        
        <div class="test-results">
            <h2>System Check</h2>
            
            <div class="result-item {{ $canUseNode ? 'success' : 'error' }}">
                <h3>Node.js Installation</h3>
                @if($canUseNode)
                    <p class="success-text">✅ Node.js is installed (version: {{ $nodeVersion }})</p>
                @else
                    <p class="error-text">❌ Node.js is not installed or not accessible</p>
                @endif
            </div>
            
            <div class="result-item {{ $npmVersion ? 'success' : 'error' }}">
                <h3>NPM Installation</h3>
                @if($npmVersion)
                    <p class="success-text">✅ npm is installed (version: {{ $npmVersion }})</p>
                @else
                    <p class="error-text">❌ npm is not installed or not accessible</p>
                @endif
            </div>
            
            <div class="result-item {{ $laravelHasNodeDeps ? 'success' : 'warning' }}">
                <h3>Laravel Node.js Dependencies</h3>
                @if($laravelHasNodeDeps)
                    <p class="success-text">✅ Laravel project has a package.json file</p>
                @else
                    <p class="warning-text">⚠️ No package.json found. Laravel may not be set up for Node.js</p>
                @endif
            </div>
            
            <h2>Next Steps</h2>
            @if($canUseNode)
                <p>You can use Node.js with this Laravel project! Here are some options:</p>
                <ul>
                    <li>Use Laravel Mix for asset compilation</li>
                    <li>Create a Node.js API within your Laravel app</li>
                    <li>Implement server-side rendering with Node.js</li>
                    <li>Use JavaScript testing frameworks</li>
                </ul>
                
                @if(!$laravelHasNodeDeps)
                    <div class="info-box">
                        <p>To initialize Node.js in your Laravel project, run:</p>
                        <pre><code>npm init -y</code></pre>
                        <p>Then install Laravel Mix:</p>
                        <pre><code>npm install laravel-mix --save-dev</code></pre>
                    </div>
                @endif
            @else
                <p>To use Node.js with Laravel, you need to:</p>
                <ol>
                    <li>Install Node.js from <a href="https://nodejs.org/" target="_blank">nodejs.org</a></li>
                    <li>Verify installation with <code>node -v</code> and <code>npm -v</code></li>
                    <li>Restart your server after installation</li>
                </ol>
            @endif
        </div>
    </div>
    
    <style>
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .test-results {
            margin-top: 2rem;
        }
        
        .result-item {
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 4px;
            background-color: var(--bg-secondary);
        }
        
        .success-text {
            color: #4caf50;
        }
        
        .error-text {
            color: #f44336;
        }
        
        .warning-text {
            color: #ff9800;
        }
        
        .info-box {
            background-color: rgba(153, 102, 255, 0.1);
            border-left: 4px solid var(--accent-clr);
            padding: 1rem;
            margin: 1.5rem 0;
        }
        
        pre {
            background-color: #1e1e1e;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        
        code {
            color: #e3e3e3;
            font-family: monospace;
        }
    </style>
</x-layout>
