import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Image, StyleSheet } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/geral/ThemeContext';
import { colors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';

interface SettingRowProps {
  icon: {
    name: string;
    color: string;
  };
  label: string;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, switchValue, onSwitchChange }) => {
  const { isLight } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: icon.color }]}>
        <FeatherIcon color={colors.light["--color-roxo-100"]} name="chevron-right" size={20} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.light["--color-roxo-90"] }]}>{label}</Text>
      <View style={styles.rowSpacer} />
      {onSwitchChange && (
        <Switch
          onValueChange={onSwitchChange}
          value={switchValue}
          trackColor={{
            false: isLight ? colors.light["--color-verde-100"] : colors.light["--color-verde-100"],

            true: isLight ? colors.light["--color-verde-100"] : colors.light["--color-verde-100"], 
          }}
          thumbColor={switchValue ? (isLight ? colors.light["--color-roxo-100"] : colors.light["--color-roxo-100"]) : (isLight ? colors.light["--color-roxo-100"] : colors.light["--color-roxo-100"])}
        />

      )}
      <FeatherIcon color={colors.light["--color-roxo-80"]} name="chevron-right" size={20} />
    </View>
  );
};

// Defina um tipo para os nomes de ícones
type IconName = keyof typeof Feather.glyphMap;

const ActionButton = ({ label, iconName, iconColor, onPress }: { label: string; iconName: IconName; iconColor: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: iconColor }]}>
      <FeatherIcon color="#fff" name={iconName} size={20} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowSpacer} />
    <FeatherIcon color="#C6C6C6" name="chevron-right" size={20} />
  </TouchableOpacity>
);

export default function UserPerfil() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });

  const [darkMode, setDarkMode] = useState(theme === 'dark');

  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    toggleTheme();
  };

  useEffect(() => {
    setDarkMode(theme === 'dark');
  }, [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.light["--color-verde-80"] }]}>Preferências</Text>

          <SettingRow
            icon={{ name: 'globe', color: '#fe9400' }}
            label="Idioma"
          />

          <SettingRow
            icon={{ name: 'moon', color: '#007afe' }}
            label="Modo escuro"
            switchValue={darkMode}
            onSwitchChange={handleToggleDarkMode}
          />

          <SettingRow
            icon={{ name: 'navigation', color: '#32c759' }}
            label="Location"
          />
          <SettingRow
            icon={{ name: 'at-sign', color: '#38C959' }}
            label="Email Notifications"
            switchValue={form.emailNotifications}
            onSwitchChange={emailNotifications => setForm({ ...form, emailNotifications })}
          />
          <SettingRow
            icon={{ name: 'bell', color: '#38C959' }}
            label="Notificações"
            switchValue={form.pushNotifications}
            onSwitchChange={pushNotifications => setForm({ ...form, pushNotifications })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <ActionButton label="Report Bug" iconName="flag" iconColor="#8e8d91" onPress={() => { /* handle onPress */ }} />
          <ActionButton label="Contato" iconName="mail" iconColor="#007afe" onPress={() => { /* handle onPress */ }} />
          <ActionButton label="Rate in App Store" iconName="star" iconColor="#32c759" onPress={() => { /* handle onPress */ }} />
          <ActionButton label="Créditos" iconName="star" iconColor="#32c759" onPress={() => { /* handle onPress */ }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    paddingHorizontal: 24,
    
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});
