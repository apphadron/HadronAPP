import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
//import { loginUsuario } from "./auth";
import { colors } from '@/styles/colors';
import { useRouter } from 'expo-router';

export default function Login() {
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function handleLogin() {
    //const resposta = await loginUsuario(user, senha);
    //Alert.alert(resposta.mensagem);
  }

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      <Text className="text-2xl font-bold mb-6">Login</Text>
      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded"
        placeholder="Username"
        //value={username}
        //onChangeText={setUsername}
      />
      <TextInput
        className="w-full p-3 mb-4 border border-gray-300 rounded"
        placeholder="Password"
        secureTextEntry
        //value={password}
        //onChangeText={setPassword}
      />
      <TouchableOpacity
      style={{backgroundColor: colors.light["--color-roxo-100"]}}
        className="w-full bg-blue-500 p-3 rounded-full items-center"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold">ENTRAR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push('/auth/register')}
      >
        <Text className="text-blue-500">Não tem uma conta? Registre-se</Text>
      </TouchableOpacity>
    </View>
  );
}
