type Equation = {
  name: string;
  formula: string;
  variables: string[];
};

type Subarea = {
  name: string;
  equations: Record<string, Equation>;
};

type Area = {
  name: string;
  subareas: Record<string, Subarea>;
};

export const areas: Record<string, Area> = {
  mecanica: {
    name: "Mecânica",
    subareas: {
      cinematica: {
        name: "Cinemática",
        equations: {
          mru_position: {
            name: "Posição (MRU)",
            formula: "s = s0 + v * t",
            variables: ["s", "s0", "v", "t"],
          },
          mruv_velocity: {
            name: "Velocidade (MRUV)",
            formula: "v = v0 + a * t",
            variables: ["v", "v0", "a", "t"],
          },
          mruv_position: {
            name: "Posição (MRUV)",
            formula: "s = s0 + (v0 * t) + (0.5 * a * t^2)",
            variables: ["s", "s0", "v0", "a", "t"],
          },
          torricelli: {
            name: "Equação de Torricelli",
            formula: "v^2 = v0^2 + 2 * a * d",
            variables: ["v", "v0", "a", "d"],
          },
          tempo_de_queda: {
            name: "Tempo de Queda Livre",
            formula: "t = sqrt(2 * h / CONSTANT_g)",
            variables: ["t", "h", "CONSTANT_g"],
          },
          alcance_horizontal: {
            name: "Alcance Horizontal (Lançamento)",
            formula: "R = (v0^2 * sin(2 * theta)) / CONSTANT_g",
            variables: ["R", "v0", "theta", "CONSTANT_g"],
          },
          altura_maxima: {
            name: "Altura Máxima (Lançamento)",
            formula: "h = (v0^2 * sin(theta)^2) / (2 * CONSTANT_g)",
            variables: ["h", "v0", "theta", "CONSTANT_g"],
          },
          velocidade_angular: {
            name: "Velocidade Angular",
            formula: "w = theta / t",
            variables: ["w", "theta", "t"],
          },
          aceleracao_angular: {
            name: "Aceleração Angular",
            formula: "alpha = (w - w0) / t",
            variables: ["alpha", "w", "w0", "t"],
          },
          velocidade_tangencial: {
            name: "Velocidade Tangencial",
            formula: "v = w * r",
            variables: ["v", "w", "r"],
          },
          aceleracao_centripeta: {
            name: "Aceleração Centrípeta",
            formula: "ac = v^2 / r",
            variables: ["ac", "v", "r"],
          },
          periodo_movimento_circular: {
            name: "Período (Movimento Circular)",
            formula: "T = 2 * pi / w",
            variables: ["T", "w"],
          },
          frequencia: {
            name: "Frequência",
            formula: "f = 1 / T",
            variables: ["f", "T"],
          },
        },
      },
      dinamica: {
        name: "Dinâmica",
        equations: {
          segunda_lei_newton: {
            name: "Segunda Lei de Newton",
            formula: "F = m * a",
            variables: ["F", "m", "a"],
          },
          atrito: {
            name: "Força de Atrito",
            formula: "F_at = μ * N",
            variables: ["F_at", "μ", "N"],
          },
          forca_elastica: {
            name: "Lei de Hooke (Força Elástica)",
            formula: "F = k * x",
            variables: ["F", "k", "x"],
          },
          peso: {
            name: "Força Peso",
            formula: "P = m * CONSTANT_g",
            variables: ["P", "m", "CONSTANT_g"],
          },
          forca_gravitacional: {
            name: "Lei da Gravitação Universal",
            formula: "F = CONSTANT_G * (m1 * m2) / r^2",
            variables: ["F", "CONSTANT_G", "m1", "m2", "r"],
          },
          trabalho: {
            name: "Trabalho",
            formula: "W = F * d * cos(θ)",
            variables: ["W", "F", "d", "θ"],
          },
          potencia: {
            name: "Potência",
            formula: "P = W / t",
            variables: ["P", "W", "t"],
          },
          impulso: {
            name: "Impulso",
            formula: "I = F * Δt",
            variables: ["I", "F", "Δt"],
          },
          quantidade_movimento: {
            name: "Quantidade de Movimento",
            formula: "Q = m * v",
            variables: ["Q", "m", "v"],
          },
        },
      },
      energia: {
        name: "Energia",
        equations: {
          energia_cinetica: {
            name: "Energia Cinética",
            formula: "Ec = 0.5 * m * v^2",
            variables: ["Ec", "m", "v"],
          },
          energia_potencial_gravitacional: {
            name: "Energia Potencial Gravitacional",
            formula: "Ep = m * CONSTANT_g * h",
            variables: ["Ep", "m", "CONSTANT_g", "h"],
          },
          energia_potencial_elastica: {
            name: "Energia Potencial Elástica",
            formula: "Ep = 0.5 * k * x^2",
            variables: ["Ep", "k", "x"],
          },
          conservacao_energia: {
            name: "Conservação da Energia Mecânica",
            formula: "Em = Ec + Ep",
            variables: ["Em", "Ec", "Ep"],
          },
        },
      },
      hidrostatica: {
        name: "Hidrostática",
        equations: {
          pressao: {
            name: "Pressão",
            formula: "p = F / A",
            variables: ["p", "F", "A"],
          },
          pressao_hidrostatica: {
            name: "Pressão Hidrostática",
            formula: "p = ρ * CONSTANT_g * h",
            variables: ["p", "ρ", "CONSTANT_g", "h"],
          },
          teorema_stevin: {
            name: "Teorema de Stevin",
            formula: "p2 - p1 = ρ * CONSTANT_g * (h2 - h1)",
            variables: ["p2", "p1", "ρ", "CONSTANT_g", "h2", "h1"],
          },
          principio_pascal: {
            name: "Princípio de Pascal",
            formula: "F2 / F1 = A2 / A1",
            variables: ["F2", "F1", "A2", "A1"],
          },
          empuxo: {
            name: "Empuxo (Princípio de Arquimedes)",
            formula: "E = ρ_f * CONSTANT_g * V",
            variables: ["E", "ρ_f", "CONSTANT_g", "V"],
          },
          densidade: {
            name: "Densidade",
            formula: "ρ = m / V",
            variables: ["ρ", "m", "V"],
          },
        },
      },
    },
  },
  termologia: {
    name: "Termologia",
    subareas: {
      termometria: {
        name: "Termometria",
        equations: {
          conversao_celsius_fahrenheit: {
            name: "Conversão Celsius para Fahrenheit",
            formula: "F = (9/5) * C + 32",
            variables: ["F", "C"],
          },
          conversao_fahrenheit_celsius: {
            name: "Conversão Fahrenheit para Celsius",
            formula: "C = (5/9) * (F - 32)",
            variables: ["C", "F"],
          },
          conversao_celsius_kelvin: {
            name: "Conversão Celsius para Kelvin",
            formula: "K = C + 273.15",
            variables: ["K", "C"],
          },
          dilatacao_linear: {
            name: "Dilatação Linear",
            formula: "ΔL = L0 * α * ΔT",
            variables: ["ΔL", "L0", "α", "ΔT"],
          },
          dilatacao_superficial: {
            name: "Dilatação Superficial",
            formula: "ΔA = A0 * β * ΔT",
            variables: ["ΔA", "A0", "β", "ΔT"],
          },
          dilatacao_volumetrica: {
            name: "Dilatação Volumétrica",
            formula: "ΔV = V0 * γ * ΔT",
            variables: ["ΔV", "V0", "γ", "ΔT"],
          },
        },
      },
      calorimetria: {
        name: "Calorimetria",
        equations: {
          calor_sensivel: {
            name: "Calor Sensível",
            formula: "Q = m * c * ΔT",
            variables: ["Q", "m", "c", "ΔT"],
          },
          calor_latente: {
            name: "Calor Latente",
            formula: "Q = m * L",
            variables: ["Q", "m", "L"],
          },
          capacidade_termica: {
            name: "Capacidade Térmica",
            formula: "C = Q / ΔT",
            variables: ["C", "Q", "ΔT"],
          },
          calor_especifico: {
            name: "Calor Específico",
            formula: "c = Q / (m * ΔT)",
            variables: ["c", "Q", "m", "ΔT"],
          },
          potencia_termica: {
            name: "Potência Térmica",
            formula: "P = Q / t",
            variables: ["P", "Q", "t"],
          },
        },
      },
      termodinamica: {
        name: "Termodinâmica",
        equations: {
          lei_dos_gases_ideais: {
            name: "Equação de Estado dos Gases Ideais",
            formula: "p * V = n * CONSTANT_R * T",
            variables: ["p", "V", "n", "CONSTANT_R", "T"],
          },
          transformacao_isotermica: {
            name: "Transformação Isotérmica (Lei de Boyle)",
            formula: "p1 * V1 = p2 * V2",
            variables: ["p1", "V1", "p2", "V2"],
          },
          transformacao_isobarica: {
            name: "Transformação Isobárica (Lei de Charles)",
            formula: "V1 / T1 = V2 / T2",
            variables: ["V1", "T1", "V2", "T2"],
          },
          transformacao_isocoriaca: {
            name: "Transformação Isocórica (Lei de Gay-Lussac)",
            formula: "p1 / T1 = p2 / T2",
            variables: ["p1", "T1", "p2", "T2"],
          },
          trabalho_termodinamico: {
            name: "Trabalho Termodinâmico",
            formula: "W = p * ΔV",
            variables: ["W", "p", "ΔV"],
          },
          primeira_lei_termodinamica: {
            name: "Primeira Lei da Termodinâmica",
            formula: "ΔU = Q - W",
            variables: ["ΔU", "Q", "W"],
          },
          rendimento_maquina_termica: {
            name: "Rendimento de Máquina Térmica",
            formula: "η = W / Q_h",
            variables: ["η", "W", "Q_h"],
          },
          rendimento_maquina_carnot: {
            name: "Rendimento de Carnot",
            formula: "η = 1 - (T_f / T_q)",
            variables: ["η", "T_f", "T_q"],
          },
        },
      },
    },
  },
  ondulatoria: {
    name: "Ondulatória",
    subareas: {
      ondas_mecanicas: {
        name: "Ondas Mecânicas",
        equations: {
          velocidade_onda: {
            name: "Velocidade da Onda",
            formula: "v = λ * f",
            variables: ["v", "λ", "f"],
          },
          periodo_onda: {
            name: "Período",
            formula: "T = 1 / f",
            variables: ["T", "f"],
          },
          frequencia_onda: {
            name: "Frequência",
            formula: "f = 1 / T",
            variables: ["f", "T"],
          },
          velocidade_onda_corda: {
            name: "Velocidade de Ondas em Cordas",
            formula: "v = sqrt(F / μ)",
            variables: ["v", "F", "μ"],
          },
          equacao_onda: {
            name: "Equação da Onda",
            formula: "y = A * sin(k * x - ω * t)",
            variables: ["y", "A", "k", "x", "ω", "t"],
          },
          numero_onda: {
            name: "Número de Onda",
            formula: "k = 2 * pi / λ",
            variables: ["k", "λ"],
          },
          frequencia_angular: {
            name: "Frequência Angular",
            formula: "ω = 2 * pi * f",
            variables: ["ω", "f"],
          },
        },
      },
      acustica: {
        name: "Acústica",
        equations: {
          velocidade_som_ar: {
            name: "Velocidade do Som no Ar",
            formula: "v = 331 + 0.6 * T",
            variables: ["v", "T"],
          },
          efeito_doppler: {
            name: "Efeito Doppler",
            formula: "f' = f * ((v + v_o) / (v - v_f))",
            variables: ["f'", "f", "v", "v_o", "v_f"],
          },
          intensidade_sonora: {
            name: "Intensidade Sonora",
            formula: "I = P / A",
            variables: ["I", "P", "A"],
          },
          nivel_intensidade_sonora: {
            name: "Nível de Intensidade Sonora",
            formula: "β = 10 * log(I / I_0)",
            variables: ["β", "I", "I_0"],
          },
        },
      },
      optica: {
        name: "Óptica",
        equations: {
          lei_snell_descartes: {
            name: "Lei de Snell-Descartes",
            formula: "n1 * sin(θ1) = n2 * sin(θ2)",
            variables: ["n1", "θ1", "n2", "θ2"],
          },
          espelhos_planos_distancia_imagem: {
            name: "Espelhos Planos (Distância da Imagem)",
            formula: "p' = p",
            variables: ["p'", "p"],
          },
          espelhos_esfericosa_equacao_gauss: {
            name: "Equação de Gauss para Espelhos",
            formula: "1/f = 1/p + 1/p'",
            variables: ["f", "p", "p'"],
          },
          aumento_linear_espelhos: {
            name: "Aumento Linear (Espelhos)",
            formula: "A = -p'/p",
            variables: ["A", "p'", "p"],
          },
          lentes_equacao_gauss: {
            name: "Equação de Gauss para Lentes",
            formula: "1/f = 1/p + 1/p'",
            variables: ["f", "p", "p'"],
          },
          aumento_linear_lentes: {
            name: "Aumento Linear (Lentes)",
            formula: "A = p'/p",
            variables: ["A", "p'", "p"],
          },
          vergencia: {
            name: "Vergência (Dioptria)",
            formula: "C = 1/f",
            variables: ["C", "f"],
          },
        },
      },
    },
  },
  eletricidade: {
    name: "Eletricidade",
    subareas: {
      eletrostatica: {
        name: "Eletrostática",
        equations: {
          lei_coulomb: {
            name: "Lei de Coulomb",
            formula: "F = CONSTANT_k * (|q1 * q2|) / r^2",
            variables: ["F", "CONSTANT_k", "q1", "q2", "r"],
          },
          campo_eletrico: {
            name: "Campo Elétrico",
            formula: "E = F / q",
            variables: ["E", "F", "q"],
          },
          campo_carga_pontual: {
            name: "Campo de Carga Pontual",
            formula: "E = CONSTANT_k * |q| / r^2",
            variables: ["E", "k", "q", "r"],
          },
          potencial_eletrico: {
            name: "Potencial Elétrico",
            formula: "V = CONSTANT_k * q / r",
            variables: ["V", "k", "q", "r"],
          },
          trabalho_campo_eletrico: {
            name: "Trabalho do Campo Elétrico",
            formula: "W = q * (V_a - V_b)",
            variables: ["W", "q", "V_a", "V_b"],
          },
          capacitancia: {
            name: "Capacitância",
            formula: "C = Q / V",
            variables: ["C", "Q", "V"],
          },
          capacitor_placas_paralelas: {
            name: "Capacitor de Placas Paralelas",
            formula: "C = (ε * A) / d",
            variables: ["C", "ε", "A", "d"],
          },
          energia_campo_eletrico: {
            name: "Energia Armazenada em Capacitor",
            formula: "E = (1/2) * C * V^2",
            variables: ["E", "C", "V"],
          },
        },
      },
      eletrodinamica: {
        name: "Eletrodinâmica",
        equations: {
          corrente_eletrica: {
            name: "Corrente Elétrica",
            formula: "I = Q / t",
            variables: ["I", "Q", "t"],
          },
          lei_ohm: {
            name: "Lei de Ohm",
            formula: "V = R * I",
            variables: ["V", "R", "I"],
          },
          resistencia_eletrica: {
            name: "Resistência Elétrica",
            formula: "R = ρ * L / A",
            variables: ["R", "ρ", "L", "A"],
          },
          potencia_eletrica: {
            name: "Potência Elétrica",
            formula: "P = V * I",
            variables: ["P", "V", "I"],
          },
          efeito_joule: {
            name: "Efeito Joule",
            formula: "Q = R * I^2 * t",
            variables: ["Q", "R", "I", "t"],
          },
        },
      },
    },
  },
  fisica_moderna: {
    name: "Física Moderna",
    subareas: {
      relatividade: {
        name: "Relatividade",
        equations: {
          dilatacao_tempo: {
            name: "Dilatação do Tempo",
            formula: "Δt = Δt0 / sqrt(1 - v^2/c^2)",
            variables: ["Δt", "Δt0", "v", "c"],
          },
          contracao_espaco: {
            name: "Contração do Espaço",
            formula: "L = L0 * sqrt(1 - v^2/c^2)",
            variables: ["L", "L0", "v", "c"],
          },
          equivalencia_massa_energia: {
            name: "Equivalência Massa-Energia",
            formula: "E = m * c^2",
            variables: ["E", "m", "c"],
          },
        },
      },
      fisica_quantica: {
        name: "Física Quântica",
        equations: {
          energia_foton: {
            name: "Energia do Fóton",
            formula: "E = CONSTANT_h * f",
            variables: ["E", "CONSTANT_h", "f"],
          },
          efeito_fotoeletrico: {
            name: "Efeito Fotoelétrico",
            formula: "CONSTANT_h * f = φ + E_k",
            variables: ["CONSTANT_h", "f", "φ", "E_k"],
          },
          comprimento_onda_deBroglie: {
            name: "Comprimento de Onda de De Broglie",
            formula: "λ = CONSTANT_h / (m * v)",
            variables: ["λ", "CONSTANT_h", "m", "v"],
          },
        },
      },
    },
  },
};