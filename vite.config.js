import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- IMPORTANTE PARA PRODUÇÃO ---
  // Define que os caminhos dos assets serão relativos.
  // Isso evita erros de tela branca ao usar HashRouter ou hospedar em subpastas.
  base: './', 

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Configurações opcionais de Build (Otimização)
  build: {
    outDir: 'dist', // Pasta de saída
    assetsDir: 'assets',
    // Remove console.log em produção (opcional, bom para performance/limpeza)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Divide bibliotecas grandes (como react) em arquivos separados para carregar mais rápido
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})