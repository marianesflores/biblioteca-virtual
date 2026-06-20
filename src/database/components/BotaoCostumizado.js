import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function BotaoCustomizado({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false }) {
  const estiloContainer = [
    styles.base,
    variante === 'primario' && styles.primario,
    variante === 'secundario' && styles.secundario,
    variante === 'perigo' && styles.perigo,
    variante === 'fantasma' && styles.fantasma,
    (desabilitado || carregando) && styles.desabilitado,
  ];

  const estiloTexto = [
    styles.texto,
    variante === 'secundario' && styles.textoSecundario,
    variante === 'fantasma' && styles.textoFantasma,
    variante === 'perigo' && styles.textoPerigo,
  ];

  return (
    <TouchableOpacity style={estiloContainer} onPress={onPress} disabled={desabilitado || carregando} activeOpacity={0.8}>
      {carregando
        ? <ActivityIndicator size="small" color={variante === 'primario' ? '#1a1a2e' : '#e8c99a'} />
        : <Text style={estiloTexto}>{titulo}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primario: { backgroundColor: '#e8c99a' },
  secundario: { backgroundColor: '#2d2d4e', borderWidth: 1, borderColor: '#3d3d5e' },
  perigo: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e05c5c' },
  fantasma: { backgroundColor: 'transparent' },
  desabilitado: { opacity: 0.5 },
  texto: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', letterSpacing: 0.3 },
  textoSecundario: { color: '#e8e8f0' },
  textoPerigo: { color: '#e05c5c' },
  textoFantasma: { color: '#8888aa' },
});