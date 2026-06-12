import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function App() {
  // --- Estados de Navegação e Auth ---
  const [estaLogado, setEstaLogado] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('fichas'); // 'fichas' ou 'registrar'

  // --- Estados do Gerenciador de Treinos (Fichas) ---
  const [nomeNovoTreino, setNomeNovoTreino] = useState('');
  const [treinos, setTreinos] = useState([
    { id: 't1', nome: 'Treino A - Push', exercicios: ['Supino Reto', 'Desenvolvimento', 'Tríceps Pulley'] },
    { id: 't2', nome: 'Treino B - Pull', exercicios: ['Levantamento Terra', 'Puxada Alta', 'Rosca Direta'] }
  ]);
  
  const [treinoSelecionadoId, setTreinoSelecionadoId] = useState('t1');
  const [novoExercicioParaTreino, setNovoExercicioParaTreino] = useState('');
  const [treinoAlvoId, setTreinoAlvoId] = useState(null); // Controla qual treino está recebendo novos exercícios

  // --- Estados do Histórico de Cargas/Séries ---
  const [exercicioAtivo, setExercicioAtivo] = useState('Supino Reto');
  const [carga, setCarga] = useState('');
  const [reps, setReps] = useState('');
  const [historico, setHistorico] = useState([
    { id: '1', exercicio: 'Supino Reto', carga: 100, reps: 8, volume: 800, data: '09/06' },
    { id: '2', exercicio: 'Supino Reto', carga: 95, reps: 10, volume: 950, data: '09/06' },
    { id: '3', exercicio: 'Levantamento Terra', carga: 180, reps: 5, volume: 900, data: '08/06' }
  ]);

  // --- Logica de Auth ---
  const lidarComLogin = () => {
    if (!email || !senha) return Alert.alert('Erro', 'Preencha todos os campos.');
    if (email.includes('@') && senha.length >= 6) setEstaLogado(true);
    else Alert.alert('Erro', 'Dados inválidos.');
  };

  // --- Lógica das Fichas de Treino ---
  const criarNovoTreino = () => {
    if (!nomeNovoTreino.trim()) return;
    const novo = {
      id: Date.now().toString(),
      nome: nomeNovoTreino.trim(),
      exercicios: []
    };
    setTreinos([...treinos, novo]);
    setNomeNovoTreino('');
  };

  const adicionarExercicioAoTreino = (idTreino) => {
    if (!novoExercicioParaTreino.trim()) return;
    setTreinos(treinos.map(t => {
      if (t.id === idTreino) {
        return { ...t, exercicios: [...t.exercicios, novoExercicioParaTreino.trim()] };
      }
      return t;
    }));
    setNovoExercicioParaTreino('');
    setTreinoAlvoId(null);
  };

  // --- Lógica de Registro de Séries ---
  const adicionarSerie = () => {
    if (!carga || !reps || !exercicioAtivo) return;

    const pesoNum = parseFloat(carga);
    const repsNum = parseInt(reps);
    const volumeCalculado = pesoNum * repsNum;

    const novaSerie = {
      id: Date.now().toString(),
      exercicio: exercicioAtivo,
      carga: pesoNum,
      reps: repsNum,
      volume: volumeCalculado,
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };

    setHistorico([novaSerie, ...historico]);
    setCarga('');
    setReps('');
  };

  // --- Cálculos de Performance Analítica ---
  const historicoFiltrado = historico.filter(s => s.exercicio.toLowerCase() === exercicioAtivo.toLowerCase());
  const volumeTotalExercicio = historicoFiltrado.reduce((acc, curr) => acc + curr.volume, 0);
  const maiorCargaExercicio = historicoFiltrado.length > 0 ? Math.max(...historicoFiltrado.map(s => s.carga)) : 0;

  const treinoAtualObj = treinos.find(t => t.id === treinoSelecionadoId);

  // --- RENDER DA TELA DE LOGIN ---
  if (!estaLogado) {
    return (
      <SafeAreaView style={styles.containerCentrado}>
        <View style={styles.loginCard}>
          <Text style={styles.logoText}>OVERLOAD</Text>
          <Text style={styles.tagline}>Treino Diario</Text>
          <TextInput style={styles.loginInput} placeholder="E-mail" placeholderTextColor="#444" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.loginInput} placeholder="Senha" placeholderTextColor="#444" secureTextEntry value={senha} onChangeText={setSenha} />
          <TouchableOpacity style={styles.botaoLogin} onPress={lidarComLogin}><Text style={styles.botaoLoginTexto}>ENTRAR</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.headerDashboard}>
        <Text style={styles.logoTextPequeno}>OVERLOAD</Text>
        <TouchableOpacity style={styles.botaoSair} onPress={() => setEstaLogado(false)}><Text style={styles.botaoSairTexto}>Sair</Text></TouchableOpacity>
      </View>

      {/* ==========================================
          VISTA 1: GERENCIAR PERFIS (FICHAS)
          ========================================== */}
      {abaAtiva === 'fichas' && (
        <ScrollView style={styles.innerContainer}>
          <Text style={styles.sectionTitulo}>Suas Rotinas de Treino</Text>
          
          {/* Criar Nova Ficha */}
          <View style={styles.cardForm}>
            <Text style={styles.inputLabel}>Criar Novo Perfil de Treino</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, textAlign: 'left', marginRight: 10 }]} 
                placeholder="Ex: Treino C - Pernas" placeholderTextColor="#555"
                value={nomeNovoTreino} onChangeText={setNomeNovoTreino}
              />
              <TouchableOpacity style={styles.botaoAdicionar} onPress={criarNovoTreino}><Text style={styles.botaoTexto}>+</Text></TouchableOpacity>
            </View>
          </View>

          {/* Listagem das Fichas Existentes */}
          {treinos.map(treino => (
            <View key={treino.id} style={styles.cardTreino}>
              <Text style={styles.tituloTreinoCard}>{treino.nome}</Text>
              
              {/* Lista de Exercícios na Ficha */}
              {treino.exercicios.length === 0 ? (
                <Text style={styles.textoVazioSub}>Nenhum exercício adicionado.</Text>
              ) : (
                treino.exercicios.map((ex, idx) => (
                  <Text key={idx} style={styles.itemExercicioLista}>• {ex}</Text>
                ))
              )}

              {/* Input para colocar novos exercícios dentro dessa ficha */}
              {treinoAlvoId === treino.id ? (
                <View style={[styles.row, { marginTop: 10 }]}>
                  <TextInput 
                    style={[styles.input, { flex: 1, height: 35, fontSize: 14, textAlign: 'left', marginRight: 10 }]} 
                    placeholder="Nome do exercício..." placeholderTextColor="#555"
                    value={novoExercicioParaTreino} onChangeText={setNovoExercicioParaTreino}
                  />
                  <TouchableOpacity style={[styles.botaoAdicionar, { height: 35, width: 45 }]} onPress={() => adicionarExercicioAoTreino(treino.id)}>
                    <Text style={[styles.botaoTexto, { fontSize: 16 }]}>OK</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.botaoLink} onPress={() => setTreinoAlvoId(treino.id)}>
                  <Text style={styles.botaoLinkTexto}>+ ADICIONAR EXERCÍCIO</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ==========================================
          VISTA 2: REGISTRAR E BATER RECORDES
          ========================================== */}
      {abaAtiva === 'registrar' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
          
          {/* Seletor de Qual Perfil vai treinar agora */}
          <Text style={styles.inputLabel}>Selecione a Rotina de Hoje</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorHorizontal}>
            {treinos.map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.chipTreino, treinoSelecionadoId === t.id && styles.chipTreinoAtivo]}
                onPress={() => {
                  setTreinoSelecionadoId(t.id);
                  if(t.exercicios.length > 0) setExercicioAtivo(t.exercicios[0]);
                }}
              >
                <Text style={[styles.chipTreinoTexto, treinoSelecionadoId === t.id && styles.chipTreinoTextoAtivo]}>{t.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Seletor do Exercício Ativo dentro da rotina */}
          {treinoAtualObj && treinoAtualObj.exercicios.length > 0 ? (
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.inputLabel}>Exercício Focado</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorHorizontal}>
                {treinoAtualObj.exercicios.map((ex, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.chipExercicio, exercicioAtivo === ex && styles.chipExercicioAtivo]}
                    onPress={() => setExercicioAtivo(ex)}
                  >
                    <Text style={styles.chipExercicioTexto}>{ex}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.textoErroAlerta}>Adicione exercícios nesta rotina na aba "Fichas" primeiro.</Text>
          )}

          {/* Painel de Métricas do Exercício Selecionado */}
          <View style={styles.dashboard}>
            <View style={styles.cardMétrica}>
              <Text style={styles.metricaLabel}>VOLUME DE HOJE ({exercicioAtivo})</Text>
              <Text style={styles.metricaValor}>{volumeTotalExercicio} kg</Text>
            </View>
            <View style={styles.cardMétrica}>
              <Text style={styles.metricaLabel}>RECORDE ATUAL (PR)</Text>
              <Text style={[styles.metricaValor, { color: '#ffcc00' }]}>{maiorCargaExercicio} kg</Text>
            </View>
          </View>

          {/* Formulário de Input de Carga e Reps */}
          <View style={styles.form}>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>Carga (kg)</Text>
              <TextInput style={styles.input} placeholder="100" placeholderTextColor="#555" keyboardType="numeric" value={carga} onChangeText={setCarga} />
            </View>
            <View style={styles.inputGroup}><Text style={styles.inputLabel}>Reps</Text>
              <TextInput style={styles.input} placeholder="8" placeholderTextColor="#555" keyboardType="numeric" value={reps} onChangeText={setReps} />
            </View>
            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarSerie}><Text style={styles.botaoTexto}>+</Text></TouchableOpacity>
          </View>

          {/* Histórico das Séries */}
          <Text style={styles.subsecaoTitulo}>Histórico Técnico de Séries</Text>
          <FlatList
            data={historicoFiltrado}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.textoListaVazia}>Nenhuma série para {exercicioAtivo} hoje. Quebre o recorde!</Text>}
            renderItem={({ item }) => (
              <View style={styles.itemSerie}>
                <View>
                  <Text style={styles.textoSerie}>{item.carga}kg x {item.reps} reps</Text>
                  <Text style={styles.textoVolumeSub}>Volume: {item.volume} kg | Data: {item.data}</Text>
                </View>
                {item.carga === maiorCargaExercicio && maiorCargaExercicio > 0 && (
                  <View style={styles.badgePR}><Text style={styles.textoBadgePR}>🔥 PR</Text></View>
                )}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </KeyboardAvoidingView>
      )}

      {/* ==========================================
          BARRA DE NAVEGAÇÃO DE ABAS (FOOTER)
          ========================================== */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabBotao, abaAtiva === 'fichas' && styles.tabBotaoAtivo]} onPress={() => setAbaAtiva('fichas')}>
          <Text style={[styles.tabBotaoTexto, abaAtiva === 'fichas' && styles.tabBotaoTextoAtivo]}>📇 Fichas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBotao, abaAtiva === 'registrar' && styles.tabBotaoAtivo]} onPress={() => setAbaAtiva('registrar')}>
          <Text style={[styles.tabBotaoTexto, abaAtiva === 'registrar' && styles.tabBotaoTextoAtivo]}>🏋️‍♂️ Treino</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0C' },
  containerCentrado: { flex: 1, backgroundColor: '#0A0A0C', justifyContent: 'center', paddingHorizontal: 25 },
  innerContainer: { flex: 1, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  loginCard: { backgroundColor: '#131316', padding: 30, borderRadius: 12, borderWidth: 1, borderColor: '#222227' },
  logoText: { fontSize: 36, fontWeight: '900', color: '#ff3e3e', letterSpacing: 3, textAlign: 'center' },
  logoTextPequeno: { fontSize: 22, fontWeight: '900', color: '#ff3e3e' },
  tagline: { fontSize: 11, color: 'rgba(235, 6, 6, 0.91)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', marginBottom: 20 },
  loginInput: { backgroundColor: '#0A0A0C', color: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#222227' },
  botaoLogin: { backgroundColor: '#ff3e3e', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  botaoLoginTexto: { color: '#fff', fontSize: 16, fontWeight: '900' },
  headerDashboard: { marginTop: 30, marginBottom: 15, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  botaoSair: { padding: 6, borderRadius: 4, backgroundColor: '#222' },
  botaoSairTexto: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  sectionTitulo: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#ff3e3e', paddingLeft: 10 },
  cardForm: { backgroundColor: '#16161a', padding: 15, borderRadius: 8, marginBottom: 20 },
  cardTreino: { backgroundColor: '#131316', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#222227' },
  tituloTreinoCard: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itemExercicioLista: { color: '#aaa', fontSize: 14, marginVertical: 3, paddingLeft: 5 },
  textoVazioSub: { color: '#555', fontSize: 12, fontStyle: 'italic' },
  botaoLink: { marginTop: 12 },
  botaoLinkTexto: { color: 'rgb(255, 245, 62)', fontSize: 12, fontWeight: 'cbd', letterSpacing: 1 },
  seletorHorizontal: { flexDirection: 'row', marginVertical: 10, paddingBottom: 5 },
  chipTreino: { backgroundColor: '#16161a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#232329' },
  chipTreinoAtivo: { borderColor: '#ff3e3e', backgroundColor: '#ff3e3e20' },
  chipTreinoTexto: { color: '#888', fontWeight: 'bold' },
  chipTreinoTextoAtivo: { color: '#ff3e3e' },
  chipExercicio: { backgroundColor: '#222', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginRight: 8 },
  chipExercicioAtivo: { backgroundColor: '#ff3e3e' },
  chipExercicioTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  textoErroAlerta: { color: '#666', fontStyle: 'italic', marginVertical: 10 },
  dashboard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardMétrica: { backgroundColor: '#16161a', flex: 0.48, padding: 12, borderRadius: 8 },
  metricaLabel: { fontSize: 9, color: '#888', fontWeight: 'bold', marginBottom: 5 },
  metricaValor: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  form: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: '#16161a', padding: 12, borderRadius: 8, marginBottom: 15 },
  inputGroup: { flex: 0.35 },
  inputLabel: { fontSize: 11, color: '#aaa', marginBottom: 5, fontWeight: '700' },
  input: { backgroundColor: '#0A0A0C', color: '#fff', padding: 10, borderRadius: 6, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  botaoAdicionar: { backgroundColor: '#ff3e3e', height: 44, width: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  subsecaoTitulo: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase' },
  itemSerie: { backgroundColor: '#121214', padding: 12, borderRadius: 6, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoSerie: { color: '#fff', fontSize: 15, fontWeight: '700' },
  textoVolumeSub: { color: '#666', fontSize: 11 },
  badgePR: { backgroundColor: 'rgba(255, 204, 0, 0.1)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#ffcc00' },
  textoBadgePR: { color: '#ffcc00', fontSize: 9, fontWeight: '900' },
  textoListaVazia: { color: '#444', textAlign: 'center', marginTop: 15, fontSize: 13, fontStyle: 'italic' },
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: '#131316', borderTopWidth: 1, borderColor: '#222227' },
  tabBotao: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBotaoAtivo: { backgroundColor: '#1c1c22' },
  tabBotaoTexto: { color: '#666', fontSize: 14, fontWeight: '700' },
  tabBotaoTextoAtivo: { color: '#ff3e3e' }
});