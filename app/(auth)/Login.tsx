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
import {
  useFonts,
  Poppins_600SemiBold,
} 
from '@expo-google-fonts/poppins';
export const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://192.168.2.8:8080', // Your local IP
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
  const [isFaceIdAvailable, setIsFaceIdAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

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
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {isFaceIdAvailable && (
            <TouchableOpacity style={styles.faceIdButton} onPress={handleFaceIdLogin}>
              <Text style={styles.faceIdButtonText}>Login with Face ID</Text>
            </TouchableOpacity>
          )}

          {/* Login button */}
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
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          {/* Forgot password */}
          <TouchableOpacity onPress={() => Alert.alert('Redirect', 'To Forgot Password')}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Social login + Sign up */}
        <View style={styles.bottomSection}>
          <Text style={styles.socialText}>Or login with</Text>

          <View style={styles.socialRow}>
            <Image source={require('@/assets/icons/facebook.png')} style={styles.icon} />
            <Image source={require('@/assets/icons/google.png')} style={styles.icon} />
            <Image source={require('@/assets/icons/instagram.png')} style={styles.icon} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
            <Text style={styles.registerText}>
              Don’t have an account? <Text style={styles.registerLink}>Sign Up</Text>
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
