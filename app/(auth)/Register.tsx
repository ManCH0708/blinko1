import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const handleRegister = () => {
    router.replace('/(auth)/Login');
  };

  const handleLogin = () => {
    router.push('/(auth)/Login');
  };

  return (
    <LinearGradient colors={['#3A0CA3', '#4361EE']} style={styles.container}>
      {/* Feuilles décoratives */}
      <Image source={require('@/assets/images/favicon.png')} style={styles.decor} />

      <View style={styles.form}>
        <Text style={styles.title}>Registerrrrrr</Text>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#eee" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#eee" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#eee" secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S’INSCRIRE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 180,
    resizeMode: 'contain',
  },
  form: {
    width: '100%',
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#3A0CA3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
  },
  link: {
    fontWeight: 'bold',
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
