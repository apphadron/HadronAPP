import { useState, useEffect } from 'react';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { Tabs } from "expo-router";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { ThemeProvider, useTheme } from "@/components/geral/ThemeContext";
import { colors } from "@/styles/colors";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const TAB_WIDTH = width * 0.7;
  const TAB_HEIGHT = 60;
  const { isLight } = useTheme();


  return (
    <ThemeProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
          tabBarInactiveTintColor: "white",
          headerShown: true,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-90"],
              width: TAB_WIDTH,
              height: TAB_HEIGHT,
              borderRadius: TAB_HEIGHT / 2,
              bottom: 16,
              left: "15%",
              right: "15%",
            },
          ],
          tabBarShowLabel: false,
          tabBarItemStyle: styles.tabBarItemStyle,
          
        }}
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
                style={[styles.iconContainer, focused && styles.iconContainerActive]}
              >
                <Octicons size={28} name="home" color={color} />
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
                style={[styles.iconContainer, focused && styles.iconContainerActive]}
              >
                <FontAwesome size={28} name="user-o" color={color} />
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
                style={[styles.iconContainer, focused && styles.iconContainerActive]}
              >
                <FontAwesome size={28} name="cog" color={color} />
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
                style={[styles.iconContainer, focused && styles.iconContainerActive]}
              >
                <FontAwesome size={28} name="address-book-o" color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="Teste3"
          options={{
            title: "Teste 3",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[styles.iconContainer, focused && styles.iconContainerActive]}
              >
                <FontAwesome size={28} name="address-book-o" color={color} />
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
    bottom: 16,
    left: "15%",
    right: "15%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItemStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  iconContainer: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  iconContainerActive: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
