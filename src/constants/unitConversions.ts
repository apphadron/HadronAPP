export const conversions = {
  length: {
    m: 1, // metro é a unidade base
    inch: 0.0254, // polegada para metro
    foot: 0.3048, // pé para metro
    yard: 0.9144, // jarda para metro
    mile: 1609.34, // milha para metro
    km: 1000, // quilômetro para metro
  },
  area: {
    m2: 1, // metro quadrado é a unidade base
    sqin: 0.00064516, // polegada quadrada para metro quadrado
    sqft: 0.092903, // pé quadrado para metro quadrado
    sqyd: 0.836127, // jarda quadrada para metro quadrado
    sqmi: 2589988.11, // milha quadrada para metro quadrado
    hectare: 10000, // hectare para metro quadrado
    acre: 4046.86, // acre para metro quadrado
  },
  volume: {
    m3: 1, // metro cúbico é a unidade base
    l: 0.001, // litro para metro cúbico
    cc: 0.000001, // centímetro cúbico para metro cúbico
    cuin: 1.6387e-5, // polegada cúbica para metro cúbico
    cuft: 0.0283168, // pé cúbico para metro cúbico
    cup: 0.000236588, // xícara para metro cúbico
    pint: 0.000473176, // pint para metro cúbico
    gallon: 0.00378541, // galão para metro cúbico
  },
  mass: {
    g: 1, // grama é a unidade base
    kg: 1000, // quilograma para grama
    lb: 453.592, // libra para grama
    oz: 28.3495, // onça para grama
    mg: 0.001, // miligrama para grama
    ton: 1e6, // tonelada métrica para grama
  },
  time: {
    s: 1, // segundo é a unidade base
    min: 60, // minuto para segundo
    h: 3600, // hora para segundo
    d: 86400, // dia para segundo
    w: 604800, // semana para segundo
    ms: 0.001, // milissegundo para segundo
  },
  temperature: {
    K: 1, // kelvin é a unidade base
    degC: (val: number) => val + 273.15, // Celsius para Kelvin
    degF: (val: number) => (val - 32) * 5 / 9 + 273.15, // Fahrenheit para Kelvin
  },
  energy: {
    J: 1, // joule é a unidade base
    cal: 4.184, // caloria para joule
    eV: 1.60218e-19, // elétron-volt para joule
    kWh: 3.6e6, // quilowatt-hora para joule
    BTU: 1055.06, // unidade térmica britânica para joule
  },
  power: {
    W: 1, // watt é a unidade base
    hp: 745.7, // cavalo-vapor para watt
    kW: 1000, // quilowatt para watt
  },
  pressure: {
    Pa: 1, // Pascal é a unidade base
    atm: 101325, // atmosfera para Pascal
    bar: 100000, // bar para Pascal
    psi: 6894.76, // psi para Pascal
    torr: 133.322, // Torr para Pascal
  },
  speed: {
    mps: 1, // metro por segundo é a unidade base
    kmph: 0.277778, // quilômetro por hora para metro por segundo
    mph: 0.44704, // milha por hora para metro por segundo
    knot: 0.514444, // nó para metro por segundo
  },
  angle: {
    rad: 1, // radiano é a unidade base
    deg: Math.PI / 180, // grau para radiano
    grad: Math.PI / 200, // gradiano para radiano
  },
};
