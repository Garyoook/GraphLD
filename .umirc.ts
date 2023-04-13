import { defineConfig } from 'umi';

export default defineConfig({
  title: 'LD-Visualiser',
  favicons: ['https://img.icons8.com/fluency/2x/blockchain-technology.png'],
  // routes: [
  //   {
  //     path: '/',
  //     component: '@/layouts/index',
  //     routes: [
  //       { path: '', component: '@/pages/index' },
  //       { path: 'query', component: '@/pages/index' },
  //     ],
  //   },
  //   { path: '/docs', component: 'docs' },
  // ],
  npmClient: 'npm',
});
