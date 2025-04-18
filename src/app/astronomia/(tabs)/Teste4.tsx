import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AstronomiaHome = () => {
  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Cabeçalho */}
          <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>Astronomia</Text>
          <Text style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>Explore o universo</Text>
          
          {/* Seção de Destaques */}
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Destaques</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 32 }}
          >
            {/* Card de Destaque 1 */}
            <View style={{ 
              width: width * 0.8, 
              height: 180, 
              backgroundColor: '#222', 
              borderRadius: 16, 
              marginRight: 16,
              overflow: 'hidden'
            }}>
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.4)' 
              }} />
              <View style={{ padding: 16, flex: 1, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>Destaque</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>James Webb</Text>
                <Text style={{ color: '#DDD' }}>Nova descoberta nas nebulosas</Text>
              </View>
            </View>

            {/* Card de Destaque 2 */}
            <View style={{ 
              width: width * 0.8, 
              height: 180, 
              backgroundColor: '#222', 
              borderRadius: 16, 
              marginRight: 16,
              overflow: 'hidden'
            }}>
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.4)' 
              }} />
              <View style={{ padding: 16, flex: 1, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>Destaque</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>Missão Artemis</Text>
                <Text style={{ color: '#DDD' }}>O retorno à Lua em 2025</Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Seção de Ferramentas */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>Ferramentas</Text>
            <Text style={{ color: '#3B82F6' }}>Ver todas</Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 }}>
            {/* Calculadoras Astronômicas */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#4A5568', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="calculator" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Calculadoras Astronômicas</Text>
            </View>
            
            {/* Conversores */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#553C9A', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="swap-horizontal" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Conversores</Text>
            </View>
            
            {/* Olhos da NASA */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#2A4365', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="eye" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Olhos da NASA</Text>
            </View>
            
            {/* Exoplanet */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#1A365D', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="planet" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Exoplanet</Text>
            </View>
            
            {/* Satélites */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#2D3748', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="radio" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Satélites</Text>
            </View>
            
            {/* Visualização 3D */}
            <View style={{ 
              width: (width - 48) / 3, 
              height: 100, 
              backgroundColor: '#322659', 
              borderRadius: 12, 
              margin: 4,
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="cube" size={24} color="white" />
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 8, fontSize: 12 }}>Visualização 3D</Text>
            </View>
          </View>
          
          {/* Seção de Filmes */}
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Filmes Recomendados</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={{ marginBottom: 32 }}
          >
            {/* Filme 1 */}
            <View style={{ 
              width: width * 0.6, 
              backgroundColor: '#222', 
              borderRadius: 12, 
              marginRight: 16,
              overflow: 'hidden'
            }}>
              <View style={{ height: 140, backgroundColor: '#333' }} />
              <View style={{ padding: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Interestelar</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>2014</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>8.6</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Filme 2 */}
            <View style={{ 
              width: width * 0.6, 
              backgroundColor: '#222', 
              borderRadius: 12, 
              marginRight: 16,
              overflow: 'hidden'
            }}>
              <View style={{ height: 140, backgroundColor: '#333' }} />
              <View style={{ padding: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Contato</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>1997</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>7.5</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Filme 3 */}
            <View style={{ 
              width: width * 0.6, 
              backgroundColor: '#222', 
              borderRadius: 12, 
              marginRight: 16,
              overflow: 'hidden'
            }}>
              <View style={{ height: 140, backgroundColor: '#333' }} />
              <View style={{ padding: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Perdido em Marte</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>2015</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>8.0</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          
          {/* Seção de Exoplanetas */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>Exoplanetas Descobertos</Text>
            <Text style={{ color: '#3B82F6' }}>Ver tudo</Text>
          </View>
          
          <View style={{ marginBottom: 16 }}>
            {/* Linha 1 de Estatísticas */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
             
              {/* Total Confirmados */}
              <View style={{ 
                flex: 1, 
                height: 100, 
                borderRadius: 12, 
                overflow: 'hidden',
                marginRight: 8
              }}>
                <View style={{ 
                  padding: 16, 
                  height: '100%', 
                  backgroundColor: '#1A202C'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Total Confirmados</Text>
                    <Ionicons name="planet" size={20} color="white" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>5.273</Text>
                </View>
              </View>
              
              {/* TESS Confirmados */}
              <View style={{ 
                flex: 1, 
                height: 100, 
                borderRadius: 12, 
                overflow: 'hidden'
              }}>
                <View style={{ 
                  padding: 16, 
                  height: '100%', 
                  backgroundColor: '#2A4365'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>TESS Confirmados</Text>
                    <Ionicons name="telescope" size={20} color="white" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>342</Text>
                </View>
              </View>
            </View>
            
            {/* Linha 2 de Estatísticas */}
            <View style={{ flexDirection: 'row' }}>
              {/* Kepler Confirmados */}
              <View style={{ 
                flex: 1, 
                height: 100, 
                borderRadius: 12, 
                overflow: 'hidden',
                marginRight: 8
              }}>
                <View style={{ 
                  padding: 16, 
                  height: '100%', 
                  backgroundColor: '#322659'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Kepler Confirmados</Text>
                    <Ionicons name="aperture" size={20} color="white" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>2.712</Text>
                </View>
              </View>
              
              {/* K2 Confirmados */}
              <View style={{ 
                flex: 1, 
                height: 100, 
                borderRadius: 12, 
                overflow: 'hidden'
              }}>
                <View style={{ 
                  padding: 16, 
                  height: '100%', 
                  backgroundColor: '#44337A'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>K2 Confirmados</Text>
                    <Ionicons name="search" size={20} color="white" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 8 }}>517</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AstronomiaHome;