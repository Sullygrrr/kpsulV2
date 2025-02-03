import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from 'react-native-vector-icons';
import { useAuth } from '../contexts/AuthContext'; // Assure-toi que tu as bien ton contexte d'authentification

function Login() {
  const navigation = useNavigation();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigation.navigate('Home');  // Remplace 'Home' par l'écran vers lequel tu veux naviguer après la connexion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KPSUL</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="mail" size={24} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#B0B0B0"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="key" size={24} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            required
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title={loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
          onPress={handleSubmit}
          disabled={loading}
        />

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '100',
    color: '#fff',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    paddingLeft: 40,
    paddingRight: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleText: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Login;
