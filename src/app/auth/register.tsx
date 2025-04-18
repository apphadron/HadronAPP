import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { cadastrarUsuario } from "./auth";

export default function Cadastro() {
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");

  async function handleCadastro() {
    const resposta = await cadastrarUsuario(user, senha, nome, sobrenome);
    Alert.alert(resposta.mensagem);
  }

  return (
    <View>
      <Text>Cadastro</Text>
      <TextInput placeholder="Usuário" value={user} onChangeText={setUser} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput placeholder="Sobrenome" value={sobrenome} onChangeText={setSobrenome} />
      <Button title="Cadastrar" onPress={handleCadastro} />
    </View>
  );
}
