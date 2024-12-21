import { View, Text, Dimensions, Image, Platform, Modal, Button } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from 'react-native';
import { fetchUserAttributes } from '@aws-amplify/auth';
import { signOut, getCurrentUser } from 'aws-amplify/auth';

import Colors from '../utils/Colors';
import Divider from '../components/Divider'
import CustomModal from '../components/CustomModal';
import HomeLinkList from '../components/HomeLinkList';
import RecommendationList from '../components/RecommendationList'

const data = [
    { key: 'fashion', value: '패션' },
    { key: 'beauty', value: '뷰티' },
    { key: 'interior', value: '인테리어' },
    { key: 'food', value: '식품' },
    { key: 'living', value: '생활용품' },
    { key: 'digital', value: '가전·디지털' },
    { key: 'health', value: '건강·헬스' },
    { key: 'hobby', value: '취미' },
    { key: 'edu', value: '학습' },
];

export default function Home({ updateAuthState }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);  // 유저 프로필 모달 상태 추가
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [userInfo, setUserInfo] = useState({
        // login 연결하면서 수정
        name: '홍길동',  // 예시 유저명
        email: 'hong@example.com',  // 예시 이메일
    });

    const handleCategoriesSelect = (categories) => {
        setSelectedCategories(categories);
        setModalVisible(false);
    };

    async function handleSignOut() {
        try {
          await signOut();
          updateAuthState('loggedOut');
        } catch (error) {
          console.log('Error signing out: ', error);
          Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
      }

    return (
        <View style={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <View style={styles.header1}>
                    <Image
                        source={require('./../../assets/logo.png')}
                        style={{
                            width: 50,
                            height: 50,
                        }}
                    />
                    {/* profile image & setting */}
                    <TouchableOpacity
                        onPress={() => {
                            setProfileModalVisible(true)}}  // 프로필 모달 열기
                        style={{ flexDirection: 'row', paddingTop: 5 }}
                    >
                        <Image
                            style={{ width: 40, height: 40 }}
                            source={require('../../assets/profile-image.png')}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.header2}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={styles.catBtn}
                    >
                        <Text>카테고리</Text>
                        <View style={{ backgroundColor: Colors.WHITE }}>
                            <AntDesign name="down" size={24} color={Colors.BLACK} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ flex: 3 }}></View>

                    <AntDesign name="search1" size={28} color={Colors.BLACK} />
                </View>
            </View>

            {/* Link List */}
            <View style={styles.linkList}>
                <View style={{ height: 18 }}></View>
                <HomeLinkList selectedCategories={selectedCategories} />

                <Divider />

                <RecommendationList />
            </View>

            {/* categories modal */}
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                data={data}
                onSelectCategories={handleCategoriesSelect}
            />

            {/* Profile Modal */}
            <Modal
                visible={profileModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>User Profile</Text>
                        <Text style={styles.modalText}>이름: {userInfo.name}</Text>
                        <Text style={styles.modalText}>이메일: {userInfo.email}</Text>

                        <View style={styles.modalButtons}>
                            <Button title="로그아웃" onPress={handleSignOut} />
                            <Button title="취소" onPress={() => setProfileModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        marginTop: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: Colors.BACKGROUND_TRANSP,
    },
    header: {
        paddingHorizontal: 10,
    },
    header1: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    header2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 25,
        paddingVertical: 10,
        borderBottomEndRadius: 15,
    },
    catBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        borderRadius: 10,
        width: 50,
        height: 30,
        backgroundColor: Colors.WHITE,
    },
    linkList: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: Colors.WHITE,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 5,
            },
        }),
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
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
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});