// Relative paths helper - this is key for mobile compatibility
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');

// Cache name with version
const CACHE_NAME = "keepup-cache-v2";

// Convert all absolute paths to relative paths for better compatibility
const ASSETS = [
    "./",                                      // Root (relative)
    "./index.html",                           // Main HTML file (relative)
    "./main.js",                               // Main JavaScript file
    
    // CSS files - root styles
    "./styles/page.css",                   
    "./styles/root/root.css",                  
    "./styles/root/colors.css",                
    "./styles/root/user-panel.css",            
    "./styles/root/responsive-media.css",                
    "./styles/root/sidebar.css",  
    
    // CSS files - page styles
    "./styles/students_page/disabled-table-buttons.css",
    "./styles/students_page/pagination.css",
    "./styles/students_page/students-table.css",

    // CSS files - controllers
    "./styles/controllers/buttons.css",
    "./styles/controllers/checkbox.css",
    "./styles/controllers/images.css",
    "./styles/controllers/messages.css",
    "./styles/controllers/notification.css",
    "./styles/controllers/calendar/calendar.css",

    // CSS files - modals

    "./styles/modals/add-student-modal.css",
    "./styles/modals/delete-student-modal.css",
    "./styles/modals/edit-student-modal.css",
    "./styles/modals/general-modals.css",
    
    
    // Icons
    "./assets/images/icon/icon_128.png",
    "./assets/images/icon/icon_192.png",
    "./assets/images/icon/icon_256.png",
    "./assets/images/icon/icon_512.png",

    // Students page
    "./src/pages/students_page/students_page.html",
    "./src/pages/students_page/students_page.js",
    "./src/pages/students_page/students_validation.js",

    // Chat page
    "./src/pages/chat_page/chat_page.html",
    "./src/pages/chat_page/chat_page.js",

    // Dashboard page
    "./src/pages/dashboard_page/dashboard_page.html",
    "./src/pages/dashboard_page/dashboard_page.js",

    // Profile page
    "./src/pages/profile_page/profile_page.html",
    "./src/pages/profile_page/profile_page.js",
    
    // Images
    "./assets/images/user-sample.png",
    // Add manifest.json
    "./manifest.json"
];

// Installation event - cache all resources immediately
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  
  // Force activation without waiting
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching all resources");
      return cache.addAll(ASSETS).catch(error => {
        console.error("Cache add error:", error);
        // Try individual caching if the batch fails
        return Promise.all(
          ASSETS.map(asset => cache.add(asset).catch(e => console.warn(`Failed to cache: ${asset}`)))
        );
      });
    })
  );
});

// Activation event - clear old caches and take control
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  
  event.waitUntil(
    Promise.all([
      // Remove old caches
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log('Service Worker: Removing old cache', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Take control of all clients immediately - critical for PWA
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener("fetch", event => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;
  
  // Extract file extension
  const url = new URL(event.request.url);
  const fileExt = url.pathname.split('.').pop().toLowerCase();
  
  // Cache CSS, JS, HTML, and images automatically when fetched
  const cachableExtensions = ["css", "js", "html", "png", "jpg", "jpeg", "gif", "svg", "json"];
  
  if (cachableExtensions.includes(fileExt)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Cache a copy if it's valid
            if (response.status === 200) {
              cache.put(event.request, response.clone());
              console.log(`Dynamically cached: ${url.pathname}`);
            }
            return response;
          })
          .catch(error => {
            console.log(`Trying cache for: ${url.pathname}`);
            return cache.match(event.request);
          });
      })
    );
  }
});