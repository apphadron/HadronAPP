/*import { supabase } from "@/db/supabaseClient";
import bcrypt from "bcryptjs";

export async function cadastrarUsuario(user: string, senha: string, nome: string, sobrenome: string) {
  // Verifica se o usuário já existe
  const { data: existente, error } = await supabase
    .from("usuarios")
    .select("user")
    .eq("user", user)
    .single();

  if (existente) {
    return { sucesso: false, mensagem: "Usuário já existe!" };
  }

  // Criptografa a senha
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  // Insere o novo usuário
  const { data, error: erroCadastro } = await supabase
    .from("usuarios")
    .insert([{ user, senha: senhaCriptografada, nome, sobrenome }]);

  if (erroCadastro) {
    return { sucesso: false, mensagem: "Erro ao cadastrar usuário!" };
  }

  return { sucesso: true, mensagem: "Usuário cadastrado com sucesso!" };
}


export async function loginUsuario(user: string, senha: string) {
  // Busca o usuário no banco
  const { data, error } = await supabase
    .from("usuarios")
    .select("senha")
    .eq("user", user)
    .single();

  if (!data) {
    return { sucesso: false, mensagem: "Usuário não encontrado!" };
  }

  // Compara a senha informada com a senha criptografada
  const senhaCorreta = await bcrypt.compare(senha, data.senha);

  if (!senhaCorreta) {
    return { sucesso: false, mensagem: "Senha incorreta!" };
  }

  return { sucesso: true, mensagem: "Login bem-sucedido!" };
}
*/