import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  Keyboard
} from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/db/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const BOOK_ITEM_WIDTH = width * 0.38;
const CATEGORY_COLORS = {
  "Não-ficção": ["#F9A8D4", "#F472B6"], // Rosa - Non-fiction
  "Ficção": ["#93C5FD", "#60A5FA"], // Azul - Fiction
  "Infantil": ["#FDE68A", "#FBBF24"], // Amarelo - Children
  "Fantasia": ["#A78BFA", "#8B5CF6"], // Roxo - Fantasy
  "Romance": ["#FDBA74", "#FB923C"], // Laranja - Romance
  "Autoajuda": ["#86EFAC", "#4ADE80"], // Verde - Self-help
  "História": ["#D1D5DB", "#9CA3AF"], // Cinza - History
  "default": ["#C4B5FD", "#8B5CF6"], // Roxo padrão
};

// Tipos de dados
interface Livro {
  id: number;
  nome: string;
  autor: string;
  image_url: string | null;
  genero: string;
  classificacao_idade: string;
  edicao: string;
  idioma: string;
  rating?: number;
}

interface FiltroBusca {
  categorias: string[];
  classificacoes: string[];
  edicoes: string[];
}

export default function LivrosPorCategoria() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState<Livro[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [filtroBusca, setFiltroBusca] = useState<FiltroBusca>({
    categorias: [],
    classificacoes: [],
    edicoes: [],
  });
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [todasCategorias, setTodasCategorias] = useState<string[]>([]);
  const [todasClassificacoes, setTodasClassificacoes] = useState<string[]>([]);
  const [todasEdicoes, setTodasEdicoes] = useState<string[]>([]);
  const [filtrosAtivos, setFiltrosAtivos] = useState(false);
  const router = useRouter();
  
  // Animação para o modal
  const modalAnimation = useRef(new Animated.Value(0)).current;
  
  // Animação para o campo de busca
  const searchAnimation = useRef(new Animated.Value(0)).current;

  // Efeito para buscar os livros ao iniciar
  useEffect(() => {
    const buscarLivros = async () => {
      setLoading(true);
      try {
        // Verificar se existe cache
        const cachedData = await AsyncStorage.getItem("livros_cache");
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          processarDadosLivros(parsed);
          // Buscar dados atualizados em background
          buscarDadosAtualizados();
        } else {
          // Se não há cache, busca do banco
          await buscarDadosAtualizados();
        }
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarLivros();
  }, []);

  // Efeito para filtrar os livros quando a busca ou filtros mudam
  useEffect(() => {
    filtrarLivros();
  }, [buscaTexto, filtroBusca]);

  // Função para buscar dados atualizados do Supabase
  const buscarDadosAtualizados = async () => {
    try {
      const { data, error } = await supabase
        .from("livros")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Erro na consulta:", error);
        return;
      }

      // Processar os dados e salvar no cache
      if (data) {
        await AsyncStorage.setItem("livros_cache", JSON.stringify(data));
        processarDadosLivros(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados atualizados:", error);
    }
  };

  // Processar os dados dos livros para extrair categorias e configurar estados
  const processarDadosLivros = (dados: Livro[]) => {
    // Extrair categorias únicas
    const uniqueCategorias = Array.from(
      new Set(dados.map((livro) => livro.genero))
    ).filter(Boolean) as string[];
    
    // Extrair classificações únicas
    const uniqueClassificacoes = Array.from(
      new Set(dados.map((livro) => livro.classificacao_idade))
    ).filter(Boolean) as string[];
    
    // Extrair edições únicas
    const uniqueEdicoes = Array.from(
      new Set(dados.map((livro) => livro.edicao))
    ).filter(Boolean) as string[];

    setLivros(dados);
    setLivrosFiltrados(dados);
    setCategorias(uniqueCategorias);
    setTodasCategorias(uniqueCategorias);
    setTodasClassificacoes(uniqueClassificacoes);
    setTodasEdicoes(uniqueEdicoes);
  };

  // Filtrar livros com base na busca e filtros
  const filtrarLivros = () => {
    let resultados = [...livros];
    
    // Filtrar por texto de busca (nome ou autor)
    if (buscaTexto.trim() !== "") {
      const termoMinusculo = buscaTexto.toLowerCase().trim();
      resultados = resultados.filter(
        (livro) =>
          livro.nome.toLowerCase().includes(termoMinusculo) ||
          livro.autor.toLowerCase().includes(termoMinusculo)
      );
    }
    
    // Aplicar filtros de categoria
    if (filtroBusca.categorias.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.categorias.includes(livro.genero)
      );
    }
    
    // Aplicar filtros de classificação
    if (filtroBusca.classificacoes.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.classificacoes.includes(livro.classificacao_idade)
      );
    }
    
    // Aplicar filtros de edição
    if (filtroBusca.edicoes.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.edicoes.includes(livro.edicao)
      );
    }
    
    setLivrosFiltrados(resultados);
    
    // Verificar se há filtros ativos
    const temFiltrosAtivos = 
      filtroBusca.categorias.length > 0 || 
      filtroBusca.classificacoes.length > 0 || 
      filtroBusca.edicoes.length > 0;
      
    setFiltrosAtivos(temFiltrosAtivos);
  };

  // Lidar com a seleção de filtros
  const handleFiltroSelecao = (tipo: keyof FiltroBusca, valor: string) => {
    setFiltroBusca((atual) => {
      const atual_array = [...atual[tipo]];
      
      if (atual_array.includes(valor)) {
        // Remover o valor se já estiver selecionado
        return {
          ...atual,
          [tipo]: atual_array.filter((item) => item !== valor),
        };
      } else {
        // Adicionar o valor se não estiver selecionado
        return {
          ...atual,
          [tipo]: [...atual_array, valor],
        };
      }
    });
  };

  // Limpar todos os filtros
  const limparFiltros = () => {
    setFiltroBusca({
      categorias: [],
      classificacoes: [],
      edicoes: [],
    });
  };

  // Abrir modal de filtros com animação
  const abrirModalFiltros = () => {
    setModalFiltroVisivel(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  // Fechar modal de filtros com animação
  const fecharModalFiltros = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      setModalFiltroVisivel(false);
    });
  };

  // Expandir/contrair campo de busca
  const [campoBuscaExpandido, setCampoBuscaExpandido] = useState(false);
  const toggleCampoBusca = () => {
    if (!campoBuscaExpandido) {
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }).start();
      setCampoBuscaExpandido(true);
    } else {
      if (buscaTexto === "") {
        Animated.timing(searchAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.in(Easing.cubic),
        }).start();
        setCampoBuscaExpandido(false);
        Keyboard.dismiss();
      }
    }
  };

  // Renderizar um livro
  const renderizarLivro = ({ item }: { item: Livro }) => {
    const ratingStars = renderRatingStars(item.rating || 4);
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/livros/livroDetalhes/${item.id}` as Href<`/livros/livroDetalhes/${number}`>)}
        className="mr-3 mb-3"
        style={{ width: BOOK_ITEM_WIDTH }}
      >
        <View
          className="rounded-lg overflow-hidden shadow-md bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="w-full aspect-[2/3]">
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 items-center justify-center">
                <Ionicons
                  name="book-outline"
                  size={40}
                  color={colors.light["--color-roxo-70"]}
                />
              </View>
            )}
          </View>
          <View className="p-2">
            <Text numberOfLines={1} className="text-sm font-medium text-gray-900">
              {item.nome}
            </Text>
            <Text numberOfLines={1} className="text-xs text-gray-600 mb-1">
              {item.autor}
            </Text>
            <View className="flex-row">{ratingStars}</View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar categoria com seus livros
  const renderizarCategoria = (categoria: string) => {
    const livrosDaCategoria = livrosFiltrados.filter(
      (livro) => livro.genero === categoria
    );

    if (livrosDaCategoria.length === 0) return null;

    const gradientColors = CATEGORY_COLORS[categoria as keyof typeof CATEGORY_COLORS] || 
                           CATEGORY_COLORS.default;

    return (
      <View className="mb-6" key={categoria}>
        <View className="flex-row items-center mb-3">
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-1 h-6 rounded-full mr-2"
          />
          <Text className="text-lg font-bold text-gray-900">{categoria}</Text>
          <TouchableOpacity 
            className="ml-auto flex-row items-center"
            onPress={() => {
              // Ação para ver todos os livros da categoria
              setFiltroBusca({...filtroBusca, categorias: [categoria]});
            }}
          >
            <Text className="text-sm text-purple-600 mr-1">Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.light["--color-roxo-70"]} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={livrosDaCategoria}
          renderItem={renderizarLivro}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 2 }}
        />
      </View>
    );
  };

  // Renderizar estrelas de avaliação
  const renderRatingStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <AntDesign
            key={`star-${i}`}
            name="star"
            size={10}
            color="#FFD700"
            style={{ marginRight: 1 }}
          />
        );
      } else if (i === fullStars && halfStar) {
        stars.push(
          <AntDesign
            key={`star-half-${i}`}
            name="staro"
            size={10}
            color="#FFD700"
            style={{ marginRight: 1 }}
          />
        );
      } else {
        stars.push(
          <AntDesign
            key={`star-empty-${i}`}
            name="staro"
            size={10}
            color="#D1D5DB"
            style={{ marginRight: 1 }}
          />
        );
      }
    }

    return stars;
  };

  // Renderizar chip de filtro
  const renderFiltroChip = (texto: string, onRemove: () => void) => {
    return (
      <View className="flex-row items-center bg-purple-100 rounded-full px-2 py-1 mr-2 mb-2">
        <Text className="text-xs text-purple-800 mr-1">{texto}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Ionicons name="close-circle" size={16} color={colors.light["--color-roxo-70"]} />
        </TouchableOpacity>
      </View>
    );
  };

  // Calcular estilos para componentes animados
  const searchWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["15%", "85%"]
  });

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0]
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header com busca */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Biblioteca</Text>

        <View className="flex-row items-center">
          <Animated.View
            style={{
              width: searchWidth,
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 20,
              paddingHorizontal: 12,
              marginRight: 8,
            }}
          >
            {campoBuscaExpandido && (
              <TextInput
                placeholder="Buscar livros..."
                value={buscaTexto}
                onChangeText={setBuscaTexto}
                className="flex-1 text-gray-800"
                autoCapitalize="none"
                onFocus={() => setCampoBuscaExpandido(true)}
              />
            )}
            <TouchableOpacity onPress={toggleCampoBusca}>
              <Ionicons name="search" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              filtrosAtivos ? "bg-purple-100" : "bg-gray-100"
            }`}
            onPress={abrirModalFiltros}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={filtrosAtivos ? colors.light["--color-roxo-70"] : "#6B7280"}
            />
            {filtrosAtivos && (
              <View className="absolute top-0 right-0 w-3 h-3 bg-purple-600 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.light["--color-roxo-70"]} />
          <Text className="mt-2 text-gray-600">Carregando livros...</Text>
        </View>
      ) : livrosFiltrados.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="search-outline" size={60} color="#D1D5DB" />
          <Text className="text-lg text-gray-900 font-medium mt-4 mb-2 text-center">
            Nenhum livro encontrado
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            Tente ajustar seus filtros ou termos de busca.
          </Text>
          <TouchableOpacity
            className="bg-purple-600 px-6 py-3 rounded-full"
            onPress={limparFiltros}
          >
            <Text className="text-white font-medium">Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          {/* Chips de filtros selecionados */}
          {filtrosAtivos && (
            <View className="flex-row flex-wrap mb-4 mt-1">
              {filtroBusca.categorias.map((cat) => (
                renderFiltroChip(cat, () => handleFiltroSelecao("categorias", cat))
              ))}
              {filtroBusca.classificacoes.map((classe) => (
                renderFiltroChip(classe, () => handleFiltroSelecao("classificacoes", classe))
              ))}
              {filtroBusca.edicoes.map((ed) => (
                renderFiltroChip(ed, () => handleFiltroSelecao("edicoes", ed))
              ))}
              {filtrosAtivos && (
                <TouchableOpacity 
                  className="flex-row items-center px-2 py-1"
                  onPress={limparFiltros}
                >
                  <Text className="text-xs text-purple-700">Limpar todos</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Se houver texto de busca ou filtros, mostrar a contagem de resultados */}
          {(buscaTexto || filtrosAtivos) && (
            <Text className="text-gray-600 mb-3">
              {livrosFiltrados.length} {livrosFiltrados.length === 1 ? "resultado" : "resultados"} encontrados
            </Text>
          )}

          {/* Se não houver filtros ativos, mostrar as categorias */}
          {!filtrosAtivos && buscaTexto === "" ? (
            categorias.map((cat) => renderizarCategoria(cat))
          ) : (
            // Se houver filtros ou busca, mostrar grid de livros
            <View className="flex-row flex-wrap justify-between">
              {livrosFiltrados.map((livro) => (
                <TouchableOpacity
                  key={livro.id}
                  onPress={() => router.push(`/livros/livroDetalhes/${livro.id}` as Href)}
                  className="mb-4"
                  style={{ width: (width - 40) / 2 }}
                >
                  <View
                    className="rounded-lg overflow-hidden shadow-md bg-white"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View className="w-full aspect-[2/3]">
                      {livro.image_url ? (
                        <Image
                          source={{ uri: livro.image_url }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full bg-gray-200 items-center justify-center">
                          <Ionicons
                            name="book-outline"
                            size={40}
                            color={colors.light["--color-roxo-70"]}
                          />
                        </View>
                      )}
                    </View>
                    <View className="p-2">
                      <Text numberOfLines={1} className="text-sm font-medium text-gray-900">
                        {livro.nome}
                      </Text>
                      <Text numberOfLines={1} className="text-xs text-gray-600 mb-1">
                        {livro.autor}
                      </Text>
                      <View className="flex-row">
                        {renderRatingStars(livro.rating || 4)}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal de filtros */}
      <Modal
        visible={modalFiltroVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharModalFiltros}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity
            className="absolute top-0 left-0 right-0 bottom-0"
            activeOpacity={1}
            onPress={fecharModalFiltros}
          />
          
          <Animated.View
            style={{
              transform: [{ translateY: modalTranslateY }],
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: "white",
              padding: 20,
              maxHeight: "80%",
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Filtros</Text>
              <TouchableOpacity onPress={fecharModalFiltros}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Filtro de Categorias */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Categorias
                </Text>
                <View className="flex-row flex-wrap">
                  {todasCategorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      onPress={() => handleFiltroSelecao("categorias", categoria)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                        filtroBusca.categorias.includes(categoria)
                          ? "bg-purple-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filtroBusca.categorias.includes(categoria)
                            ? "text-white"
                            : "text-gray-800"
                        }
                      >
                        {categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Classificação */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Classificação de Idade
                </Text>
                <View className="flex-row flex-wrap">
                  {todasClassificacoes.map((classificacao) => (
                    <TouchableOpacity
                      key={classificacao}
                      onPress={() => handleFiltroSelecao("classificacoes", classificacao)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                        filtroBusca.classificacoes.includes(classificacao)
                          ? "bg-purple-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filtroBusca.classificacoes.includes(classificacao)
                            ? "text-white"
                            : "text-gray-800"
                        }
                      >
                        {classificacao}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro de Edição */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Edição
                </Text>
                <View className="flex-row flex-wrap">
                  {todasEdicoes.slice(0, 6).map((edicao) => (
                    <TouchableOpacity
                      key={edicao}
                      onPress={() => handleFiltroSelecao("edicoes", edicao)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                        filtroBusca.edicoes.includes(edicao)
                          ? "bg-purple-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={
                          filtroBusca.edicoes.includes(edicao)
                            ? "text-white"
                            : "text-gray-800"
                        }
                      >
                        {edicao}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row pt-4 border-t border-gray-200 mt-2">
              <TouchableOpacity
                className="flex-1 mr-2 py-3 items-center justify-center rounded-lg border border-gray-300"
                onPress={limparFiltros}
              >
                <Text className="text-gray-700 font-medium">Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 ml-2 py-3 items-center justify-center rounded-lg bg-purple-600"
                onPress={fecharModalFiltros}
              >
                <Text className="text-white font-medium">Aplicar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}