import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function HomeScreen() {
    const handleLogin = () => {
        router.push('/(auth)/Login');
      };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenue sur la page Home 🎉</Text>
      <Button title="Sign Up" onPress={handleLogin} />
    </View>
   
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'green',
    fontSize: 20,
  },
});
