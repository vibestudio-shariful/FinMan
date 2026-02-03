
import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  TextInput, 
  Modal, 
  Dimensions,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  HandCoins, 
  UserCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  History,
  Trash2,
  X,
  Camera,
  CalendarDays,
  User,
  Languages,
  Moon,
  Sun,
  UserPlus,
  ArrowRight,
  Pencil,
  Smartphone,
  Chrome,
  Key,
  CloudUpload,
  CloudDownload,
  AlertTriangle
} from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Transaction, Saving, Debt, UserProfile, AppData, TransactionType, Settings } from './types';

const STORAGE_KEY = 'my_finance_data_v1';
const { width } = Dimensions.get('window');

const INITIAL_DATA: AppData = {
  transactions: [],
  savings: [],
  debts: [],
  parties: [],
  profile: { name: 'User00001', email: 'mail@example.com', avatar: '' },
  settings: { language: 'bn', theme: 'light' }
};

const translations = {
  bn: {
    home: "হোম",
    transactions: "লেনদেন",
    savings: "সঞ্চয়",
    profile: "প্রোফাইল",
    totalSavings: "মোট সঞ্চয়",
    income: "আয়",
    expense: "ব্যয়",
    iWillGet: "আমি পাব",
    theyWillGet: "পাবে",
    history: "ইতিহাস",
    addTransaction: "নতুন লেনদেন",
    amount: "টাকার পরিমাণ",
    category: "ক্যাটাগরি",
    confirm: "নিশ্চিত করুন",
    save: "সেভ করুন",
    cancel: "বাতিল",
    parties: "দেনাপাওনা",
    taka: "৳",
    handCash: "হাতে আছে",
    lastSync: "সর্বশেষ ব্যাকআপ: ",
    syncNow: "ব্যাকআপ",
    fetchNow: "রিস্টোর",
    cloudBackup: "ক্লাউড ব্যাকআপ",
    googleDrive: "গুগল ড্রাইভ"
  },
  en: {
    home: "Home",
    transactions: "Transactions",
    savings: "Savings",
    profile: "Profile",
    totalSavings: "Total Savings",
    income: "Income",
    expense: "Expense",
    iWillGet: "I'll Get",
    theyWillGet: "Payable",
    history: "History",
    addTransaction: "Add New",
    amount: "Amount",
    category: "Category",
    confirm: "Confirm",
    save: "Save",
    cancel: "Cancel",
    parties: "Debts",
    taka: "$",
    handCash: "In Hand",
    lastSync: "Last Sync: ",
    syncNow: "Backup",
    fetchNow: "Restore",
    cloudBackup: "Cloud Backup",
    googleDrive: "Google Drive"
  }
};

export default function App() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('transaction');
  const [isSyncing, setIsSyncing] = useState(false);

  const t = translations[data.settings.language];
  const isDark = data.settings.theme === 'dark';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  };

  const saveData = async (newData: AppData) => {
    setData(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  // Calculations
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(tr => {
      const d = parseISO(tr.date);
      return isWithinInterval(d, { start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    });
  }, [data.transactions, currentMonth]);

  const income = filteredTransactions.filter(tr => tr.type === 'INCOME').reduce((a, c) => a + c.amount, 0);
  const expense = filteredTransactions.filter(tr => tr.type === 'EXPENSE').reduce((a, c) => a + c.amount, 0);
  const handCash = data.transactions.reduce((a, tr) => tr.type === 'INCOME' ? a + tr.amount : a - tr.amount, 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' },
    header: { padding: 20, paddingTop: Platform.OS === 'ios' ? 0 : 20 },
    card: { 
      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
      borderRadius: 24, 
      padding: 20, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 12, 
      elevation: 5 
    },
    textMain: { color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '800' },
    textSub: { color: '#64748b', fontSize: 12 },
    tabBar: { 
      flexDirection: 'row', 
      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
      paddingBottom: 25, 
      paddingTop: 10, 
      borderTopWidth: 1, 
      borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
      justifyContent: 'space-around'
    },
    tabItem: { alignItems: 'center' },
    fab: { 
      backgroundColor: '#4f46e5', 
      width: 56, 
      height: 56, 
      borderRadius: 28, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginTop: -30,
      shadowColor: '#4f46e5',
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8
    },
    grid: { flexDirection: 'row', gap: 12, marginTop: 16 },
    gridItem: { flex: 1, padding: 16, borderRadius: 20 },
    modalContent: { 
      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
      borderTopLeftRadius: 32, 
      borderTopRightRadius: 32, 
      padding: 24, 
      maxHeight: '80%' 
    },
    input: { 
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9', 
      borderRadius: 16, 
      padding: 16, 
      marginBottom: 16, 
      color: isDark ? '#fff' : '#000',
      fontWeight: 'bold'
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'dashboard' && (
          <View style={styles.header}>
            <View style={[styles.card, { marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
                  <User color="#64748b" />
                </View>
                <View>
                  <Text style={[styles.textMain, { fontSize: 18 }]}>{data.profile.name}</Text>
                  <Text style={styles.textSub}>{data.profile.email}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.textSub}>{t.income}</Text>
                  <Text style={[styles.textMain, { fontSize: 22, color: '#10b981' }]}>{t.taka}{income.toLocaleString()}</Text>
                </View>
                <View>
                  <Text style={styles.textSub}>{t.handCash}</Text>
                  <Text style={[styles.textMain, { fontSize: 22 }]}>{t.taka}{handCash.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.grid}>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#ecfdf5' }]}>
                <ArrowDownLeft color="#10b981" />
                <Text style={{ color: '#047857', fontWeight: 'bold', marginTop: 8 }}>{t.income}</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#065f46' }}>{t.taka}{income}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: '#fef2f2' }]}>
                <ArrowUpRight color="#ef4444" />
                <Text style={{ color: '#b91c1c', fontWeight: 'bold', marginTop: 8 }}>{t.expense}</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#991b1b' }}>{t.taka}{expense}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 24 }}>
              <Text style={[styles.textMain, { fontSize: 16, marginBottom: 12 }]}>{t.history}</Text>
              {filteredTransactions.map(tr => (
                <View key={tr.id} style={[styles.card, { marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ padding: 8, borderRadius: 12, backgroundColor: tr.type === 'INCOME' ? '#dcfce7' : '#fee2e2' }}>
                      {tr.type === 'INCOME' ? <ArrowDownLeft size={16} color="#10b981" /> : <ArrowUpRight size={16} color="#ef4444" />}
                    </View>
                    <View>
                      <Text style={[styles.textMain, { fontSize: 14 }]}>{tr.category}</Text>
                      <Text style={styles.textSub}>{format(parseISO(tr.date), 'dd MMM')}</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: tr.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                    {tr.type === 'INCOME' ? '+' : '-'}{t.taka}{tr.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.header}>
            <View style={{ alignItems: 'center', marginVertical: 30 }}>
              <View style={{ width: 100, height: 100, borderRadius: 30, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
                <User size={50} color="#94a3b8" />
              </View>
              <Text style={[styles.textMain, { fontSize: 24, marginTop: 15 }]}>{data.profile.name}</Text>
              <Text style={styles.textSub}>{data.profile.email}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 }]}
              onPress={() => {
                setModalType('backup');
                setIsModalOpen(true);
              }}
            >
              <Smartphone color="#4f46e5" />
              <View>
                <Text style={styles.textMain}>{t.cloudBackup}</Text>
                <Text style={styles.textSub}>{t.googleDrive}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 }]}
              onPress={() => {
                const newLang = data.settings.language === 'bn' ? 'en' : 'bn';
                saveData({ ...data, settings: { ...data.settings, language: newLang } });
              }}
            >
              <Languages color="#4f46e5" />
              <View>
                <Text style={styles.textMain}>{t.settings}</Text>
                <Text style={styles.textSub}>{data.settings.language === 'bn' ? 'বাংলা' : 'English'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 15 }]}
              onPress={() => {
                const newTheme = isDark ? 'light' : 'dark';
                saveData({ ...data, settings: { ...data.settings, theme: newTheme } });
              }}
            >
              {isDark ? <Sun color="#4f46e5" /> : <Moon color="#4f46e5" />}
              <View>
                <Text style={styles.textMain}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
                <Text style={styles.textSub}>Switch App Theme</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('dashboard')}>
          <LayoutDashboard color={activeTab === 'dashboard' ? '#4f46e5' : '#94a3b8'} />
          <Text style={{ fontSize: 10, color: activeTab === 'dashboard' ? '#4f46e5' : '#94a3b8', marginTop: 4 }}>{t.home}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.fab} onPress={() => { setModalType('transaction'); setIsModalOpen(true); }}>
          <Plus color="#fff" size={30} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
          <UserCircle color={activeTab === 'profile' ? '#4f46e5' : '#94a3b8'} />
          <Text style={{ fontSize: 10, color: activeTab === 'profile' ? '#4f46e5' : '#94a3b8', marginTop: 4 }}>{t.profile}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsModalOpen(false)} />
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={[styles.textMain, { fontSize: 20 }]}>
                {modalType === 'transaction' ? t.addTransaction : t.cloudBackup}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}><X color="#64748b" /></TouchableOpacity>
            </View>

            {modalType === 'transaction' && (
              <View>
                <TextInput placeholder={t.amount} style={styles.input} keyboardType="numeric" placeholderTextColor="#94a3b8" />
                <TextInput placeholder={t.category} style={styles.input} placeholderTextColor="#94a3b8" />
                <TouchableOpacity style={{ backgroundColor: '#4f46e5', padding: 18, borderRadius: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t.confirm}</Text>
                </TouchableOpacity>
              </View>
            )}

            {modalType === 'backup' && (
              <View style={{ paddingBottom: 20 }}>
                <View style={{ backgroundColor: '#ecfdf5', padding: 20, borderRadius: 24, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#10b981' }}>
                  <Text style={{ color: '#065f46', fontWeight: 'bold', fontSize: 16 }}>{t.googleDrive}</Text>
                  <Text style={{ color: '#047857', fontSize: 11, marginTop: 4 }}>আপনার তথ্য ড্রাইভে সেভ থাকবে</Text>
                </View>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#4f46e5', padding: 16, borderRadius: 16, justifyContent: 'center', marginBottom: 12 }}>
                  <CloudUpload color="#fff" size={20} />
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t.syncNow}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 16, borderRadius: 16, justifyContent: 'center' }}>
                  <CloudDownload color={isDark ? '#fff' : '#4f46e5'} size={20} />
                  <Text style={{ color: isDark ? '#fff' : '#4f46e5', fontWeight: 'bold' }}>{t.fetchNow}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
