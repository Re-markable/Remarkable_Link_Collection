/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getBookmark = /* GraphQL */ `
  query GetBookmark($id: ID!) {
    getBookmark(id: $id) {
      id
      userid
      siteName
      link
      image
      title
      description
      cat
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUserBookmarks = /* GraphQL */ `
  query ListUserBookmarks($userid: String!) {
    listBookmarks(filter: { userid: { eq: $userid } }) {
      items {
          cat
      }
    }
  }
`;
export const listBookmarks = /* GraphQL */ `
  query ListBookmarks(
    $userid: String!,
    $limit: Int,
    $nextToken: String
  ) {
    listBookmarks(filter: { userid: { eq: $userid } }, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userid
        siteName
        link
        image
        title
        description
        cat
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getFilteredBookmarks = /* GraphQL */ `
  query GetFilteredBookmarks($category: String!, $currentUserId: String!) {
    listBookmarks(
      filter: {
        cat: { eq: $category }
        userid: { ne: $currentUserId }
      }
    ) {
      items {
        id
        userid
        siteName
        link
        image
        title
        description
        cat
        createdAt
      }
    }
  }
`;