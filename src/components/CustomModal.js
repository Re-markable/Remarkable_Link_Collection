import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CheckBox, Icon } from '@rneui/themed';

import Colors from '../utils/Colors';

const CustomModal = ({ visible, onClose, data, onSelectCategories }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryToggle = (key) => {
    setSelectedCategories(prevSelected => {
      if (prevSelected.includes(key)) {
        return prevSelected.filter(item => item !== key);
      } else {
        return [...prevSelected, key];
      }
    });
  };

  const handleConfirm = () => {
    const selectedCategoryValues = selectedCategories.map(key =>
      data.find(item => item.key === key).value
    );
    onSelectCategories(selectedCategoryValues);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>카테고리 선택</Text>
          <ScrollView style={styles.checkboxContainer}>
            {data.map((item) => (
              <CheckBox
                key={item.key}
                title={item.value}
                checked={selectedCategories.includes(item.key)}
                onPress={() => handleCategoryToggle(item.key)}
                containerStyle={styles.checkbox}
                textStyle={styles.checkboxText}
                checkedColor={Colors.PRIMARY}  // 체크된 상태의 색상
                uncheckedColor={Colors.GRAY}   // 체크되지 않은 상태의 색상
                size={27}  // 체크박스 크기
                checkedIcon="check-square"  // 체크된 상태의 아이콘
                uncheckedIcon="square-o"    // 체크되지 않은 상태의 아이콘
              />
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    width: '100%',
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  checkboxText: {
    fontWeight: 'normal',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BLACK,
  },
  confirmButton: {
    backgroundColor: "#4169E1",
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: Colors.BLACK,
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default CustomModal;