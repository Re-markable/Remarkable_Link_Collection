import { View, Text, Image, Platform, Modal, Button, Alert, Animated } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { parseDocument } from 'htmlparser2';
import ShareMenu from 'react-native-share-menu';

import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { createBookmark } from '../graphql/mutations';
import { listUserBookmarks, getFilteredBookmarks } from '../graphql/queries';

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
    const [topCategory, setTopCategory] = useState(null);
    const [recentBookmarks, setRecentBookmarks] = useState([]);
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 5],
        outputRange: [50, 0],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 10],
        outputRange: [1, -0.8],
        extrapolate: 'clamp',
    });
    
    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
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

    useEffect(() => {
        if (user) {
            fetchCategoryStats();
        }
    }, [user]);

    const fetchCategoryStats = async () => {
        try {
            const { data } = await client.graphql({
                query: listUserBookmarks,
                variables: { userid: user.userId },
            });

            const bookmarks = data.listBookmarks.items;

            if (!bookmarks || bookmarks.length === 0) {
                console.log("No bookmarks found.");
                Alert.alert("알림", "저장된 북마크가 없습니다.");
                return;
            }

            analyzeCategories(bookmarks);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            Alert.alert("오류", "북마크 데이터를 가져오는 중 문제가 발생했습니다.");
        }
    };

    const analyzeCategories = async (bookmarks) => {
        const categoryCounts = bookmarks.reduce((acc, bookmark) => {
            const category = bookmark.cat || "Uncategorized";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    
        const sortedStats = Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    
        const topCategory = sortedStats[0]?.category; // 문자열 값만 저장
        setTopCategory(topCategory);
    
        if (topCategory) {
            const recentBookmarksData = await fetchRecentBookmarksForCategory(topCategory);
            setRecentBookmarks(recentBookmarksData);
        }
    };
    
    const fetchRecentBookmarksForCategory = async (category) => {
        if (!category || !user?.userId) return []; // 방어 코드 추가
    
        try {
            const { data } = await client.graphql({
                query: getFilteredBookmarks,
                variables: {
                    category, // 카테고리 값 전달
                    currentUserId: user.userId, // 현재 유저 ID 전달
                },
            });
    
            const bookmarks = data?.listBookmarks?.items || [];
            return bookmarks
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 정렬
                .slice(0, 5); // 상위 5개만 반환
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            return [];
        }
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
                const document = parseDocument(html);

                const head = document.children.find((node) => node.name === 'html')?.children.find((node) => node.name === 'head');
                const metaTags = head?.children.filter((node) => node.name === 'meta') || [];

                const getMetaContent = (property) => {
                    const tag = metaTags.find(tag => tag.attribs && tag.attribs.property === property);
                    return tag ? tag.attribs.content : null;
                };

                const ogSiteName = getMetaContent('og:site_name') || 'Unknown Site';
                const ogTitle = getMetaContent('og:title') || 'No title';
                const ogDescription = getMetaContent('og:description') || ' ';
                let ogImage = getMetaContent('og:image') || 'No image';
                if (ogImage && !ogImage.startsWith('http')) {
                    const baseUrl = new URL(linkData);
                    ogImage = new URL(ogImage, baseUrl.origin).href;
                }
                
                let predictedCategory = 'Uncategorized';
                try {
                    const predictionResponse = await fetch('http://15.152.45.240:5000/model', {
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
                            cat: predictedCategory
                        }
                    }
                });

                console.log('Data added successfully: ', newBookmark);
                Alert.alert('Success', 'Bookmark added successfully!');

                if (refreshBookmarksRef.current) {
                  await refreshBookmarksRef.current();
                }
                fetchCategoryStats();
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
            <Animated.View style={[
                styles.header,
                { height: headerHeight, opacity: headerOpacity },
                ]}
            >
                <Image
                    source={require('./../../assets/logo.png')}
                    style={{
                        width: 30,
                        height: 30,
                    }}
                />
                
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.catBtn}
                >
                    <Text>카테고리</Text>
                    <View style={{ backgroundColor: Colors.WHITE }}>
                        <AntDesign name="down" size={18} color={Colors.BLACK} />
                    </View>
                </TouchableOpacity>

                <View style={{ flex: 3 }}></View>

                <AntDesign name="search1" size={28} color={Colors.BLACK} />
                
                {/* profile image & setting */}
                <TouchableOpacity
                    onPress={() => {
                        setProfileModalVisible(true)
                    }}
                    style={{ flexDirection: 'row', paddingTop: 5, paddingLeft: 6 }}
                >
                    <Image
                        style={{ width: 28, height: 28 }}
                        source={require('../../assets/profile-image.png')}
                    />
                </TouchableOpacity>
            </Animated.View>

            <HomeLinkList
                selectedCategories={selectedCategories}
                onRefreshBookmarks={setRefreshBookmarks}
                scrollY={scrollY}
            />
            <Divider />
            <RecommendationList recentBookmarks={recentBookmarks} />

            {/* Link List */}
            {/* <Animated.View style={styles.linkList}>
                <View style={{ height: 18 }}></View>
                <HomeLinkList selectedCategories={selectedCategories} onRefreshBookmarks={setRefreshBookmarks} />

                <Divider />

                <RecommendationList recentBookmarks={recentBookmarks} />
            </Animated.View> */}

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
        backgroundColor: Colors.WHITE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 2,
        paddingHorizontal: 10,
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
        marginLeft: 4,
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