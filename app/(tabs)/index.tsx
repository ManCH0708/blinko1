import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ImageBackground
        source={require('../../assets/images/background-welcome.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Logo */}
          <Image
            source={require('../../assets/images/logo_blinko2.png')}
            style={styles.logo}
          />

          {/* Welcome Text */}
          <Text style={styles.title}>Bienvenue sur Blinko</Text>
<Text style={styles.paragraph}>
  Blinko vous aide à capturer facilement des captures d’écran et des moments audio depuis votre écran. Organisez, enregistrez et explorez tout ce que vous avez vu ou entendu — de manière plus intelligente et plus rapide.
</Text>

{/* Boutons */}
<TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/Login')}>
  <Text style={styles.buttonText}>Connexion</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, styles.secondaryButton]}
  onPress={() => router.push('/pages/profil')}
>
  <Text style={styles.buttonText}>Créer un compte</Text>
</TouchableOpacity>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
    paddingTop: height * 0.12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logo: {
    width: 230,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: -50,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 22,
  },
  paragraph: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 55,
    lineHeight: 22,
  },
  button: {
    width: '80%',
    backgroundColor: '#8E72DC',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#A88ADD',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
