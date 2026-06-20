import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EstatisticaCard({ icone, valor, label, cor }) {
  return (
    <View style={[styles.card, { borderTopColor: cor }]}>
      <Ionicons name={icone} size={20} color={cor} />
      <Text style={[styles.valor, { color: cor }]}>{valor}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#16213e', borderRadius: 10, padding: 14, alignItems: 'center', flex: 1, borderTopWidth: 3, gap: 4 },
  valor: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  label: { fontSize: 11, color: '#8888aa', textAlign: 'center' },
});