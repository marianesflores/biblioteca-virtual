import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Header from '../components/Header';
import BotaoCustomizado from '../components/BotaoCustomizado';
import { inserirLivro } from '../database/database';

const GENEROS = ['Ficção', 'Romance', 'Terror', 'Fantasia', 'Biografia', 'Autoajuda', 'Técnico', 'HQ', 'Outro'];
const STATUS_OPCOES = [
  { key: 'quero_ler', label: 'Quero Ler', icone: 'bookmark-outline', cor: '#6c63ff' },
  { key: 'lendo', label: 'Lendo', icone: 'book-outline', cor: '#f4a261' },
  { key: 'lido', label: 'Lido', icone: 'checkmark-circle-outline', cor: '#2ec4b6' },
];

export default function AdicionarLivroScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [generoSelecionado, setGeneroSelecionado] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('quero_ler');
  const [salvando, setSalvando] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);
  const [cidade, setCidade] = useState('');
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [permissaoNegada, setPermissaoNegada] = useState(false);

  useEffect(() => {
    solicitarPermissaoLocalizacao();
  }, []);

  async function solicitarPermissaoLocalizacao() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') setPermissaoNegada(true);
    } catch (error) {
      console.log('Erro ao solicitar permissão:', error);
    }
  }

  async function capturarLocalizacao() {
    if (permissaoNegada) { Alert.alert('Permissão Negada', 'Habilite a localização nas configurações.'); return; }
    setBuscandoLocal(true);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      setLocalizacao({ latitude, longitude });
      const [lugar] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setCidade(lugar.city || lugar.district || lugar.region || 'Local desconhecido');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setBuscandoLocal(false);
    }
  }

  function validarESalvar() {
    if (!titulo.trim()) { Alert.alert('Campo Obrigatório', 'Informe o título do livro.'); return; }
    if (!autor.trim()) { Alert.alert('Campo Obrigatório', 'Informe o nome do autor.'); return; }
    setSalvando(true);
    try {
      inserirLivro({ titulo: titulo.trim(), autor: autor.trim(), genero: generoSelecionado, status: statusSelecionado, latitude: localizacao?.latitude || null, longitude: localizacao?.longitude || null, cidade: cidade || null });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o livro.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header titulo="Novo Livro" onVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Título *</Text>
        <TextInput style={styles.input} placeholder="Ex: O Senhor dos Anéis" placeholderTextColor="#444466" value={titulo} onChangeText={setTitulo} />

        <Text style={styles.label}>Autor *</Text>
        <TextInput style={styles.input} placeholder="Ex: J.R.R. Tolkien" placeholderTextColor="#444466" value={autor} onChangeText={setAutor} />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPCOES.map((s) => (
            <TouchableOpacity key={s.key} style={[styles.statusBotao, statusSelecionado === s.key && { backgroundColor: s.cor + '33', borderColor: s.cor }]} onPress={() => setStatusSelecionado(s.key)} activeOpacity={0.8}>
              <Ionicons name={s.icone} size={18} color={statusSelecionado === s.key ? s.cor : '#555577'} />
              <Text style={[styles.statusTexto, statusSelecionado === s.key && { color: s.cor }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Gênero</Text>
        <View style={styles.generosGrid}>
          {GENEROS.map((g) => (
            <TouchableOpacity key={g} style={[styles.generoBotao, generoSelecionado === g && styles.generoAtivo]} onPress={() => setGeneroSelecionado(generoSelecionado === g ? '' : g)}>
              <Text style={[styles.generoTexto, generoSelecionado === g && styles.generoTextoAtivo]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Localização de Leitura</Text>
        <Text style={styles.sublabel}>Registre onde você está ao adicionar este livro</Text>
        {localizacao ? (
          <View style={styles.localCard}>
            <Ionicons name="location" size={20} color="#2ec4b6" />
            <View style={styles.localInfo}>
              <Text style={styles.localCidade}>{cidade}</Text>
              <Text style={styles.localCoords}>{localizacao.latitude.toFixed(4)}, {localizacao.longitude.toFixed(4)}</Text>
            </View>
            <TouchableOpacity onPress={() => { setLocalizacao(null); setCidade(''); }}>
              <Ionicons name="close-circle" size={20} color="#555577" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.localBotao} onPress={capturarLocalizacao} disabled={buscandoLocal} activeOpacity={0.8}>
            {buscandoLocal ? <ActivityIndicator size="small" color="#e8c99a" /> : <Ionicons name="locate-outline" size={20} color="#e8c99a" />}
            <Text style={styles.localBotaoTexto}>{buscandoLocal ? 'Localizando...' : 'Capturar localização atual'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.botoesAcao}>
          <BotaoCustomizado titulo="Cancelar" onPress={() => navigation.goBack()} variante="secundario" />
          <BotaoCustomizado titulo="Salvar Livro" onPress={validarESalvar} carregando={salvando} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  form: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: '#8888aa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  sublabel: { fontSize: 12, color: '#444466', marginBottom: 10, marginTop: -14 },
  input: { backgroundColor: '#16213e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: '#e8e8f0', fontSize: 15, borderWidth: 1, borderColor: '#2d2d4e' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBotao: { flex: 1, flexDirection: 'column', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#16213e', borderWidth: 1, borderColor: '#2d2d4e', gap: 4 },
  statusTexto: { fontSize: 12, color: '#555577', fontWeight: '600', textAlign: 'center' },
  generosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  generoBotao: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#16213e', borderWidth: 1, borderColor: '#2d2d4e' },
  generoAtivo: { backgroundColor: '#6c63ff33', borderColor: '#6c63ff' },
  generoTexto: { fontSize: 13, color: '#555577' },
  generoTextoAtivo: { color: '#6c63ff', fontWeight: '600' },
  localCard: { backgroundColor: '#16213e', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2ec4b633', gap: 10 },
  localInfo: { flex: 1 },
  localCidade: { color: '#e8e8f0', fontWeight: '600', fontSize: 14 },
  localCoords: { color: '#555577', fontSize: 11, marginTop: 2 },
  localBotao: { backgroundColor: '#16213e', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2d2d4e', gap: 10, borderStyle: 'dashed' },
  localBotaoTexto: { color: '#e8c99a', fontSize: 14, fontWeight: '600' },
  botoesAcao: { flexDirection: 'row', gap: 10, marginTop: 32 },
});