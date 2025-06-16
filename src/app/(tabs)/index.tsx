import { View } from 'react-native';
import { AcessoRapido, FerramentaItem } from '@/components/fisica/acessoRapido';
import { Destaques } from '@/components/fisica/destaques/destaquesDB';
import { CardAstronomia } from '@/components/fisica/cards/astronomia2';
import * as Icon from '@/assets/icons/';
import FourContents from '@/components/fisica/sessoes/fourContents';
import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';
import { ReadingSection } from '@/components/fisica/carrosselCard/LivrosSessao';
import { Container } from '@/components/geral/Container';
import { HomeVideoSection } from '@/components/fisica/videos/HomeVideoSection';
import { VerdadeFake } from '@/components/fisica/verdadeFake/VerdadeFake';
import { CardComponent } from '@/components/geral/CardComponent';
import RealFakeImag from '@/assets/backgrounds/vectors/RealFakeImg';
import PhysicsCarousel from '@/components/fisica/sessoes/VejaMais';

const ferramentas: FerramentaItem[] = [
  { id: 1, icon: Icon.calculator, title: 'Calculadora', rota: '/fisica/ferramentas/calculadoras/Calculadora' },
  { id: 2, icon: Icon.converter, title: 'Conversores', rota: '/fisica/ferramentas/conversores/HomeConversores' },
  { id: 3, icon: Icon.quiz, title: 'Fórmulas', rota: '/astronomia/BuscaExplanetas/SearchExoplanet' },
  { id: 4, icon: Icon.paquimetro, title: 'Laboratório', rota: '/fisica/ferramentas/laboratorio/LaboratorioScreen' },
  { id: 5, icon: Icon.clock, title: 'Constantes', rota: '/fisica/ferramentas/cronometro/Cronometro' },
  { id: 6, icon: Icon.game, title: 'Unidades de Medidas', rota: '/fisica/jogos/memoryGame/memoryGame' },
  { id: 7, icon: Icon.graph, title: 'Gráficos', rota: '/fisica/ferramentas/grafico/MathGrafico' },
  { id: 8, icon: Icon.Icon360, title: 'Glossário', rota: '/fisica/areasFisica/areasFisica' },
];

export default function Home() {
  const { isLight } = useTheme();
  return (
    <Container style={{
      flex: 1,
      backgroundColor: isLight
        ? colors.default["--color-branco"]
        : colors.dark["--color-cinza-100"],
      paddingBottom: 90,
    }}
      contentContainerStyle={{ paddingBottom: 80 }}>

      <View className='flex-1 gap-5'>
        <Destaques area="FISICA" />

        <AcessoRapido ferramentas={ferramentas} />

        <CardAstronomia />

        <PhysicsCarousel />

        <HomeVideoSection />

        <VerdadeFake />

        <ReadingSection />

        <VerdadeFake />

        <FourContents />

        <CardComponent
          titulo="Quais áreas de atuação de um Físico? Descubra!"
          texto="Cerca de 85% da matéria do universo é composta por matéria escura, uma substância invisível que não interage com a luz. Sua presença é inferida pelos efeitos gravitacionais que exerce sobre a matéria visível."
          backgroundColor={colors.light["--color-verde-90"]}
          textColor="#FFFFFF"
          image={<RealFakeImag width={85} height={85} />}
          style={{ margin: 10 }}
        />
      </View>

    </Container>
  );
}