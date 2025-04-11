import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button } from 'react-native';
import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
};
const handleSignUp = () => {
    router.push('/(auth)/Login'); // ✅ Navigue vers la page Register
  };
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Home!</Text>
      <Button title="Go to Login"  onPress={handleSignUp} />

    </View>
  );
}
