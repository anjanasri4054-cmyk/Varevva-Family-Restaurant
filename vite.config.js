import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Endpoint to save main menu
        if (req.method === 'POST' && req.url === '/api/save-menu') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { menu } = JSON.parse(body);
              if (!Array.isArray(menu)) {
                throw new Error("Invalid menu data: must be an array");
              }
              
              const fileContent = `export const menuData = ${JSON.stringify(menu, null, 2)};\n`;
              fs.writeFileSync(resolve(__dirname, 'src/menuData.js'), fileContent, 'utf-8');
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', message: 'Menu saved successfully to src/menuData.js!' }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
          });
        }
        // Endpoint to save specials
        else if (req.method === 'POST' && req.url === '/api/save-specials') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { specials } = JSON.parse(body);
              if (!Array.isArray(specials)) {
                throw new Error("Invalid specials data: must be an array");
              }
              
              const fileContent = `export const defaultSpecials = ${JSON.stringify(specials, null, 2)};\n`;
              fs.writeFileSync(resolve(__dirname, 'src/specialsData.js'), fileContent, 'utf-8');
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', message: 'Specials saved successfully to src/specialsData.js!' }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
          });
        }
        // Endpoint to save Firebase configuration
        else if (req.method === 'POST' && req.url === '/api/save-firebase-config') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { config } = JSON.parse(body);
              if (!config || !config.apiKey || !config.databaseURL) {
                throw new Error("Invalid firebase config: must include apiKey and databaseURL");
              }
              
              fs.writeFileSync(resolve(__dirname, 'public/firebase-config.json'), JSON.stringify(config, null, 2), 'utf-8');
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok', message: 'Firebase configuration saved successfully!' }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        specials: resolve(__dirname, 'specials.html'),
        menu: resolve(__dirname, 'menu.html'),
        item: resolve(__dirname, 'item.html'),
        ambience: resolve(__dirname, 'ambience.html'),
        contact: resolve(__dirname, 'contact.html'),
        verify: resolve(__dirname, 'verify.html'),
      },
    },
  },
});
