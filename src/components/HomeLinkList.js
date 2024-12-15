import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

import HomeLinkListItem from './HomeLinkListItem.js';
import Colors from '../utils/Colors.js';

// amplify
import { Amplify, API } from 'aws-amplify';
import awsmobile from '../aws-exports.js';
Amplify.configure(awsmobile);

// queries
import { generateClient } from 'aws-amplify/api';
import { deleteBookmark } from '../graphql/mutations.js';
import { listBookmarks } from '../graphql/queries.js';

const client = generateClient();

export default function HomeLinkList({ selectedCategories }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const itemsPerPage = 7;
  const flatListRef = useRef(null);

  // mount data
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const bookmarkData = await client.graphql({
        query: listBookmarks,
      });
      const bookmarkList = bookmarkData.data.listBookmarks.items;
      console.log('bookmark list', bookmarkList);
      setBookmarks(bookmarkList);
    } catch (error) {
      console.log('error on fetching bookmarks', error);
    }
  };

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
      <FlatList
        ref={flatListRef}
        data={currentPageData}
        renderItem={({ item }) => (
          <HomeLinkListItem item={item} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id} // Use ID as key
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
