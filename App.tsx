import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/pages/Home';
import Account from './src/pages/Account';
import CreateKpsul from './src/pages/CreateKpsul';
import Login from './src/pages/Login';
import { AuthProvider } from './src/contexts/AuthContext'; // Assure-toi du bon chemin

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>  {/* AuthProvider autour de NavigationContainer */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="Create" component={CreateKpsul} />
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
