import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';

export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://192.168.11.106:8080', // Your local IP
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080'
  }),
  endpoints: {
    login: '/login'
  }
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFaceIdAvailable, setIsFaceIdAvailable] = useState(false);

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsFaceIdAvailable(compatible && enrolled);
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
  
      // First check if response is JSON
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

  const handleSignUp = () => {
    router.push('/(auth)/Register');
  };

  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      style={styles.container}
    >
      {/* Section supérieure avec la courbe blanche */}
      <View style={styles.topSection}>
        <Svg
          height="50%"
          width="100%"
          viewBox="0 0 1440 320"
          style={styles.curve}
        >
          <Path
            fill="#fff"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,112C960,96,1056,128,1152,160C1248,192,1344,224,1392,240L1440,256L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </Svg>
        <Image
          source={require('../../assets/images/Email-capture-amico.png')} // Remplacez par votre image
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Titre et sous-titre */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {/* Champs de saisie */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255, 255, 255, 0.7)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="rgba(255, 255, 255, 0.7)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Message d'erreur */}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* Bouton de connexion */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Bouton Face ID */}
      {isFaceIdAvailable && (
        <TouchableOpacity style={styles.faceIdButton} onPress={handleFaceIdLogin}>
          <Text style={styles.faceIdButtonText}>Login with Face ID</Text>
        </TouchableOpacity>
      )}

      {/* Lien pour s'inscrire */}
      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.footer}>
          Don’t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  curve: {
    position: 'absolute',
    top: 0,
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  input: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent background
    borderRadius: 25,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  loginButton: {
    width: '85%',
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  faceIdButton: {
    width: '85%',
    backgroundColor: '#ffffff44', // Transparent white
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  faceIdButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    fontSize: 14,
    color: '#fff',
    marginTop: 20,
  },
  signUpLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
function setIsLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}

