import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
         laravel({
            input: [
                
                'resources/js/app.js',
                'resources/js/main.js',
                'resources/js/students_page.js',
                'resources/js/students_validation.js',







                'resources/css/app.css',
                // Root styles
                'resources/css/root/sidebar.css',
                'resources/css/root/root.css',
                'resources/css/root/colors.css',
                'resources/css/root/user-panel.css',
                'resources/css/root/responsive-media.css',
                // Controllers styles
                'resources/css/controllers/images.css',
                'resources/css/controllers/buttons.css',
                'resources/css/controllers/checkbox.css',
                'resources/css/controllers/messages.css',
                'resources/css/controllers/notification.css',
                // Page styles 
                'resources/css/page.css',
                'resources/css/students_page/pagination.css',
                'resources/css/students_page/students-table.css',
                'resources/css/students_page/disabled-table-buttons.css',
                // Modal styles
                'resources/css/modals/add-student-modal.css',
                'resources/css/modals/edit-student-modal.css',
                'resources/css/modals/delete-student-modal.css'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
