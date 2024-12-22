import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'

export default function RecommendationListItem({ item }) {
  // 짧게 누르면 링크로 연결
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(item.link);
      if (supported) {
        await Linking.openURL(item.link);
      } else {
        console.log('URL을 열 수 없습니다: ' + item.link);
      }
    } catch (error) {
      console.error('링크를 여는 중 오류가 발생했습니다:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>{item.siteName}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 5,
    marginHorizontal: 2,
    width: 84, // 컨테이너의 너비를 고정
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 20,
    marginBottom: 5, // 이미지와 텍스트 사이의 간격
  },
  textContainer: {
    width: '100%', // 텍스트 컨테이너의 너비를 이미지 너비에 맞춤
    alignItems: 'center', // 텍스트를 중앙 정렬
  },
  textTitle: {
    textAlign: 'center', // 텍스트 내용 자체를 중앙 정렬
    fontSize: 14,
    fontWeight: 'bold',
  },
})