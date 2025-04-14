import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';

// Move API config to a separate file (utils/apiConfig.ts)
const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://192.168.11.106:8080', // Your local IP
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080'
  }),
  endpoints: {
    register: '/register'
  }
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Input validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name.trim(),
          email: email.trim(),
          password: password
        })
      });
  
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }
  
      Alert.alert('Success', 'Account created!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/Login') }
      ]);
    } catch (error: any) {
      console.error('Full error:', error);
      Alert.alert(
        'Registration Failed',
        error.message.includes('JSON Parse error') 
          ? 'Server returned invalid data'
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7A50D4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    color: '#666',
  },
  loginLink: {
    color: '#7A50D4',
    fontWeight: 'bold',
  },
});