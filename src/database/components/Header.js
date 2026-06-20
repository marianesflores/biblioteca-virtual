import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ titulo, subtitulo, onVoltar, acaoIcone, nomeIcone }) {
  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        {onVoltar && (
          <TouchableOpacity onPress={onVoltar} style={styles.btnVoltar}>
            <Ionicons name="arrow-back" size={24} color="#e8c99a" />
          </TouchableOpacity>
        )}
        <View style={styles.textos}>
          <Text style={styles.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {acaoIcone && nomeIcone && (
          <TouchableOpacity onPress={acaoIcone} style={styles.btnAcao}>
            <Ionicons name={nomeIcone} size={26} color="#e8c99a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4e',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnVoltar: {
    marginRight: 12,
    padding: 4,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e8c99a',
    letterSpacing: 0.3,
  },
  subtitulo: {
    fontSize: 13,
    color: '#8888aa',
    marginTop: 2,
  },
  btnAcao: {
    padding: 4,
  },
});
