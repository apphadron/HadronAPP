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
import { getImageUrl } from "@/utils/getImageUrl";

const { width } = Dimensions.get("window");
const BOOK_ITEM_WIDTH = width * 0.38;
const CATEGORY_COLORS = {
  "Não-ficção": ["#F9A8D4", "#F472B6"],
  "Ficção": ["#93C5FD", "#60A5FA"],
  "Infantil": ["#FDE68A", "#FBBF24"],
  "Fantasia": ["#A78BFA", "#8B5CF6"],
  "Romance": ["#FDBA74", "#FB923C"],
  "Autoajuda": ["#86EFAC", "#4ADE80"],
  "História": ["#D1D5DB", "#9CA3AF"],
  "default": ["#C4B5FD", "#8B5CF6"],
};

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
  image_path: string | null;
}

interface FiltroBusca {
  categorias: string[];
  classificacoes: string[];
  edicoes: string[];
}

const LivroCard = ({ item, onPress }: { item: Livro; onPress: () => void }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

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

  useEffect(() => {
    const loadImage = async () => {
      if (item.image_path) {
        const url = await getImageUrl(item.image_path);
        setImageUri(url);
      }
    };
    loadImage();
  }, [item.image_path]);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 mb-3"
      style={{ width: BOOK_ITEM_WIDTH }}
    >
      <View className="rounded-lg overflow-hidden shadow-md bg-white">
        <View className="w-full aspect-[2/3]">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
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
          <View className="flex-row">{renderRatingStars(item.rating || 4)}</View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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

  const modalAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const buscarLivros = async () => {
      setLoading(true);
      try {
        const cachedData = await AsyncStorage.getItem("livros_cache");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          processarDadosLivros(parsed);
          buscarDadosAtualizados();
        } else {
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

  useEffect(() => {
    filtrarLivros();
  }, [buscaTexto, filtroBusca]);

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

      if (data) {
        await AsyncStorage.setItem("livros_cache", JSON.stringify(data));
        processarDadosLivros(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados atualizados:", error);
    }
  };

  const processarDadosLivros = (dados: Livro[]) => {
    const uniqueCategorias = Array.from(
      new Set(dados.map((livro) => livro.genero))
    ).filter(Boolean) as string[];

    const uniqueClassificacoes = Array.from(
      new Set(dados.map((livro) => livro.classificacao_idade))
    ).filter(Boolean) as string[];

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

  const filtrarLivros = () => {
    let resultados = [...livros];

    if (buscaTexto.trim() !== "") {
      const termoMinusculo = buscaTexto.toLowerCase().trim();
      resultados = resultados.filter(
        (livro) =>
          livro.nome.toLowerCase().includes(termoMinusculo) ||
          livro.autor.toLowerCase().includes(termoMinusculo)
      );
    }

    if (filtroBusca.categorias.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.categorias.includes(livro.genero)
      );
    }

    if (filtroBusca.classificacoes.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.classificacoes.includes(livro.classificacao_idade)
      );
    }

    if (filtroBusca.edicoes.length > 0) {
      resultados = resultados.filter((livro) =>
        filtroBusca.edicoes.includes(livro.edicao)
      );
    }

    setLivrosFiltrados(resultados);
    setFiltrosAtivos(
      filtroBusca.categorias.length > 0 ||
      filtroBusca.classificacoes.length > 0 ||
      filtroBusca.edicoes.length > 0
    );
  };

  const handleFiltroSelecao = (tipo: keyof FiltroBusca, valor: string) => {
    setFiltroBusca((atual) => {
      const atual_array = [...atual[tipo]];
      if (atual_array.includes(valor)) {
        return {
          ...atual,
          [tipo]: atual_array.filter((item) => item !== valor),
        };
      } else {
        return {
          ...atual,
          [tipo]: [...atual_array, valor],
        };
      }
    });
  };

  const limparFiltros = () => {
    setFiltroBusca({
      categorias: [],
      classificacoes: [],
      edicoes: [],
    });
  };

  const abrirModalFiltros = () => {
    setModalFiltroVisivel(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

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

  const renderizarLivro = ({ item }: { item: Livro }) => {
    return (
      <LivroCard
        item={item}
        onPress={() => router.push(`/fisica/livros/livroDetalhes?id=${item.id}`)}
      />
    );
  };

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
              setFiltroBusca({ ...filtroBusca, categorias: [categoria] });
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
            className={`w-10 h-10 rounded-full items-center justify-center ${filtrosAtivos ? "bg-purple-100" : "bg-gray-100"
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

          {(buscaTexto || filtrosAtivos) && (
            <Text className="text-gray-600 mb-3">
              {livrosFiltrados.length} {livrosFiltrados.length === 1 ? "resultado" : "resultados"} encontrados
            </Text>
          )}

          {!filtrosAtivos && buscaTexto === "" ? (
            categorias.map((cat) => renderizarCategoria(cat))
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {livrosFiltrados.map((livro) => (
                <LivroCard
                  key={livro.id}
                  item={livro}
                  onPress={() => router.push(`/livros/livroDetalhes?id=${livro.id}` as any)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

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
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Categorias
                </Text>
                <View className="flex-row flex-wrap">
                  {todasCategorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      onPress={() => handleFiltroSelecao("categorias", categoria)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${filtroBusca.categorias.includes(categoria)
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

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Classificação de Idade
                </Text>
                <View className="flex-row flex-wrap">
                  {todasClassificacoes.map((classificacao) => (
                    <TouchableOpacity
                      key={classificacao}
                      onPress={() => handleFiltroSelecao("classificacoes", classificacao)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${filtroBusca.classificacoes.includes(classificacao)
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

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Edição
                </Text>
                <View className="flex-row flex-wrap">
                  {todasEdicoes.slice(0, 6).map((edicao) => (
                    <TouchableOpacity
                      key={edicao}
                      onPress={() => handleFiltroSelecao("edicoes", edicao)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full ${filtroBusca.edicoes.includes(edicao)
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