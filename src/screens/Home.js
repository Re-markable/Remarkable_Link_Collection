import { View, Text, Dimensions, Image, Platform, Modal, Button, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from 'react-native';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import ShareMenu from 'react-native-share-menu';
import { parseDocument } from 'htmlparser2';

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
    const [userInfo, setUserInfo] = useState({
        name: '',
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isAddingBookmark, setIsAddingBookmark] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getCurrentUser();
                setUserInfo({
                    name: userData.username,
                });
                console.log('User data:', userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                Alert.alert('Error', 'Failed to fetch user data. Please try logging in again.');
            }
        }

        fetchUser();
    }, []);

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

    const handleShare = useCallback((item) => {
        if (!item || !item.data || !item.data[0] || !item.data[0].data) {
            return;
        }

        const linkData = item.data[0].data;
        console.log('linkData: ', linkData);

        async function addData() {
            if (!linkData || isAddingBookmark) {
                console.log('Missing linkData or already adding bookmark:', { linkData, isAddingBookmark });
                return;
            }

            setIsAddingBookmark(true);

            try {
                const response = await fetch(linkData);
                const html = await response.text();
                const document = parseDocument(html); // htmlparser2의 parseDocument 사용

                const metaTags = document.children.filter(node => node.name === 'meta');

                const getMetaContent = (property) => {
                    const tag = metaTags.find(tag => tag.attribs && tag.attribs.property === property);
                    return tag ? tag.attribs.content : null;
                };

                const ogTitle = getMetaContent('og:title') || 'No title';
                const ogDescription = getMetaContent('og:description') || 'No description';
                const ogImage = getMetaContent('og:image') || 'No image';
                const ogSiteName = getMetaContent('og:site_name') || 'Unknown Site';

                const newBookmark = {
                    userid: userInfo.name,
                    siteName: ogSiteName,
                    link: linkData,
                    image: ogImage,
                    title: ogTitle,
                    description: ogDescription,
                    cat: 'Uncategorized'
                };

                console.log('Data added successfully: ', newBookmark);
                Alert.alert('Success', 'Bookmark added successfully!');
            } catch (error) {
                console.log('Error adding data: ', error);
                Alert.alert('Error', 'Failed to add bookmark. Please try again.');
            } finally {
                setIsAddingBookmark(false);
            }
        }

        addData();
    }, [userInfo, isAddingBookmark]);

    useEffect(() => {
        ShareMenu.getInitialShare(handleShare);
    }, [handleShare]);

    useEffect(() => {
        const listener = ShareMenu.addNewShareListener(handleShare);
        return () => {
            listener.remove();
        };
    }, [handleShare]);

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
                            setProfileModalVisible(true)
                        }}
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