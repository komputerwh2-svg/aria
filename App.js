import React, { useState, useEffect, createContext, useContext } from 'react';
import { Text, View, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GajiContext = createContext();

// --- KONSTANTA ---
const DAFTAR_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const TAHUN_SAAT_INI = new Date().getFullYear();
const DAFTAR_TAHUN = Array.from({length: 11}, (_, i) => (TAHUN_SAAT_INI - 5 + i).toString());

// DATA CHANGELOG (Riwayat Coding)
const RIWAYAT_CODING = [
  { ver: "v1.2", desc: "Tambah Riwayat Coding (Changelog) di Pengaturan." },
  { ver: "v1.1", desc: "Fitur Edit Data & Perbaikan Modal Detail." },
  { ver: "v1.0", desc: "Master Code: Input Lengkap, Database Internal, & Pilih Periode." },
  { ver: "v0.5", desc: "Integrasi Tab Navigation & AsyncStorage." },
  { ver: "v0.1", desc: "Initial Design: Form Input & Format Ribuan." }
];

// --- FUNGSI FORMAT ---
const formatRibuan = (angka) => {
  if (!angka && angka !== 0) return '0';
  const bersih = angka.toString().replace(/\D/g, '');
  return bersih.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const unformatRibuan = (teks) => {
  if (!teks) return 0;
  const num = Number(teks.replace(/\./g, ''));
  return isNaN(num) ? 0 : num;
};

const InputGaji = ({ label, value, onChange }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.miniLabel}>{label}</Text>
    <TextInput 
      style={styles.input} 
      placeholder="0" 
      keyboardType="numeric" 
      value={formatRibuan(value)}
      onChangeText={(val) => onChange(unformatRibuan(val))}
    />
  </View>
);

// --- TAB 1: INPUT SLIP ---
function SlipGajiScreen() {
  const { simpanDataGaji } = useContext(GajiContext);
  const [bulan, setBulan] = useState(DAFTAR_BULAN[new Date().getMonth()]);
  const [tahun, setTahun] = useState(TAHUN_SAAT_INI.toString());
  const [modalPeriode, setModalPeriode] = useState(false);

  const [pemasukan, setPemasukan] = useState({ pokok: 0, jabatan: 0, transport: 0, makan: 0, harian: 0, premi: 0, koreksi: 0 });
  const [potongan, setPotongan] = useState({ cicilan: 0, ksp: 0, jamsostek: 0, bpjs: 0, sakit: 0, izin: 0, alpha: 0, cuti: 0, imt: 0 });

  const handleSimpan = async () => {
    const totalMasuk = Object.values(pemasukan).reduce((a, b) => a + b, 0);
    const totalPotong = Object.values(potongan).reduce((a, b) => a + b, 0);
    const dataBaru = { 
      id: Date.now().toString(), 
      periode: `${bulan} ${tahun}`, 
      total: totalMasuk - totalPotong,
      detailMasuk: pemasukan,
      detailPotong: potongan
    };
    await simpanDataGaji(dataBaru);
    Alert.alert("Sukses", `Data ${bulan} ${tahun} Tersimpan!`);
    setPemasukan({ pokok: 0, jabatan: 0, transport: 0, makan: 0, harian: 0, premi: 0, koreksi: 0 });
    setPotongan({ cicilan: 0, ksp: 0, jamsostek: 0, bpjs: 0, sakit: 0, izin: 0, alpha: 0, cuti: 0, imt: 0 });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Input Slip Gaji</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Periode</Text>
        <TouchableOpacity style={styles.pickerTrigger} onPress={() => setModalPeriode(true)}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>{bulan} {tahun}</Text>
          <Text style={{color: '#3498db', fontWeight: 'bold'}}>GANTI</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.section, { borderColor: '#27ae60' }]}>
        <Text style={[styles.sectionTitle, { color: '#27ae60' }]}>2. Pemasukan</Text>
        {Object.keys(pemasukan).map(key => (
          <InputGaji key={key} label={key.toUpperCase()} value={pemasukan[key]} onChange={(v) => setPemasukan({...pemasukan, [key]: v})} />
        ))}
      </View>
      <View style={[styles.section, { borderColor: '#e74c3c' }]}>
        <Text style={[styles.sectionTitle, { color: '#e74c3c' }]}>3. Potongan</Text>
        {Object.keys(potongan).map(key => (
          <InputGaji key={key} label={key.toUpperCase()} value={potongan[key]} onChange={(v) => setPotongan({...potongan, [key]: v})} />
        ))}
      </View>
      <TouchableOpacity style={styles.btnSimpan} onPress={handleSimpan}><Text style={styles.btnText}>SIMPAN DATA</Text></TouchableOpacity>
      
      <Modal visible={modalPeriode} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Periode</Text>
            <View style={styles.row}>
              <ScrollView style={{height: 250}}>{DAFTAR_BULAN.map(b => (
                <TouchableOpacity key={b} onPress={() => setBulan(b)} style={[styles.itemPilih, bulan === b && styles.itemAktif]}><Text style={bulan === b ? {color:'#fff'} : {}}>{b}</Text></TouchableOpacity>
              ))}</ScrollView>
              <ScrollView style={{height: 250}}>{DAFTAR_TAHUN.map(t => (
                <TouchableOpacity key={t} onPress={() => setTahun(t)} style={[styles.itemPilih, tahun === t && styles.itemAktif]}><Text style={tahun === t ? {color:'#fff'} : {}}>{t}</Text></TouchableOpacity>
              ))}</ScrollView>
            </View>
            <TouchableOpacity style={styles.btnTutup} onPress={() => setModalPeriode(false)}><Text style={{color:'#fff', fontWeight:'bold'}}>SELESAI</Text></TouchableOpacity>
        </View></View>
      </Modal>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

// --- TAB 2: RANGKUMAN ---
function RangkumanScreen() {
  const { listGaji, editDataGaji } = useContext(GajiContext);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMasuk, setEditMasuk] = useState({});
  const [editPotong, setEditPotong] = useState({});

  const startEdit = () => { setEditMasuk(selected.detailMasuk); setEditPotong(selected.detailPotong); setIsEditing(true); };

  const saveEdit = async () => {
    const totalMasuk = Object.values(editMasuk).reduce((a, b) => a + b, 0);
    const totalPotong = Object.values(editPotong).reduce((a, b) => a + b, 0);
    const updated = { ...selected, total: totalMasuk - totalPotong, detailMasuk: editMasuk, detailPotong: editPotong };
    await editDataGaji(updated);
    setSelected(updated); setIsEditing(false); Alert.alert("Berhasil", "Data diperbarui!");
  };

  const renderItem = ({ item, index }) => {
    const selisih = item.total - (listGaji[index + 1]?.total || 0);
    return (
      <TouchableOpacity style={styles.cardRangkuman} onPress={() => setSelected(item)}>
        <View><Text style={styles.txtPeriode}>{item.periode}</Text><Text style={styles.txtTotal}>Rp {formatRibuan(item.total)}</Text></View>
        <Text style={{ color: selisih >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>{selisih >= 0 ? '▲' : '▼'} {formatRibuan(Math.abs(selisih))}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={listGaji} keyExtractor={i => i.id} renderItem={renderItem} ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>Kosong.</Text>} />
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={[styles.modalContent, {maxHeight: '90%'}]}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit' : 'Rincian'} {selected?.periode}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {isEditing ? (
              <>
                <Text style={styles.detailHeader}>PENMASUKAN</Text>
                {Object.keys(editMasuk).map(k => <InputGaji key={k} label={k.toUpperCase()} value={editMasuk[k]} onChange={v => setEditMasuk({...editMasuk, [k]:v})} />)}
                <Text style={[styles.detailHeader, {color:'#e74c3c', marginTop:10}]}>POTONGAN</Text>
                {Object.keys(editPotong).map(k => <InputGaji key={k} label={k.toUpperCase()} value={editPotong[k]} onChange={v => setEditPotong({...editPotong, [k]:v})} />)}
              </>
            ) : (
              <>
                <Text style={styles.detailHeader}>PENMASUKAN</Text>
                {selected && Object.entries(selected.detailMasuk).map(([k, v]) => v > 0 && <View key={k} style={styles.detailRow}><Text style={styles.capitalize}>{k}</Text><Text>Rp {formatRibuan(v)}</Text></View>)}
                <Text style={[styles.detailHeader, {color:'#e74c3c', marginTop:15}]}>POTONGAN</Text>
                {selected && Object.entries(selected.detailPotong).map(([k, v]) => v > 0 && <View key={k} style={styles.detailRow}><Text style={styles.capitalize}>{k}</Text><Text>Rp {formatRibuan(v)}</Text></View>)}
                <View style={styles.totalDetailContainer}><Text style={styles.totalDetailText}>GAJI BERSIH</Text><Text style={styles.totalDetailValue}>Rp {formatRibuan(selected?.total)}</Text></View>
              </>
            )}
          </ScrollView>
          <View style={{flexDirection: 'row', justifyContent:'space-between', marginTop: 15}}>
            <TouchableOpacity style={[styles.btnTutup, {flex:1, marginRight:5, backgroundColor:'#95a5a6'}]} onPress={() => {setSelected(null); setIsEditing(false);}}><Text style={{color:'#fff'}}>TUTUP</Text></TouchableOpacity>
            {isEditing ? (
              <TouchableOpacity style={[styles.btnTutup, {flex:1, marginLeft:5, backgroundColor:'#27ae60'}]} onPress={saveEdit}><Text style={{color:'#fff'}}>SIMPAN</Text></TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btnTutup, {flex:1, marginLeft:5, backgroundColor:'#3498db'}]} onPress={startEdit}><Text style={{color:'#fff'}}>EDIT</Text></TouchableOpacity>
            )}
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

// --- TAB 3: PENGATURAN (CHANGELOG) ---
function PengaturanScreen() {
  const { hapusSemua } = useContext(GajiContext);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Riwayat Coding (Changelog)</Text>
        {RIWAYAT_CODING.map((item, index) => (
          <View key={index} style={{marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5}}>
            <Text style={{fontWeight: 'bold', color: '#3498db'}}>{item.ver}</Text>
            <Text style={{fontSize: 13, color: '#555'}}>{item.desc}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, {marginTop: 10}]}>
        <Text style={styles.sectionTitle}>⚙️ Manajemen Data</Text>
        <TouchableOpacity style={[styles.btnSimpan, {backgroundColor:'#e74c3c'}]} onPress={hapusSemua}>
          <Text style={styles.btnText}>HAPUS SEMUA DATA</Text>
        </TouchableOpacity>
      </View>

      <Text style={{textAlign: 'center', color: '#bdc3c7', fontSize: 10, marginTop: 20}}>Aplikasi Hitung Gaji v1.2</Text>
    </ScrollView>
  );
}

// --- APP CORE ---
const Tab = createBottomTabNavigator();

export default function App() {
  const [listGaji, setListGaji] = useState([]);
  useEffect(() => { (async () => {
    const saved = await AsyncStorage.getItem('@gaji_master_db_v3');
    if (saved) setListGaji(JSON.parse(saved));
  })() }, []);

  const simpanDataGaji = async (data) => {
    const newList = [data, ...listGaji];
    setListGaji(newList);
    await AsyncStorage.setItem('@gaji_master_db_v3', JSON.stringify(newList));
  };

  const editDataGaji = async (updatedData) => {
    const newList = listGaji.map(item => item.id === updatedData.id ? updatedData : item);
    setListGaji(newList);
    await AsyncStorage.setItem('@gaji_master_db_v3', JSON.stringify(newList));
  };

  const hapusSemua = () => { Alert.alert("Hapus", "Hapus semua data?", [{text:"Batal"}, {text:"Ya", onPress: async () => { setListGaji([]); await AsyncStorage.removeItem('@gaji_master_db_v3'); }}]) };

  return (
    <GajiContext.Provider value={{ listGaji, simpanDataGaji, editDataGaji, hapusSemua }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerStyle:{backgroundColor:'#3498db'}, headerTintColor:'#fff' }}>
          <Tab.Screen name="Input" component={SlipGajiScreen} />
          <Tab.Screen name="Rangkuman" component={RangkumanScreen} />
          <Tab.Screen name="Pengaturan" component={PengaturanScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GajiContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  inputGroup: { marginBottom: 10 },
  miniLabel: { fontSize: 11, color: '#7f8c8d' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 2, fontSize: 15 },
  btnSimpan: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  itemPilih: { padding: 10, borderRadius: 8 },
  itemAktif: { backgroundColor: '#3498db' },
  btnTutup: { padding: 12, borderRadius: 10, alignItems: 'center' },
  cardRangkuman: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  txtPeriode: { fontSize: 12, color: '#7f8c8d' },
  txtTotal: { fontSize: 16, fontWeight: 'bold' },
  detailHeader: { fontSize: 13, fontWeight: 'bold', color: '#27ae60', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5, marginBottom: 5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  capitalize: { textTransform: 'capitalize', color: '#555' },
  totalDetailContainer: { borderTopWidth: 2, borderColor: '#3498db', marginTop: 10, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  totalDetailText: { fontWeight: 'bold' },
  totalDetailValue: { fontWeight: 'bold', color: '#3498db' }
});