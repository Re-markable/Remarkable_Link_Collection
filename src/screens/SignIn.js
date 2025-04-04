import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signIn } from 'aws-amplify/auth';

import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';


function SignIn({ navigation, updateAuthState }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    async function handleSignIn() {
      try {
        await signIn({ username, password });
        console.log('✅ Sign-in success:');
        updateAuthState('loggedIn');
      } catch (err) {
        console.error('❌ Error signing in:', err);
        if (err.code === 'UserNotConfirmedException') {
          alert('User not confirmed. Please confirm your account.');
        } else if (err.code === 'NotAuthorizedException') {
          alert('Incorrect username or password.');
        } else if (err.code === 'UserNotFoundException') {
          alert('User does not exist.');
        } else {
          alert('An unknown error occurred.');
        }
      }
    }
  
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign in to your account</Text>
          <AppTextInput
            value={username}
            onChangeText={text => setUsername(text)}
            leftIcon="account"
            placeholder="Enter username"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <AppTextInput
            value={password}
            onChangeText={text => setPassword(text)}
            leftIcon="lock"
            placeholder="Enter password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            textContentType="password"
          />
          <AppButton title="Login" onPress={handleSignIn} />
          <View style={styles.footerButtonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.forgotPasswordButtonText}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: 'white'
    },
    container: {
      flex: 1,
      alignItems: 'center'
    },
    title: {
      fontSize: 20,
      color: '#202020',
      fontWeight: '500',
      marginVertical: 15
    },
    footerButtonContainer: {
      marginVertical: 15,
      justifyContent: 'center',
      alignItems: 'center'
    },
    forgotPasswordButtonText: {
      color: 'tomato',
      fontSize: 18,
      fontWeight: '600'
    }
});


export default SignIn;