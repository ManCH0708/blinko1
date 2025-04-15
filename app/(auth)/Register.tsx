import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';

const { height } = Dimensions.get('window');

const API_CONFIG = {
  baseUrl: Platform.select({
    ios: 'http://192.168.2.8:8080',
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }),
  endpoints: {
    register: '/register',
  },
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      });
      const resText = await response.text();
      const data = resText ? JSON.parse(resText) : {};
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      Alert.alert('Success', 'Account created!', [
        { text: 'OK', onPress: () => router.replace('/(auth)/Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.background}
        imageStyle={styles.rotatedImage} // rotate image
        resizeMode="cover"
      >
        <View style={styles.topContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email or phone number"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TextInput
            placeholder="Name or pseudo"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
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
  rotatedImage: {
    transform: [{ rotate: '180deg' }],
  },
  topContent: {
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  backText: {
    fontSize: 16,
    color: '#1E1E2C',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E2C',
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  button: {
    backgroundColor: '#885aa0',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
