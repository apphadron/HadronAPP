import { PhysicsAstronomyData } from '../types';

export const physicsAstronomyData: PhysicsAstronomyData = {
  words: [
    // Astronomia
    'ESTRELA', 'PLANETA', 'GALAXIA', 'NEBULOSA', 'COMETA',
    'ASTEROIDE', 'METEORO', 'SATELITE', 'ORBITA', 'COSMOS',
    'UNIVERSO', 'BURACO', 'NEGRO', 'QUASAR', 'PULSAR',
    'SUPERNOVA', 'ANAO', 'BRANCA', 'GIGANTE', 'VERMELHA',
    'SOL', 'LUA', 'TERRA', 'MARTE', 'VENUS',
    'JUPITER', 'SATURNO', 'URANO', 'NETUNO', 'PLUTAO',
    
    // Física
    'ENERGIA', 'FORCA', 'MASSA', 'VELOCIDADE', 'ACELERACAO',
    'GRAVIDADE', 'ELETRON', 'PROTON', 'NEUTRON', 'ATOMO',
    'MOLECULA', 'QUANTUM', 'RELATIVIDADE', 'EINSTEIN', 'NEWTON',
    'GALILEU', 'KEPLER', 'HUBBLE', 'PLANCK', 'BOHR',
    'ONDAS', 'LUZ', 'LASER', 'RAIO', 'MAGNETISMO',
    'ELETRICIDADE', 'TERMODINAMICA', 'ENTROPIA', 'CALOR', 'TEMPERATURA'
  ],
  
  definitions: {
    'ESTRELA': 'Corpo celeste que produz luz própria',
    'PLANETA': 'Corpo celeste que orbita uma estrela',
    'GALAXIA': 'Conjunto de bilhões de estrelas',
    'NEBULOSA': 'Nuvem de gás e poeira cósmica',
    'COMETA': 'Corpo celeste com cauda luminosa',
    'ASTEROIDE': 'Rocha espacial menor que um planeta',
    'METEORO': 'Fragmento que queima na atmosfera',
    'SATELITE': 'Corpo que orbita um planeta',
    'ORBITA': 'Trajetória de um corpo celeste',
    'COSMOS': 'O universo como um todo ordenado',
    'UNIVERSO': 'Totalidade do espaço e tempo',
    'BURACO': 'Região do espaço com gravidade extrema',
    'NEGRO': 'Tipo de buraco no espaço',
    'QUASAR': 'Núcleo galáctico muito brilhante',
    'PULSAR': 'Estrela de nêutrons que emite pulsos',
    'SUPERNOVA': 'Explosão de uma estrela massiva',
    'ANAO': 'Tipo de estrela pequena e densa',
    'BRANCA': 'Cor de um tipo de estrela anã',
    'GIGANTE': 'Estrela de grande tamanho',
    'VERMELHA': 'Cor de um tipo de estrela gigante',
    'SOL': 'Estrela central do sistema solar',
    'LUA': 'Satélite natural da Terra',
    'TERRA': 'Terceiro planeta do sistema solar',
    'MARTE': 'Quarto planeta do sistema solar',
    'VENUS': 'Segundo planeta do sistema solar',
    'JUPITER': 'Maior planeta do sistema solar',
    'SATURNO': 'Planeta com anéis proeminentes',
    'URANO': 'Sétimo planeta do sistema solar',
    'NETUNO': 'Oitavo planeta do sistema solar',
    'PLUTAO': 'Planeta anão do sistema solar',
    'ENERGIA': 'Capacidade de realizar trabalho',
    'FORCA': 'Interação que muda o movimento',
    'MASSA': 'Quantidade de matéria',
    'VELOCIDADE': 'Taxa de mudança de posição',
    'ACELERACAO': 'Taxa de mudança de velocidade',
    'GRAVIDADE': 'Força de atração entre massas',
    'ELETRON': 'Partícula com carga negativa',
    'PROTON': 'Partícula com carga positiva',
    'NEUTRON': 'Partícula sem carga elétrica',
    'ATOMO': 'Menor unidade da matéria',
    'MOLECULA': 'Conjunto de átomos ligados',
    'QUANTUM': 'Menor quantidade de energia',
    'RELATIVIDADE': 'Teoria de Einstein sobre espaço-tempo',
    'EINSTEIN': 'Físico da teoria da relatividade',
    'NEWTON': 'Físico das leis do movimento',
    'GALILEU': 'Astrônomo que usou telescópio',
    'KEPLER': 'Astrônomo das órbitas planetárias',
    'HUBBLE': 'Astrônomo da expansão do universo',
    'PLANCK': 'Físico da teoria quântica',
    'BOHR': 'Físico do modelo atômico',
    'ONDAS': 'Perturbações que se propagam',
    'LUZ': 'Radiação eletromagnética visível',
    'LASER': 'Luz amplificada e coerente',
    'RAIO': 'Descarga elétrica atmosférica',
    'MAGNETISMO': 'Força de atração magnética',
    'ELETRICIDADE': 'Fenômeno das cargas elétricas',
    'TERMODINAMICA': 'Estudo do calor e energia',
    'ENTROPIA': 'Medida da desordem',
    'CALOR': 'Energia térmica em trânsito',
    'TEMPERATURA': 'Medida da agitação molecular'
  },
  
  symbols: [
    '⭐', '🌟', '🌠', '🌌', '🪐',
    '🌍', '🌎', '🌏', '🌕', '🌖',
    '🌗', '🌘', '🌑', '🌒', '🌓',
    '🌔', '☄️', '🛸', '🚀', '🛰️',
    '⚡', '🔬', '🧪', '⚛️', '🔭',
    '📡', '💫', '✨', '🌈', '☀️'
  ],
  
  images: [
    'solar-system', 'galaxy', 'nebula', 'black-hole', 'supernova',
    'planet-earth', 'moon-phases', 'comet', 'asteroid', 'space-station',
    'telescope', 'atom-model', 'dna-helix', 'wave-pattern', 'magnetic-field'
  ]
};

export const getRandomWords = (count: number): string[] => {
  const shuffled = [...physicsAstronomyData.words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomSymbols = (count: number): string[] => {
  const shuffled = [...physicsAstronomyData.symbols].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

