import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with parameters should not be prerendered
  {
    path: 'tasks/:id',
    renderMode: RenderMode.Client // Use Client-side rendering for parametrized routes
  },
  {
    path: 'tasks/:id/edit',
    renderMode: RenderMode.Client // Use Client-side rendering for parametrized routes
  },
  // All other routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
