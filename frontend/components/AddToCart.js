import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import { LOCAL_STATE_QUERY } from './Cart';

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

const update = (cache, payload) => {
  const { cartOpen } = cache.readQuery({
    query: LOCAL_STATE_QUERY,
  });

  if (!cartOpen) {
    cache.writeQuery({
      query: LOCAL_STATE_QUERY,
      data: {
        cartOpen: true,
      },
    });
  }
}

const AddToCart = ({ id }) => (
  <Mutation
    mutation={ADD_TO_CART_MUTATION}
    variables={{ id }}
    refetchQueries={[
      { query: CURRENT_USER_QUERY },
    ]}
    // update={update}
  >
    {(addToCart, { loading }) => (
      <button onClick={addToCart} disabled={loading}>
        Add{loading && 'ing'} To Cart 🛒
      </button>
    )}
  </Mutation>
);

export default AddToCart;
export { ADD_TO_CART_MUTATION };
