import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

export default function RecommendationListItem({ item }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.textTitle}>{item.title}</Text>
      </View>
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