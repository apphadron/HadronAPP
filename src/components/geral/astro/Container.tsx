import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';
import { ScrollView, ScrollViewProps, ViewStyle } from "react-native";

interface ContainerProps extends ScrollViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Container = ({ children, style, ...rest }: ContainerProps) => {
    const { isLight } = useTheme();

    return (
        <ScrollView
            style={[
                { backgroundColor: isLight ? colors.dark["--color-cinza-100"] : colors.dark["--color-cinza-100"] },
                style
            ]}
            {...rest}
        >
            {children}
        </ScrollView>
    );
};
