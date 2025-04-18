export const ROUTES = {
    TABS: {
      HOME: '/',
      FERRAMENTAS: '/ferramentas',
      PERFIL: '/perfil',
    },
    FERRAMENTAS: {
      CALCULADORA: '/ferramentas/calculadora',
      CONVERSORES: '/ferramentas/conversores',
      OLHOS_NASA: '/ferramentas/olhos-nasa',
      RA: '/ferramentas/ra',
      LABORATORIO: '/ferramentas/laboratorio',
      CRONOMETRO: '/ferramentas/cronometro',
      JOGOS: '/ferramentas/jogos',
      GRAFICOS: '/ferramentas/graficos',
    },
  } as const;
  
  export type AppRoutes = typeof ROUTES;
  export type TabRoutes = keyof typeof ROUTES.TABS;
  export type FerramentasRoutes = keyof typeof ROUTES.FERRAMENTAS;
  
  export function navigate(route: string, params?: Record<string, any>) {
    // Implementação futura de analytics
    console.log(`Navegando para: ${route}`);
    return {
      pathname: route,
      params,
    };
  }