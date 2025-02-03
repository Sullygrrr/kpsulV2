import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, PenSquare } from 'lucide-react-native'; // Assure-toi que tu utilises lucide-react-native
import AccountMenu from '../components/AccountMenu'; // Assure-toi que ce composant est bien compatible avec React Native

const Home = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AccountMenu />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('home.title')}</Text>

        <View style={styles.buttonContainer}>
          {/* Bouton "Créer une Kpsul" */}
          <TouchableOpacity onPress={() => navigation.navigate('Create')} style={styles.button}>
            <PenSquare size={24} color="white" />
            <Text style={styles.buttonText}>{t('home.create')}</Text>
          </TouchableOpacity>

          {/* Bouton "Mes Kpsuls" */}
          <TouchableOpacity onPress={() => navigation.navigate('View')} style={styles.button}>
            <BookOpen size={24} color="white" />
            <Text style={styles.buttonText}>{t('home.view')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 5,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15, // Ajoute un espacement uniforme entre les boutons
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black', // Assure que le bouton est bien noir
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    paddingVertical: 16,
    width: '100%', // Assure que les boutons sont de même largeur
    height: 60, // Hauteur fixe pour que les boutons soient identiques
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 10, // Espacement entre l'icône et le texte
  },
});

export default Home;
