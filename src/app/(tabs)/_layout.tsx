import { useState, useEffect } from 'react';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { Tabs } from "expo-router";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { ThemeProvider, useTheme } from "@/components/geral/ThemeContext";
import { colors } from "@/styles/colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isLight } = useTheme();

  // Número total de abas - atualize este valor quando adicionar/remover abas
  const TAB_COUNT = 6;

  // Cálculo responsivo para a barra de abas
  const TAB_BAR_WIDTH = Math.min(width * 0.85, 500); // Limita a largura máxima
  const TAB_HEIGHT = Math.min(60, width * 0.15); // Altura proporcional com limite
  const HORIZONTAL_PADDING = width * 0.075; // Padding horizontal para centralizar

  return (
    <ThemeProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
          tabBarInactiveTintColor: "white",
          headerShown: true,
          tabBarStyle: [
            styles.tabBar,
            route.name === "QRCode"
              ? { display: 'none' }
              : {
                  backgroundColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
                  width: TAB_BAR_WIDTH,
                  height: TAB_HEIGHT,
                  borderRadius: TAB_HEIGHT / 2,
                  bottom: Math.max(16, width * 0.04),
                  left: HORIZONTAL_PADDING,
                  right: HORIZONTAL_PADDING,
                },
          ],
          tabBarBackground: () => (
            <View style={[
              styles.tabBarBackground,
              {
                backgroundColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
                width: TAB_BAR_WIDTH,
                height: TAB_HEIGHT,
                borderRadius: TAB_HEIGHT / 2,
              }
            ]}>
            </View>
          ),
          tabBarShowLabel: false,
          tabBarItemStyle: [
            styles.tabBarItemStyle,
            {
              width: TAB_BAR_WIDTH / TAB_COUNT,
            }
          ],
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            title: "HADRON",
            headerTitleStyle: {
              color: isLight ? colors.default["--color-preto"] : colors.default["--color-branco"],
              fontSize: 23,
              fontFamily: "Orbitron_400Regular",
            },
            headerStyle: {
              backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"],
            },
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  style={{ color: isLight ? colors.default["--color-preto"] : colors.default["--color-branco"] }}
                  className='mr-5'
                  onPress={() => Alert.alert("Clicou")}
                  name="bell-outline"
                  size={25}
                  color="black"
                />
              </View>
            ),
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                  { width: (TAB_BAR_WIDTH / TAB_COUNT) * 0.8 } // Proporcional à largura do item
                ]}
              >
                <Octicons size={Math.min(28, TAB_HEIGHT * 0.4)} name="home" color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="UserPerfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                  { width: (TAB_BAR_WIDTH / TAB_COUNT) * 0.8 }
                ]}
              >
                <FontAwesome size={Math.min(28, TAB_HEIGHT * 0.4)} name="user-o" color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="QRCode"
          options={{
            headerShown: false,
            title: "QR Code",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  styles.qrCodeTabContainer,
                  {
                    backgroundColor: colors.light["--color-roxo-100"],
                    width: TAB_HEIGHT * 1.1,
                    height: TAB_HEIGHT * 1.1,
                    marginTop: -TAB_HEIGHT * 0.3,
                    borderWidth: 5,
                    borderColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
                  }
                ]}
              >
                <MaterialCommunityIcons 
                  size={Math.min(38, TAB_HEIGHT * 0.6)} 
                  name="qrcode-scan" 
                  color={isLight ? colors.default["--color-branco"] : colors.default["--color-preto"]} 
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="Teste"
          options={{
            title: "Teste",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                  { width: (TAB_BAR_WIDTH / TAB_COUNT) * 0.8 }
                ]}
              >
                <FontAwesome size={Math.min(28, TAB_HEIGHT * 0.4)} name="cog" color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="Teste2"
          options={{
            title: "Teste 2",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerActive,
                  { width: (TAB_BAR_WIDTH / TAB_COUNT) * 0.8 }
                ]}
              >
                <FontAwesome size={Math.min(28, TAB_HEIGHT * 0.4)} name="address-book-o" color={color} />
              </View>
            ),
          }}
        />

      </Tabs>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  qrCodeCurve: {
    position: 'absolute',
    top: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabBarItemStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  iconContainer: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    height: "80%",
  },
  iconContainerActive: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCodeTabContainer: {
    zIndex: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});