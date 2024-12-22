import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Divider = ({ color = '#E0E0E0', thickness = 3 }) => {
  return <View style={[styles.divider, { backgroundColor: color, height: thickness }]} />;
};

const styles = StyleSheet.create({
  divider: {
    width: width,
    alignSelf: 'center',
  },
});

export default Divider;