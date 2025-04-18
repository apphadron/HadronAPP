
interface DefaultColor {
  "--color-branco": string;
  "--color-branco-90": string;
  "--color-preto": string;
  "--color-texto": string;
}

interface LightColor {
  "--color-verde-50": string;
  "--color-verde-60": string;
  "--color-verde-70": string;
  "--color-verde-80": string;
  "--color-verde-90": string;
  "--color-verde-100": string;

  "--color-roxo-60": string;
  "--color-roxo-70": string;
  "--color-roxo-80": string;
  "--color-roxo-90": string;
  "--color-roxo-100": string;
}

interface DarkColor {
  "--color-cinza-40": string;
  "--color-cinza-50": string;
  "--color-cinza-60": string;
  "--color-cinza-70": string;
  "--color-cinza-80": string;
  "--color-cinza-90": string;
  "--color-cinza-100": string;
  "--color-cinza-200": string;
}

// Definindo o tipo global para os temas
export type Colors = {
  default: DefaultColor;
  light: LightColor;
  dark: DarkColor;
};

// Definindo o objeto com os temas e as cores
export const colors: Colors = {
  default: {
    "--color-branco": "#ffffff",
    "--color-branco-90": "#f9f9f9",
    "--color-preto": "#000000", 
    "--color-texto": "#383A38",
  },
  light: {
    "--color-verde-50": "#eff1ef",
    "--color-verde-60": "#DBF9E7",
    "--color-verde-70": "#B7F3CF",
    "--color-verde-80": "#92EAB6",
    "--color-verde-90": "#6EE29D",
    "--color-verde-100": "#49D983",
    
    "--color-roxo-60": "#DAC7EE",
    "--color-roxo-70": "#A283CA",
    "--color-roxo-80": "#A283CA",
    "--color-roxo-90": "#8C61B5",
    "--color-roxo-100": "#7141A1",
  },
  dark: {
    "--color-cinza-40": "#eff1ef",
    "--color-cinza-50": "#c5ccc6",
    "--color-cinza-60": "#9FA5A0",
    "--color-cinza-70": "#7B7F7B",
    "--color-cinza-80": "#585C59",
    "--color-cinza-90": "#383A38",
    "--color-cinza-100": "#020202",
    "--color-cinza-200": "#1A1C1B",
  },
};
