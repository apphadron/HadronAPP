import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

interface BannerProps {
  backgroundColor: string;
  textColor: string;      
  text: string;            
  icon?: JSX.Element;     
}

const Banner: React.FC<BannerProps> = ({ backgroundColor, textColor, text, icon }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.banner, { backgroundColor, width: width }]}>
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'justify',
  },
});

export default Banner;
