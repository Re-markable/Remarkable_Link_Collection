import { View, FlatList, Dimensions } from 'react-native'
import React from 'react'

import RecommendationListItem from './RecommendationListItem.js';
import Colors from '../utils/Colors.js'
// amplify
import { Amplify } from 'aws-amplify';
import awsmobile from '../aws-exports.js';
Amplify.configure(awsmobile);


const { width } = Dimensions.get('window');

const dummy = [
  {
    "image": "https://dummyimage.com/350x350/000/fff",
    "title": "Recomm Title",
    "description": "This is Link's Description. This is Link's Description. This is Link's Description."
  },
  {
    "image": "https://dummyimage.com/350x350/000/fff",
    "title": "Recomm Title",
    "description": "This is Link's Description. This is Link's Description. This is Link's Description."
  },
  {
    "image": "https://dummyimage.com/350x350/000/fff",
    "title": "Recomm Title",
    "description": "This is Link's Description. This is Link's Description. This is Link's Description."
  },
  {
    "image": "https://dummyimage.com/350x350/000/fff",
    "title": "Recomm Title",
    "description": "This is Link's Description. This is Link's Description. This is Link's Description."
  },
  {
    "image": "https://dummyimage.com/350x350/000/fff",
    "title": "Recomm Title",
    "description": "This is Link's Description. This is Link's Description. This is Link's Description."
  },
];

export default function RecommendationList() {
  return (
    <View style={{ backgroundColor: Colors.WHITE }}>
      <FlatList
        data={dummy}
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
    </View>
  )
};