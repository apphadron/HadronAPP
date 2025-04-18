import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';
import { ScrollView, ScrollViewProps, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContainerProps extends ScrollViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Container = ({ children, style, ...rest }: ContainerProps) => {
    const { isLight } = useTheme();

    return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={[
                    { backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"] },
                    style
                ]}
                {...rest}
            >
                {children}
            </ScrollView>
    );
};
