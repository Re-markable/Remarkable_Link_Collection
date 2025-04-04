import { View, FlatList, Dimensions, Text } from 'react-native'
import React from 'react'

import RecommendationListItem from './RecommendationListItem.js';
import Colors from '../utils/Colors.js'
// amplify
import { Amplify } from 'aws-amplify';
import awsmobile from '../aws-exports.js';
Amplify.configure(awsmobile);


const { width } = Dimensions.get('window');

export default function RecommendationList({ recentBookmarks }) {
  return (
    <View style={{ backgroundColor: Colors.WHITE }}>
      {recentBookmarks.length > 0 ? ( 
        <FlatList
          data={recentBookmarks}
          renderItem={({ item }) => <RecommendationListItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          snapToInterval={width - 60} // 아이템 너비 + 좌우 패딩
          decelerationRate="fast"
          snapToAlignment="center"
          style={{ paddingTop: 5 }}
        /> 
      ) : (
        <Text style={{ textAlign: 'center', marginVertical: 20 }}>
            추천할 북마크가 없습니다.
        </Text>
      )}
    </View>
  )
};