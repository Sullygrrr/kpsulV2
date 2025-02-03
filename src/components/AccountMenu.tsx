import React from 'react';
import { TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native'; // Utilisation de la version React Native des icônes
import { useNavigation } from '@react-navigation/native'; // Utilisation du système de navigation React Navigation

function AccountMenu() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Account')} // Navigue vers l'écran 'Account'
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <User
        style={{
          width: 20,
          height: 20,
          color: 'white',
          opacity: 0.7,
        }}
      />
    </TouchableOpacity>
  );
}

export default AccountMenu;
