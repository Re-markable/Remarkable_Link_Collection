import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmSignUp } from 'aws-amplify/auth';

import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';


function ConfirmSignUp({ navigation }) {
  const [confirmationCode, setConfirmationCode] = useState('');

  async function handleSignUpConfirmation() {
    try {
      await confirmSignUp({confirmationCode});
      console.log('✅ Code confirmed');
      navigation.navigate('SignIn');
    } catch (error) {
      console.log(
        '❌ Error confirming...', error
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Sign Up</Text>
        <AppTextInput
          value={confirmationCode}
          onChangeText={text => setConfirmationCode(text)}
          leftIcon="numeric"
          placeholder="Enter verification code"
          keyboardType="numeric"
        />
        <AppButton title="Confirm Sign Up" onPress={handleSignUpConfirmation} />
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
    }
});


export default ConfirmSignUp;