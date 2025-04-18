import { create, all } from 'mathjs';
const math = create(all);

export type CalculationKey =
  | 'focalLengthRatio'
  | 'magnification'
  | 'fieldOfView'
  | 'telescopeResolution'
  | 'exitPupil'
  | 'pixelScale'
  | 'ccdFilterSize'
  | 'limitingMagnitude'
  | 'angularDistance'
  | 'orbitalPeriod'
  | 'luminosity'
  | 'stellarTemperature'
  | 'parallaxDistance'
  | 'dopplerShift'
  | 'escapeVelocity'
  | 'blackBodyRadiation'
  | 'schwarzschildRadius'
  | 'gravitationalTimeDilation'
  | 'redshift';

export type Calculation = {
  title: string;
  description: string;
  formulaRepresentation: string;
  formula: (...args: number[]) => number | string;
  inputs: string[];
};

// Altere a tipagem de `calculationsByCategory` para permitir chaves parciais
export const calculationsByCategory: Record<string, Partial<Record<CalculationKey, Calculation>>> = {
  telescopio: {
    focalLengthRatio: {
      title: 'Razão Focal',
      description: 'Determina a razão entre o comprimento focal e a abertura do telescópio.',
      formulaRepresentation: 'f/ \\# = f / D',
      formula: (focalLength, aperture) => focalLength / aperture,
      inputs: ['Comprimento Focal (mm)', 'Abertura (mm)'],
    },
    magnification: {
      title: 'Ampliação',
      description: 'Calcula o aumento obtido ao usar uma ocular específica.',
      formulaRepresentation: 'M = F / f',
      formula: (focalLength, eyepiece) => focalLength / eyepiece,
      inputs: ['Comprimento Focal (mm)', 'Ocular (mm)'],
    },
    fieldOfView: {
      title: 'Campo de Visão',
      description: 'Determina o campo de visão do telescópio em graus.',
      formulaRepresentation: 'FOV = AFOV / M',
      formula: (apparentFOV, magnification) => apparentFOV / magnification,
      inputs: ['FOV Aparente (graus)', 'Ampliação'],
    },
    telescopeResolution: {
      title: 'Resolução do Telescópio',
      description: 'Determina a capacidade do telescópio de distinguir detalhes finos.',
      formulaRepresentation: '\u03B8 = 116 / D',
      formula: (aperture) => 116 / aperture,
      inputs: ['Abertura (mm)'],
    },
    exitPupil: {
      title: 'Saída Pupilar',
      description: 'Calcula o diâmetro do feixe de luz que sai da ocular.',
      formulaRepresentation: 'EP = D / M',
      formula: (aperture, magnification) => aperture / magnification,
      inputs: ['Abertura (mm)', 'Ampliação'],
    },
    pixelScale: {
      title: 'Escala de Pixel',
      description: 'Calcula a escala angular por pixel em segundos de arco para astrofotografia.',
      formulaRepresentation: 'Scale = 206.265 × pixel_size / F',
      formula: (pixelSize, focalLength) => `${(206.265 * pixelSize) / focalLength} segundos de arco/pixel`,
      inputs: ['Tamanho do Pixel (μm)', 'Comprimento Focal (mm)'],
    },
    ccdFilterSize: {
      title: 'Tamanho do Filtro CCD',
      description: 'Calcula o campo angular coberto por um sensor CCD ou filtro.',
      formulaRepresentation: 'Angle = (size / F) × 57.2958',
      formula: (focalLength, ccdSize) => `${(ccdSize / focalLength) * 57.2958} graus`,
      inputs: ['Comprimento Focal (mm)', 'Tamanho do CCD (mm)'],
    },
    limitingMagnitude: {
      title: 'Magnitude Limite',
      description: 'Estima a magnitude visual mais fraca observável com o telescópio.',
      formulaRepresentation: 'Mag_limit = 7.7 + 5 × log₁₀(D)',
      formula: (aperture) => `${7.7 + 5 * Math.log10(aperture)} (sem unidade)`,
      inputs: ['Abertura (mm)'],
    },
  },
  orbital: {
    angularDistance: {
      title: 'Distância Angular',
      description: 'Calcula a distância angular entre dois objetos no céu.',
      formulaRepresentation: '\\theta = \\cos^{-1}(\\sin{Dec1} \\cdot \sin{Dec2} + \\cos{Dec1} \\cdot \\cos{Dec2} \\cdot \\cos{RA1 - RA2})',
      formula: (ra1, dec1, ra2, dec2) => {
        const toRadians = (deg: number) => (deg * Math.PI) / 180;
        const ra1Rad = toRadians(ra1);
        const ra2Rad = toRadians(ra2);
        const dec1Rad = toRadians(dec1);
        const dec2Rad = toRadians(dec2);

        return (
          Math.acos(
            Math.sin(dec1Rad) * Math.sin(dec2Rad) +
              Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(ra1Rad - ra2Rad)
          ) * (180 / Math.PI)
        );
      },
      inputs: ['RA1 (graus)', 'DEC1 (graus)', 'RA2 (graus)', 'DEC2 (graus)'],
    },
    orbitalPeriod: {
      title: 'Período Orbital',
      description: 'Calcula o tempo necessário para um corpo completar uma órbita.',
      formulaRepresentation: 'P = \sqrt{\frac{4\pi^2 a^3}{G M}}',
      formula: (semiMajorAxis, starMass) =>
        Math.sqrt((4 * Math.PI ** 2 * semiMajorAxis ** 3) / (6.67430e-11 * starMass)),
      inputs: ['Semi-eixo Maior (m)', 'Massa da Estrela (kg)'],
    },
  },
  estelar: {
    luminosity: {
      title: 'Luminosidade da Estrela',
      description: 'Calcula a potência total de energia radiada por uma estrela.',
      formulaRepresentation: 'L = 4πR²σT⁴',
      formula: (radius, temperature) => {
        const luminosity = 4 * Math.PI * radius ** 2 * 5.670374419e-8 * temperature ** 4;
        return `${luminosity} W`;
      },
      inputs: ['Raio da Estrela (m)', 'Temperatura (K)'],
    },
    stellarTemperature: {
      title: 'Temperatura de Estrela',
      description: 'Calcula a temperatura efetiva de uma estrela a partir de sua luminosidade e raio.',
      formulaRepresentation: 'T = \sqrt[4]{\frac{L}{4πR²σ}}',
      formula: (luminosity, radius) => {
        const temperature = Math.sqrt(
          Math.sqrt(luminosity / (4 * Math.PI * radius ** 2 * 5.670374419e-8))
        );
        return `${temperature} K`;
      },
      inputs: ['Luminosidade (W)', 'Raio (m)'],
    },
    parallaxDistance: {
      title: 'Distância por Paralaxe',
      description: 'Converte a medida de paralaxe anual em distância em parsecs.',
      formulaRepresentation: 'd = 1/p',
      formula: (parallax) => `${1 / parallax} parsecs`,
      inputs: ['Paralaxe (segundos de arco)'],
    },
  },
  geral: {
    dopplerShift: {
      title: 'Deslocamento Doppler',
      description: 'Calcula o deslocamento Doppler a partir da variação do comprimento de onda.',
      formulaRepresentation: 'z = (λ_obs - λ_rest) / λ_rest',
      formula: (observedWavelength, restWavelength) =>
        `${(observedWavelength - restWavelength) / restWavelength} (sem unidade)`,
      inputs: ['Comprimento de Onda Observado (nm)', 'Comprimento de Onda em Repouso (nm)'],
    },
    escapeVelocity: {
      title: 'Velocidade de Escape',
      description: 'Determina a velocidade mínima necessária para escapar da gravidade de um corpo.',
      formulaRepresentation: 'V_e = \sqrt{\frac{2GM}{R}}',
      formula: (mass, radius) => Math.sqrt((2 * 6.67430e-11 * mass) / radius),
      inputs: ['Massa (kg)', 'Raio (m)'],
    },
    blackBodyRadiation: {
      title: 'Radiação de Corpo Negro',
      description: 'Calcula a densidade espectral de radiância de um corpo negro para um dado comprimento de onda e temperatura.',
      formulaRepresentation: 'B_λ(T) = \frac{2hc²}{λ⁵(e^{hc/λkT} - 1)}',
      formula: (temperature, wavelength) => {
        const radiation =
          (2 * 6.62607015e-34 * 3e8 ** 2) /
          (wavelength ** 5 *
            (Math.exp((6.62607015e-34 * 3e8) / (wavelength * 1.380649e-23 * temperature)) - 1));
        return `${radiation} W/m²/m`;
      },
      inputs: ['Temperatura (K)', 'Comprimento de Onda (m)'],
    },
    schwarzschildRadius: {
      title: 'Raio de Schwarzschild',
      description: 'Calcula o raio do horizonte de eventos de um buraco negro.',
      formulaRepresentation: 'R_s = \frac{2GM}{c^2}',
      formula: (mass) => (2 * 6.67430e-11 * mass) / (3e8 ** 2),
      inputs: ['Massa (kg)'],
    },
    gravitationalTimeDilation: {
      title: 'Dilatação do Tempo Gravitacional',
      description: 'Calcula o fator de dilatação do tempo devido a um campo gravitacional intenso.',
      formulaRepresentation: 't_0/t = \sqrt{1 - \frac{2GM}{rc²}}',
      formula: (mass, radius) =>
        `${Math.sqrt(1 - (2 * 6.67430e-11 * mass) / (radius * 3e8 ** 2))} (sem unidade)`,
      inputs: ['Massa (kg)', 'Raio (m)'],
    },
    redshift: {
      title: 'Redshift',
      description: 'Calcula o deslocamento para o vermelho cosmológico observado de objetos distantes.',
      formulaRepresentation: 'z = (λ_obs - λ_rest) / λ_rest',
      formula: (observedWavelength, restWavelength) =>
        `${(observedWavelength - restWavelength) / restWavelength} (sem unidade)`,
      inputs: ['Comprimento de Onda Observado (nm)', 'Comprimento de Onda de Repouso (nm)'],
    },
  },
};