import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import HomeLinkListItem from './HomeLinkListItem';
import Colors from '../utils/Colors';

// amplify
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import awsmobile from '../aws-exports.js';
Amplify.configure(awsmobile);

// queries
import { generateClient } from 'aws-amplify/api';
import { deleteBookmark } from '../graphql/mutations';
import { listBookmarks } from '../graphql/queries';

const client = generateClient();

export default function HomeLinkList({ selectedCategories, onRefreshBookmarks, scrollY }) {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const itemsPerPage = 7;
  const flatListRef = useRef(null);
  const [sortDirection, setSortDirection] = useState("DESC");

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

  useEffect(() => {
    if (user && user.userId) {
        fetchBookmarks(user.userId);
    }
  }, [user]);
  
  const fetchBookmarks = async (userid) => {
    if (!userid) {
      console.error("User ID is null or undefined.");
      return;
    
    }
    try {
      const bookmarkData = await client.graphql({
        query: listBookmarks,
        variables: { userid: userid },
      });
      let bookmarkList = bookmarkData.data.listBookmarks.items;

      // 정렬 방향에 따라 정렬
      bookmarkList = bookmarkList.sort((a, b) => {
        if (sortDirection === "DESC") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
      });

      setBookmarks(bookmarkList);
      // console.log("bookmarkList: ", bookmarkList);
      console.log(`Fetch bookmark list sorted by createdAt (${sortDirection})`);
    } catch (error) {
      console.log('error on fetching bookmarks', error);
    }
  };

  // onRefreshBookmarks로 외부에 refreshBookmarks 함수 전달
  useEffect(() => {
    if (onRefreshBookmarks && user && user.userId) {
        onRefreshBookmarks(() => fetchBookmarks(user.userId));
    }
  }, [onRefreshBookmarks, user]);
  
  // filter categories
  useEffect(() => {
    const newFilteredData =
      selectedCategories.length > 0
        ? bookmarks.filter((item) => selectedCategories.includes(item.cat))
        : bookmarks;
    setFilteredData(newFilteredData);
    setCurrentPage(1);
  }, [selectedCategories, bookmarks]);

  // Pagination update
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPageData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <TouchableOpacity
          key={i}
          onPress={() => goToPage(i)}
          style={[
            styles.pageNumber,
            currentPage === i && styles.currentPageNumber,
          ]}
        >
          <Text
            style={[
              styles.pageNumberText,
              currentPage === i && styles.currentPageNumberText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return pageNumbers;
  };

  // 삭제 콜백 함수
  const handleDelete = async (deletedId) => {
    try {
      await client.graphql({
        query: deleteBookmark,
        variables: { input: { id: String(deletedId) } },
      });
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== deletedId));
      console.log(`Bookmark with ID ${deletedId} deleted successfully.`);
    } catch (error) {
      console.log('Error on deleting bookmark:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={currentPageData}
        renderItem={({ item }) => (
          <HomeLinkListItem item={item} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id} // Use ID as key
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        ListEmptyComponent={
          selectedCategories.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                style={styles.noImage}
                source={require('../../assets/no-image.png')}
              />
              <Text>선택한 카테고리의 링크가 없습니다</Text>
            </View>
          ) : null
        }
      />
      {filteredData.length > 0 && (
        <View style={styles.paginationContainer}>{renderPageNumbers()}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  listContent: {
    paddingHorizontal: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  pageNumber: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 99,
    backgroundColor: '#f0f0f0',
  },
  currentPageNumber: {
    backgroundColor: Colors.PRIMARY,
  },
  pageNumberText: {
    fontSize: 12,
  },
  currentPageNumberText: {
    color: Colors.BLACK,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400, // FlatList가 비어있을 때의 최소 높이
  },
  noImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain'
  }
});
