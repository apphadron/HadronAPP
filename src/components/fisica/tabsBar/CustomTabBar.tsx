import React from "react";
import { View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

interface TabBarIconProps {
  color: string;
  focused: boolean;
  iconName: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ color, focused, iconName }) => {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerActive,
      ]}
    >
      <FontAwesome
        size={28}
        name={iconName}
        color={focused ? colors.verde.primary : color}
      />
    </View>
  );
};

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={{ flex: 1, alignItems: "center" }}>
            <TabBarIcon
              color={options.tabBarInactiveTintColor || "white"}
              focused={isFocused}
              iconName={options.tabBarIcon.name}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    height: 65,
    borderRadius: 50,
    backgroundColor: "#49D983",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  iconContainer: {
    padding: 15,
    borderRadius: 50,
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "white",
  },
});

export default CustomTabBar;
