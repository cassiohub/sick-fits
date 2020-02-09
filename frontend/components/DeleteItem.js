import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(data: {
      id: $id
    }) {
      id
    }
  }
`;

const DeleteItem = props => {
  const handleClick = (e, deleteItem) => {
    e.preventDefault();

    if (confirm('Delete this item?')) {
      deleteItem()
        .catch(error => alert(error.message));
    }
  };

  const handleUpdate = (cache, payload) => {
    const { items } = cache.readQuery({ query: ALL_ITEMS_QUERY });
    const data = {
      items: items.filter(item => item.id !== payload.data.deleteItem.id),
    };

    cache.writeQuery({
      query: ALL_ITEMS_QUERY,
      data
    });
  };

  return (
    <Mutation
      mutation={DELETE_ITEM_MUTATION}
      variables={{ id: props.id }}
      update={handleUpdate}
    >
      {(deleteItem, payload) => (
        <button onClick={(e) => handleClick(e, deleteItem)}>
          { props.children || 'Delete Item' }
        </button>
      )}
    </Mutation>
  );
};

export default DeleteItem;
export { DELETE_ITEM_MUTATION };