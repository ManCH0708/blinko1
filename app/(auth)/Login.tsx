import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

type LoginResponse = {
  success: boolean;
  message: string;
};
// utils/apiConfig.ts
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

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);



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

  const handleSignUp = (): void => {
    router.push('/(auth)/Register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topWave} />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={(text: string) => setEmail(text)}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={(text: string) => setPassword(text)}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>or sign in using social media</Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>f</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>G</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>t</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.footer}>
          Don't have an account? <Text style={styles.signUpLink}>Register now</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
    marginTop: 200,
  },
  topWave: {
    backgroundColor: '#7A50D4',
    width: width * 1.5,
    height: 300,
    position: 'absolute',
    top: -150,
    borderBottomRightRadius: 300,
    borderBottomLeftRadius: 300,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    marginTop: -100,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#7A50D4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  or: {
    marginVertical: 20,
    color: '#999',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialBtn: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  footer: {
    color: '#999',
    marginTop: 12,
  },
  signUpLink: {
    color: '#7A50D4',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});