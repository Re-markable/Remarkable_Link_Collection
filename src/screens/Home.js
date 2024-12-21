import { View, Text, Dimensions, Image, Platform, Modal, Button, Alert } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { parseDocument } from 'htmlparser2';
import ShareMenu from 'react-native-share-menu';

import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { createBookmark } from '../graphql/mutations';

import Colors from '../utils/Colors';
import Divider from '../components/Divider'
import CustomModal from '../components/CustomModal';
import HomeLinkList from '../components/HomeLinkList';
import RecommendationList from '../components/RecommendationList'

import awsconfig from '../../src/aws-exports';


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
    const client = generateClient({
        region: awsconfig.aws_appsync_region,
        url: awsconfig.aws_appsync_graphqlEndpoint,
        auth: {
            type: awsconfig.aws_appsync_authenticationType,
            jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
            apiKey: awsconfig.aws_appsync_apiKey,
        },
    });

    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isAddingBookmark, setIsAddingBookmark] = useState(false);
    const refreshBookmarksRef = useRef(null);

    useEffect(() => {
        async function fetchUser() {
            try {
            const userData = await getCurrentUser();
            setUser(userData);
            console.log('User data:', userData);
            } catch (error) {
            console.log('Error fetching user: ', error);
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

    const setRefreshBookmarks = (refreshFunc) => {
        refreshBookmarksRef.current = refreshFunc;
    };

    const handleShare = useCallback((item) => {
        if (!item || !item.data || !item.data[0] || !item.data[0].data) {
            return;
        }

        const linkData = item.data[0].data;
        console.log('linkData: ', linkData);

        async function addData() {
            if (!linkData || !user?.userId || isAddingBookmark) {
                return;
            }

            setIsAddingBookmark(true);

            try {
                const response = await fetch(linkData);
                const html = await response.text();
                const document = parseDocument(html); // htmlparser2의 parseDocument 사용

                // head 태그 추출 및 meta 태그 필터링
                const head = document.children.find((node) => node.name === 'html')?.children.find((node) => node.name === 'head');
                const metaTags = head?.children.filter((node) => node.name === 'meta') || [];

                const getMetaContent = (property) => {
                    const tag = metaTags.find(tag => tag.attribs && tag.attribs.property === property);
                    return tag ? tag.attribs.content : null;
                };

                const ogTitle = getMetaContent('og:title') || 'No title';
                const ogDescription = getMetaContent('og:description') || ' ';
                let ogImage = getMetaContent('og:image') || 'No image';
                const ogSiteName = getMetaContent('og:site_name') || 'Unknown Site';

                // 상대 경로 이미지 처리
                if (ogImage && !ogImage.startsWith('http')) {
                    const baseUrl = new URL(linkData);
                    ogImage = new URL(ogImage, baseUrl.origin).href;
                }
                
                // POST 요청으로 prediction 값 가져오기
                let predictedCategory = 'Uncategorized';
                try {
                    const predictionResponse = await fetch('http://15.168.237.201:5000/model', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ title: ogTitle }),
                    });

                    if (predictionResponse.ok) {
                        const predictionData = await predictionResponse.json();
                        predictedCategory = predictionData.prediction || 'Uncategorized';
                    } else {
                        console.log('Prediction 요청 실패: ', predictionResponse.status);
                    }
                } catch (error) {
                    console.log('Prediction 요청 중 오류 발생: ', error);
                }

                const newBookmark = await client.graphql({
                    query: createBookmark,
                    variables: {
                        input: {
                            userid: user.userId,
                            siteName: ogSiteName || ogTitle || 'Unknown Site',
                            link: linkData,
                            image: ogImage || 'No image',
                            title: ogTitle || 'No title',
                            description: ogDescription || ' ',
                            cat: predictedCategory // 예측값으로 카테고리 설정
                        }
                    }
                });

                console.log('Data added successfully: ', newBookmark);
                Alert.alert('Success', 'Bookmark added successfully!');

                if (refreshBookmarksRef.current) {
                  await refreshBookmarksRef.current();
                }
            } catch (error) {
                console.log('Error adding data: ', error);
                Alert.alert('Error', 'Failed to add bookmark. Please try again.');
            } finally {
                setIsAddingBookmark(false);
            }
        }

        addData();
    }, [user, client, isAddingBookmark]);

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
                <HomeLinkList selectedCategories={selectedCategories} onRefreshBookmarks={setRefreshBookmarks} />

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
                        <Text style={styles.modalText}>이름: {user?.username}</Text>
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
        paddingTop: 44,
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
        paddingTop: 15,
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