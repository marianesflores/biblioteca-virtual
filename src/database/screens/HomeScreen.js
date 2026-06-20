import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import BookCard from '../components/BookCard';
import EstatisticaCard from '../components/EstatisticaCard';
import { getLivros, getLivrosPorStatus, deletarLivro, getEstatisticas, initDatabase } from '../database/database';

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'quero_ler', label: 'Quero Ler' },
  { key: 'lendo', label: 'Lendo' },
  { key: 'lido', label: 'Lidos' },
];

export default function HomeScreen({ navigation }) {
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [estatisticas, setEstatisticas] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initDatabase();
    carregarDados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [filtro])
  );

  function carregarDados() {
    const dados = filtro === 'todos' ? getLivros() : getLivrosPorStatus(filtro);
    setLivros(dados);
    setEstatisticas(getEstatisticas());
  }

  function onRefresh() {
    setRefreshing(true);
    carregarDados();
    setRefreshing(false);
  }

  function confirmarDelecao(id, titulo) {
    Alert.alert('Remover Livro', `Deseja remover "${titulo}" da sua estante?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { deletarLivro(id); carregarDados(); } },
    ]);
  }

  const livrosFiltrados = livros.filter(
    (l) => l.titulo.toLowerCase().includes(busca.toLowerCase()) || l.autor.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header titulo="📚 BookShelf" subtitulo="Sua estante pessoal" acaoIcone={() => navigation.navigate('AdicionarLivro')} nomeIcone="add-circle" />
      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BookCard livro={item} onPress={() => navigation.navigate('Detalhes', { livro: item })} onDeletar={() => confirmarDelecao(item.id, item.titulo)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e8c99a" />}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <EstatisticaCard icone="library-outline" valor={estatisticas.total || 0} label="Total" cor="#6c63ff" />
              <EstatisticaCard icone="book-outline" valor={estatisticas.lendo || 0} label="Lendo" cor="#f4a261" />
              <EstatisticaCard icone="checkmark-circle-outline" valor={estatisticas.lidos || 0} label="Lidos" cor="#2ec4b6" />
              <EstatisticaCard icone="star-outline" valor={estatisticas.mediaNota || '—'} label="Nota Média" cor="#e8c99a" />
            </View>
            <View style={styles.buscaContainer}>
              <Ionicons name="search-outline" size={18} color="#555577" style={{ marginRight: 8 }} />
              <TextInput style={styles.buscaInput} placeholder="Buscar por título ou autor..." placeholderTextColor="#555577" value={busca} onChangeText={setBusca} />
              {busca ? <TouchableOpacity onPress={() => setBusca('')}><Ionicons name="close-circle" size={18} color="#555577" /></TouchableOpacity> : null}
            </View>
            <View style={styles.filtrosRow}>
              {FILTROS.map((f) => (
                <TouchableOpacity key={f.key} style={[styles.filtroBotao, filtro === f.key && styles.filtroAtivo]}
                  onPress={() => { setFiltro(f.key); const dados = f.key === 'todos' ? getLivros() : getLivrosPorStatus(f.key); setLivros(dados); }}>
                  <Text style={[styles.filtroTexto, filtro === f.key && styles.filtroTextoAtivo]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {livrosFiltrados.length === 0 && (
              <View style={styles.vazio}>
                <Ionicons name="bookmarks-outline" size={60} color="#2d2d4e" />
                <Text style={styles.vazioTitulo}>Nenhum livro aqui</Text>
                <Text style={styles.vazioSub}>Toque em + para adicionar seu primeiro livro</Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AdicionarLivro')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#1a1a2e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  lista: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  buscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2d2d4e' },
  buscaInput: { flex: 1, color: '#e8e8f0', fontSize: 14, paddingVertical: 12 },
  filtrosRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filtroBotao: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#16213e', borderWidth: 1, borderColor: '#2d2d4e' },
  filtroAtivo: { backgroundColor: '#e8c99a', borderColor: '#e8c99a' },
  filtroTexto: { fontSize: 13, color: '#8888aa', fontWeight: '600' },
  filtroTextoAtivo: { color: '#1a1a2e' },
  vazio: { alignItems: 'center', paddingTop: 60, gap: 10 },
  vazioTitulo: { fontSize: 18, color: '#3d3d5e', fontWeight: '700' },
  vazioSub: { fontSize: 13, color: '#2d2d4e', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8c99a', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#e8c99a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});