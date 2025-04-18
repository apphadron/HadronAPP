import { View, Text, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import stars from '@/assets/img/stars.png';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import ImageEyesOnSolarSystem from '@/assets/astronomia/EyesOn/EyesOnSolarSystem.png';
import ImageEyesOnAsteroids from '@/assets/astronomia/EyesOn/EyesOnAsteroids.png';
import ImageEyesOnTheEarth from '@/assets/astronomia/EyesOn/EyesOnTheEarth.png';
import ImageEyesOnExoplanets from '@/assets/astronomia/EyesOn/EyesOnExoplanets.png';
import { colors } from '@/styles/colors';
import { Container } from '@/components/geral/astro/Container';

interface EyesOnCard {
  image: any;
  description: string;
  uri: string;
}

const eyesOnData: EyesOnCard[] = [
  {
    image: ImageEyesOnSolarSystem,
    description: "Viaje pelo nosso Sistema Solar em 3D!",
    uri: "https://eyes.nasa.gov/apps/solar-system/#/home?featured=false&detailPanel=false&shareButton=false&menu=false&hd=true"
  },
  {
    image: ImageEyesOnAsteroids,
    description: "Explore asteroides próximos à Terra!",
    uri: "https://eyes.nasa.gov/apps/asteroids/#/home?featured=false&detailPanel=false&shareButton=false&menu=false&hd=true"
  },
  {
    image: ImageEyesOnTheEarth,
    description: "Observe a Terra em tempo real!",
    uri: "https://eyes.nasa.gov/apps/earth/#/home?featured=false&detailPanel=false&shareButton=false&menu=false&hd=true"
  },
  {
    image: ImageEyesOnExoplanets,
    description: "Descubra exoplanetas fascinantes!",
    uri: "https://eyes.nasa.gov/apps/exo/#/home?featured=false&detailPanel=false&shareButton=false&menu=false&hd=true"
  }
];

function EyesOnCard({ image, description, uri }: EyesOnCard) {
  return (
    <ImageBackground
      source={image}
      className="w-[95%] h-[120px] rounded-[20px] overflow-hidden my-2 border border-gray-700"
      resizeMode="contain"
      imageStyle={{
        top: -3,
        width: '100%',
        height: '165%',
        position: 'absolute',
      }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '100%' }}
      />

      <View className="h-full flex-row justify-center items-end gap-3">
        <Text className="font-poppins text-white text-sm leading-tight mb-5">
          {description}
        </Text>

        <Link 
          href={{
            pathname: "/astronomia/eyseOn/framesNASA/framesEyseOn",
            params: { uri }
          }} 
          asChild
        >
          <TouchableOpacity className='bg-white p-2 rounded-[50px] mb-4'>
            <Text className='text-black text-xs'>EXPLORAR!</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ImageBackground>
  );
}

export default function EyseOn() {
  return (
      <Container >
        <View className='justify-center items-center'>
        <ImageBackground
          source={stars}
          className="w-96 h-52 rounded-lg overflow-hidden my-2"
          resizeMode="cover"
        >
          <View style={{backgroundColor: colors.dark["--color-cinza-90"]}} className="flex-1 p-3">
            <View className="flex-1 justify-between gap-2">
              <Text className="font-orbitron text-white text-xl ">
                Eyse On NASA
              </Text>
              <Text className="font-poppins text-white text-sm leading-tight">
                Explore o universo de forma interativa com o Eyes on NASA! Essa incrível ferramenta permite visualizar em 3D e em tempo real as missões da NASA, planetas, asteróides e outros corpos celestes. Descubra informações detalhadas sobre missões espaciais, acompanhe satélites, veja a posição atual de sondas e explore o sistema solar como nunca antes.
              </Text>
            </View>
          </View>
        </ImageBackground>

        {eyesOnData.map((card, index) => (
          <EyesOnCard key={index} {...card} />
        ))}
        </View>
      </Container>
  );
} 