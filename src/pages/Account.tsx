import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, LogOut, Globe } from 'lucide-react-native'; 
import { useAuth } from '../contexts/AuthContext';
import { languages } from '../i18n';

const Account = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Login'); // Assure-toi que "Login" est bien défini dans App.tsx
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
          <Text style={styles.backText}>{t('nav.back')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sélection de la langue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('account.language')}</Text>
        <FlatList
          data={Object.entries(languages)}
          keyExtractor={([code]) => code}
          renderItem={({ item: [code, { name, dir }] }) => (
            <TouchableOpacity 
              onPress={() => handleLanguageChange(code)} 
              style={[styles.languageButton, i18n.language === code && styles.selectedLanguage]}
            >
              <Globe size={20} color="white" />
              <Text style={styles.languageText} textAlign={dir === 'rtl' ? 'right' : 'left'}>
                {name}
              </Text>
              {i18n.language === code && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bouton Déconnexion */}
      <View style={styles.section}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="white" />
          <Text style={styles.logoutText}>{t('account.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30, // Ajout d’un padding pour éviter que le dernier élément soit trop proche du bord inférieur
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  selectedLanguage: {
    borderColor: 'white',
  },
  languageText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  checkMark: {
    color: 'white',
    fontSize: 18,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Account;
