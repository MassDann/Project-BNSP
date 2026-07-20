import { pgTable, text, timestamp, uuid, numeric, integer, date, time, uniqueIndex } from 'drizzle-orm/pg-core';

export const pelanggan = pgTable('pelanggan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  noTelepon: text('no_telepon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const admin = pgTable('admin', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'), // 'admin' atau 'superadmin'
});

export const lapangan = pgTable('lapangan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  jenis: text('jenis').notNull(), // 'futsal' atau 'badminton'
  hargaPerJam: numeric('harga_per_jam').notNull(),
  fotoUrl: text('foto_url'),
  deskripsi: text('deskripsi'),
  status: text('status').notNull().default('aktif'), // 'aktif' atau 'nonaktif'
});

export const reservasi = pgTable('reservasi', {
  id: uuid('id').primaryKey().defaultRandom(),
  pelangganId: uuid('pelanggan_id').references(() => pelanggan.id), // Boleh null untuk offline
  namaOffline: text('nama_offline'),
  noHpOffline: text('no_hp_offline'),
  lapanganId: uuid('lapangan_id').references(() => lapangan.id).notNull(),
  tanggal: date('tanggal').notNull(),
  jamMulai: time('jam_mulai').notNull(),
  jamSelesai: time('jam_selesai').notNull(),
  status: text('status').notNull().default('pending_bayar'), 
  // 'pending_bayar', 'menunggu_verifikasi', 'terkonfirmasi', 'dibatalkan', 'kedaluwarsa'
  totalHarga: numeric('total_harga').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transaksi = pgTable('transaksi', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservasiId: uuid('reservasi_id').references(() => reservasi.id).notNull(),
  kodeUnik: integer('kode_unik').notNull(),
  jumlahBayar: numeric('jumlah_bayar').notNull(),
  metodePembayaran: text('metode_pembayaran').notNull(), // 'transfer_bank' atau 'qris_statis'
  buktiTransferUrl: text('bukti_transfer_url'),
  statusVerifikasi: text('status_verifikasi').notNull().default('menunggu'), // 'menunggu', 'disetujui', 'ditolak'
  diverifikasiOleh: uuid('diverifikasi_oleh').references(() => admin.id),
  diverifikasiPada: timestamp('diverifikasi_pada', { withTimezone: true }),
  batasWaktuBayar: timestamp('batas_waktu_bayar', { withTimezone: true }).notNull(),
});

export const slotLock = pgTable('slot_lock', {
  id: uuid('id').primaryKey().defaultRandom(),
  lapanganId: uuid('lapangan_id').references(() => lapangan.id).notNull(),
  tanggal: date('tanggal').notNull(),
  jamMulai: time('jam_mulai').notNull(),
  jamSelesai: time('jam_selesai').notNull(),
  pelangganId: uuid('pelanggan_id').references(() => pelanggan.id).notNull(),
  dibuatPada: timestamp('dibuat_pada', { withTimezone: true }).defaultNow().notNull(),
  kedaluwarsaPada: timestamp('kedaluwarsa_pada', { withTimezone: true }).notNull(),
}, (t) => ({
  unq: uniqueIndex('slot_lock_unq').on(t.lapanganId, t.tanggal, t.jamMulai)
}));
