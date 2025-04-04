import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


function AppTextInput({ leftIcon, ...otherProps }) {
    return (
      <View style={styles.container}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color="#6e6869"
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor="#6e6869"
          {...otherProps}
        />
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#f9f9f9',
      borderRadius: 25,
      flexDirection: 'row',
      padding: 15,
      marginVertical: 10
    },
    icon: {
      marginRight: 10
    },
    input: {
      width: '80%',
      fontSize: 18,
      color: '#101010'
    }
});

  
export default AppTextInput;