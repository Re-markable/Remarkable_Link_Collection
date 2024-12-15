import React, { useState } from 'react';
import { Linking, TouchableOpacity, Modal, Button } from 'react-native';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function HomeLinkListItem({ item, onDelete }) {
  const [modalVisible, setModalVisible] = useState(false);

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

  // 길게 누르면 삭제 모달 표시
  const handleLongPress = () => {
    setModalVisible(true);
  };

  const handleDelete = () => {
    // 부모 컴포넌트로 삭제 요청
    onDelete(item.id);
    setModalVisible(false); // 모달 닫기
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>{item.title}</Text>
          <Text
            style={styles.textDescription}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>삭제하시겠습니까?</Text>
            <View style={styles.modalButtons}>
              <Button title="아니오" onPress={() => setModalVisible(false)} />
              <Button title="네" onPress={handleDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
  },
  textDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
