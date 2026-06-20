import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from '../components/Header';
import BotaoCustomizado from '../components/BotaoCustomizado';
import { avaliarLivro, atualizarStatus, deletarLivro } from '../database/database';

const STATUS_CONFIG = {
  quero_ler: { cor: '#6c63ff', label: 'Quero Ler', icone: 'bookmark' },
  lendo: { cor: '#f4a261', label: 'Lendo', icone: 'book' },
  lido: { cor: '#2ec4b6', label: 'Lido', icone: 'checkmark-circle' },
};

function SeletorEstrelas({ valor, onChange }) {
  return (
    <View style={styles.estrelasContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <Ionicons name={i <= valor ? 'star' : 'star-outline'} size={36} color="#e8c99a" style={{ marginHorizontal: 4 }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DetalhesScreen({ route, navigation }) {
  const { livro } = route.params;
  const [nota, setNota] = useState(livro.nota || 0);
  const [resenha, setResenha] = useState(livro.resenha || '');
  const [salvando, setSalvando] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(livro.status !== 'lido');
  const config = STATUS_CONFIG[livro.status] || STATUS_CONFIG.quero_ler;

  function formatarData(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('pt-BR');
  }

  function mudarStatus(novoStatus) {
    Alert.alert('Alterar Status', `Marcar como "${STATUS_CONFIG[novoStatus]?.label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => { atualizarStatus(livro.id, novoStatus); navigation.goBack(); } },
    ]);
  }

  function salvarAvaliacao() {
    if (nota === 0) { Alert.alert('Avaliação Incompleta', 'Selecione pelo menos 1 estrela.'); return; }
    setSalvando(true);
    try {
      avaliarLivro(livro.id, nota, resenha);
      setAvaliacaoEditando(false);
      Alert.alert('✅ Salvo!', 'Avaliação registrada com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação.');
    } finally {
      setSalvando(false);
    }
  }

  function confirmarDelecao() {
    Alert.alert('Remover Livro', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { deletarLivro(livro.id); navigation.goBack(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <Header titulo="Detalhes" onVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.cardPrincipal, { borderTopColor: config.cor }]}>
          <View style={[styles.statusBadge, { backgroundColor: config.cor + '22' }]}>
            <Ionicons name={config.icone} size={14} color={config.cor} />
            <Text style={[styles.statusTexto, { color: config.cor }]}>{config.label}</Text>
          </View>
          <Text style={styles.titulo}>{livro.titulo}</Text>
          <Text style={styles.autor}>{livro.autor}</Text>
          {livro.genero ? <Text style={styles.genero}>{livro.genero}</Text> : null}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#555577" />
            <Text style={styles.infoLabel}>Adicionado</Text>
            <Text style={styles.infoValor}>{formatarData(livro.data_adicao)}</Text>
          </View>
          {livro.data_conclusao && (
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#2ec4b6" />
              <Text style={styles.infoLabel}>Concluído</Text>
              <Text style={styles.infoValor}>{formatarData(livro.data_conclusao)}</Text>
            </View>
          )}
          {livro.cidade && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color="#6c63ff" />
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValor}>{livro.cidade}</Text>
            </View>
          )}
        </View>

        {livro.status !== 'lido' && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>ALTERAR STATUS</Text>
            <View style={styles.statusBotoes}>
              {livro.status === 'quero_ler' && (
                <TouchableOpacity style={[styles.btnStatus, { borderColor: '#f4a261' }]} onPress={() => mudarStatus('lendo')}>
                  <Ionicons name="book-outline" size={16} color="#f4a261" />
                  <Text style={[styles.btnStatusTexto, { color: '#f4a261' }]}>Começar a Ler</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.btnStatus, { borderColor: '#2ec4b6' }]} onPress={() => mudarStatus('lido')}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#2ec4b6" />
                <Text style={[styles.btnStatusTexto, { color: '#2ec4b6' }]}>Marcar como Lido</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {(livro.status === 'lido' || nota > 0) && (
          <View style={styles.secao}>
            <View style={styles.secaoTopo}>
              <Text style={styles.secaoTitulo}>AVALIAÇÃO</Text>
              {!avaliacaoEditando && <TouchableOpacity onPress={() => setAvaliacaoEditando(true)}><Ionicons name="pencil-outline" size={18} color="#e8c99a" /></TouchableOpacity>}
            </View>
            {avaliacaoEditando ? (
              <>
                <Text style={styles.avlSub}>Toque nas estrelas para avaliar</Text>
                <SeletorEstrelas valor={nota} onChange={setNota} />
                <Text style={styles.label}>Resenha (opcional)</Text>
                <TextInput style={styles.resenhaInput} placeholder="Escreva seus pensamentos sobre o livro..." placeholderTextColor="#444466" value={resenha} onChangeText={setResenha} multiline numberOfLines={5} textAlignVertical="top" />
                <BotaoCustomizado titulo="Salvar Avaliação" onPress={salvarAvaliacao} carregando={salvando} />
              </>
            ) : (
              <>
                <View style={styles.notaExibicao}>
                  {[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= nota ? 'star' : 'star-outline'} size={28} color="#e8c99a" style={{ marginHorizontal: 2 }} />)}
                  <Text style={styles.notaNumero}>{nota}/5</Text>
                </View>
                {resenha ? <Text style={styles.resenhaTexto}>{resenha}</Text> : null}
              </>
            )}
          </View>
        )}

        <View style={styles.secao}>
          <BotaoCustomizado titulo="Remover da Estante" onPress={confirmarDelecao} variante="perigo" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#0f0f1a'
},

scroll: {
padding: 20,
paddingBottom: 40
},

cardPrincipal: {
backgroundColor: '#16213e',
borderRadius: 14, padding: 20,
borderTopWidth: 4,
marginBottom: 16 
},

statusBadge: {
flexDirection: 'row',
alignItems: 'center',
alignSelf: 'flex-start',
borderRadius: 20, 
paddingHorizontal: 10,
paddingVertical: 4,
gap: 5,
marginBottom: 12 
},

statusTexto: {
fontSize: 12,
fontWeight: '700' 
},

titulo: {
fontSize: 22,
fontWeight: '800',
 color: '#e8e8f0',
  lineHeight: 30,
   marginBottom: 6
 },

autor: {
fontSize: 15, 
color: '#8888aa',
marginBottom: 4 
},

genero: {
fontSize: 13,
color: '#555577',
fontStyle: 'italic', 
marginTop: 4 
},

infoGrid: {
flexDirection: 'row',
gap: 8,
marginBottom: 16
},

infoItem: { 
flex: 1,
backgroundColor: '#16213e',
borderRadius: 10,
padding: 12,
alignItems: 'center',
 gap: 4
},

infoLabel: {
fontSize: 10,
color: '#555577', 
textTransform: 'uppercase', 
letterSpacing: 0.5
},

infoValor: {
fontSize: 12, 
color: '#e8e8f0',
fontWeight: '600',
textAlign: 'center' 
},

secao: {
backgroundColor: '#16213e',
borderRadius: 14,
padding: 18,
marginBottom: 12
},

secaoTopo: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center', 
marginBottom: 14 
},

secaoTitulo: {
fontSize: 11,
fontWeight: '700',
color: '#555577',
letterSpacing: 1,
textTransform: 'uppercase',
marginBottom: 12
},

statusBotoes: {
flexDirection: 'row',
gap: 10
},

btnStatus: { 
flex: 1,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
padding: 12,
borderRadius: 10,
borderWidth: 1, 
gap: 6 
},

btnStatusTexto: { 
fontSize: 13,
fontWeight: '600' 
},

avlSub: {
fontSize: 13, 
color: '#555577',
marginBottom: 14,
marginTop: -6
},

estrelasContainer: { 
flexDirection: 'row',
justifyContent: 'center',
marginBottom: 20 
},

label: { 
fontSize: 12,
fontWeight: '700', 
color: '#8888aa',
textTransform: 'uppercase',
letterSpacing: 0.8,
marginBottom: 8,
marginTop: 4 
},

resenhaInput: {
backgroundColor: '#0f0f1a',
borderRadius: 10,
padding: 12,
color: '#e8e8f0',
fontSize: 14,
borderWidth: 1,
borderColor: '#2d2d4e',
marginBottom: 16,
minHeight: 100 
},

notaExibicao: {
flexDirection: 'row',
alignItems: 'center', 
marginBottom: 14 
},

notaNumero: {
fontSize: 18,
color: '#e8c99a',
fontWeight: '700',
marginLeft: 10
},

resenhaTexto: { 
fontSize: 14,
color: '#8888aa', 
lineHeight: 22,
fontStyle: 'italic' 
},
});