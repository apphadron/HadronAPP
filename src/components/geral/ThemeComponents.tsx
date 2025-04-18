import React from 'react';
import {
    TouchableOpacity,
    FlatList,
    View,
    Text,
    ScrollView,
    TouchableOpacityProps,
    FlatListProps,
    ViewProps,
    TextProps,
    ScrollViewProps
} from 'react-native';
import { useTheme } from '@/components/geral/ThemeContext';
import { colors } from '@/styles/colors';

// Componente ThemedView
export const ThemedView: React.FC<ViewProps> = ({ style, ...props }) => {
    const { isLight } = useTheme();
    return (
        <View
            style={[
                {
                    backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-90"],
                },
                style,
            ]}
            {...props}
        />
    );
};

// Componente ThemedText
export const ThemedText: React.FC<TextProps> = ({ style, ...props }) => {
    const { isLight } = useTheme();
    return (
        <Text
            style={[
                {
                    color: isLight ? '#000' : '#fff',
                },
                style,
            ]}
            {...props}
        />
    );
};

// Componente ThemedTouchableOpacity
export const ThemedTouchableOpacity: React.FC<TouchableOpacityProps> = ({ style, ...props }) => {
    const { isLight } = useTheme();
    return (
        <TouchableOpacity
            style={[
                {
                    backgroundColor: isLight ? colors.light["--color-roxo-100"] : colors.dark["--color-cinza-40"],
                },
                style,
            ]}
            {...props}
        />
    );
};

// Componente ThemedFlatList
export const ThemedFlatList = <T,>({ style, ...props }: FlatListProps<T>) => {
    const { isLight } = useTheme();
    return (
        <FlatList
            style={[
                {
                    backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"],
                },
                style,
            ]}
            {...props}
        />
    );
};

// Componente ThemedScrollView
export const ThemedScrollView: React.FC<ScrollViewProps> = ({ style, ...props }) => {
    const { isLight } = useTheme();
    return (
        <ScrollView
            style={[
                {
                    backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"],
                },
                style,
            ]}
            {...props}
        />
    );
};
