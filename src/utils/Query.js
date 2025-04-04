import { generateClient } from "aws-amplify/api";
import { listBookmarks, getBookmark } from "./graphql/queries";
import { deleteBookmark } from './graphql/mutations';

const client = generateClient()

// List all items
const allBookmarks = await client.graphql({
    query: listBookmarks
});

// Get a specific item
const oneBookmark = await client.graphql({
    query: getBookmark,
    variables: { id: 'YOUR_RECORD_ID' }
});

const deletedBookmark = await client.graphql({
    query: deleteBookmark,
    variables: {
        input: {
            id: "YOUR_RECORD_ID"
        }
    }
});

export { allBookmarks, oneBookmark, deletedBookmark };