import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ImageBackground,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { makeRedirectUri } from 'expo-auth-session';

import {
  useFonts,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://169.254.2.253:8080',
    android: 'http://172.20.30.16:8080',
    default: 'http://172.20.30.16:8080'
  }),
  endpoints: {
    login: '/login',
    googleLogin: '/google-login'
  }
};

// Important: Complete auth session setup
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFaceIdAvailable, setIsFaceIdAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // IMPORTANT: Create a custom redirect URI
  const redirectUri = 'https://auth.expo.io/@itshajar/blinko1';

  console.log('Redirect URI:', redirectUri); // This will log only once

  // Fixed Google Auth configuration with proper scopes and responseType
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '561824674275-7j20qr69tlbaj51j2im43b6g99tq10a3.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: 'id_token', // Explicitly request ID token
    // Removed additionalParameters as it is not a valid property
  });

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  // Fixed response handling with better debugging
  useEffect(() => {
    if (response) {
      console.log('Google OAuth Response:', response);
      if (response.type === 'success' && 'params' in response) {
        const { id_token } = response.params;
        if (id_token) {
          console.log('ID Token received:', id_token.substring(0, 50) + '...');
          handleGoogleLogin(id_token);
        } else {
          console.error('No ID token in response');
          Alert.alert('Error', 'No ID token received from Google');
        }
      } else if (response.type === 'cancel') {
        console.log('User cancelled the login');
        Alert.alert('Login Cancelled', 'You cancelled the Google login process.');
      } else if (response.type === 'error') {
        console.error('OAuth Error:', JSON.stringify(response.error, null, 2));
        Alert.alert('Google Login Error', response.error?.message || 'Failed to authenticate with Google');
      }
    }
  }, [response]);

  const checkDeviceSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsFaceIdAvailable(compatible && enrolled);
  };

  // Fixed Google login handler with better error handling
  const handleGoogleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      console.log('Sending ID token to backend...');
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleLogin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: idToken,
        }),
      });

      const responseData = await response.json();
      console.log('Backend response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Google login failed');
      }

      router.replace('/home/Home');
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Google Login Error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with Face ID',
      fallbackLabel: 'Enter Password',
    });

    if (result.success) {
      router.push('/home/Home');
    } else {
      Alert.alert('Authentication Failed', 'Please try again.');
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 50)}...`);
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      router.replace('/home/Home');
    } catch (error: any) {
      console.error('Full error:', error);
      Alert.alert(
        'Login Error',
        error.message.includes('Expected JSON') 
          ? 'Server returned invalid response'
          : error.message || 'Login failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.topContent}>
  <Text style={styles.title}>Connexion</Text>

  <TextInput
    style={styles.input}
    placeholder="Email"
    placeholderTextColor="rgba(255,255,255,0.7)"
    value={email}
    onChangeText={setEmail}
  />
  <TextInput
    style={styles.input}
    placeholder="Mot de passe"
    placeholderTextColor="rgba(255,255,255,0.7)"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />

  {isFaceIdAvailable && (
    <TouchableOpacity style={styles.faceIdButton} onPress={handleFaceIdLogin}>
      <Text style={styles.faceIdButtonText}>Se connecter avec Face ID</Text>
    </TouchableOpacity>
  )}

  <LinearGradient
    colors={['#dbd2f0', '#dbd2f0']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.loginButton}
  >
    <TouchableOpacity onPress={handleLogin} style={{ width: '100%', alignItems: 'center' }}>
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.loginButtonText}>Se connecter</Text>
      )}
    </TouchableOpacity>
  </LinearGradient>

  <TouchableOpacity onPress={() => Alert.alert('Redirection', 'Vers mot de passe oublié')}>
    <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
  </TouchableOpacity>
</View>

<View style={styles.bottomSection}>
  <Text style={styles.socialText}>Ou connectez-vous avec</Text>

  <View style={styles.socialRow}>
    <Image source={require('@/assets/icons/facebook.png')} style={styles.icon} />
    <TouchableOpacity
      onPress={async () => {
        console.log('Connexion Google');
        const result = await promptAsync();
        console.log('Résultat de promptAsync :', result);
        if (result.type === 'error') {
          console.error('Erreur de connexion Google :', result.error);
          Alert.alert('Erreur de connexion Google', result.error?.message || 'Échec du démarrage de la connexion Google');
        }
      }}
      disabled={!request || isLoading}
    >
      <Image source={require('@/assets/icons/google.png')} style={styles.icon} />
    </TouchableOpacity>
    <Image source={require('@/assets/icons/instagram.png')} style={styles.icon} />
  </View>

  <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
    <Text style={styles.registerText}>
      Vous n’avez pas de compte ? <Text style={styles.registerLink}>Créer un compte</Text>
    </Text>
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
    justifyContent: 'space-between',
  },
  topContent: {
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  faceIdButton: {
    marginTop: 10,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  faceIdButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  forgotPassword: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  bottomSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  loginButton: {
    padding: 14,
    width: '100%',
    borderRadius: 25,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  socialText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
  icon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#444',
    marginTop: 30,
  },
  registerLink: {
    color: '#8E72DC',
    fontWeight: 'bold',
  },
});