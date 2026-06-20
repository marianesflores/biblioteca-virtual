import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('bookshelf.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      genero TEXT,
      status TEXT DEFAULT 'quero_ler',
      nota INTEGER DEFAULT 0,
      resenha TEXT,
      latitude REAL,
      longitude REAL,
      cidade TEXT,
      data_adicao TEXT,
      data_conclusao TEXT
    );
  `);
}

export function getLivros() {
  return db.getAllSync('SELECT * FROM livros ORDER BY data_adicao DESC;');
}

export function getLivrosPorStatus(status) {
  return db.getAllSync('SELECT * FROM livros WHERE status = ? ORDER BY data_adicao DESC;', [status]);
}

export function inserirLivro(livro) {
  const { titulo, autor, genero, status, latitude, longitude, cidade } = livro;
  const data_adicao = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO livros (titulo, autor, genero, status, latitude, longitude, cidade, data_adicao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [titulo, autor, genero || '', status || 'quero_ler', latitude || null, longitude || null, cidade || null, data_adicao]
  );
  return result.lastInsertRowId;
}

export function avaliarLivro(id, nota, resenha) {
  const data_conclusao = new Date().toISOString();
  db.runSync(
    `UPDATE livros SET nota = ?, resenha = ?, status = 'lido', data_conclusao = ? WHERE id = ?;`,
    [nota, resenha || '', data_conclusao, id]
  );
}

export function atualizarStatus(id, status) {
  db.runSync('UPDATE livros SET status = ? WHERE id = ?;', [status, id]);
}

export function deletarLivro(id) {
  db.runSync('DELETE FROM livros WHERE id = ?;', [id]);
}

export function getEstatisticas() {
  const total = db.getFirstSync('SELECT COUNT(*) as total FROM livros;');
  const lidos = db.getFirstSync('SELECT COUNT(*) as total FROM livros WHERE status = "lido";');
  const lendo = db.getFirstSync('SELECT COUNT(*) as total FROM livros WHERE status = "lendo";');
  const quero = db.getFirstSync('SELECT COUNT(*) as total FROM livros WHERE status = "quero_ler";');
  const mediaNota = db.getFirstSync('SELECT AVG(nota) as media FROM livros WHERE status = "lido" AND nota > 0;');

  return {
    total: total?.total || 0,
    lidos: lidos?.total || 0,
    lendo: lendo?.total || 0,
    quero_ler: quero?.total || 0,
    mediaNota: mediaNota?.media ? mediaNota.media.toFixed(1) : '—',
  };
}