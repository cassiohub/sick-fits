import React from 'react';
import styled from 'styled-components';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

const update = (cache, payload) => {
  const data = cache.readQuery({
    query: CURRENT_USER_QUERY,
  });

  const cartItemId = payload.data.removeFromCart.id;
  data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);

  cache.writeQuery({
    query: CURRENT_USER_QUERY,
    data,
  });
}

const RemoveFromCart = ({ id }) => (
  <Mutation
    mutation={REMOVE_FROM_CART_MUTATION}
    variables={{ id }}
    update={update}
    optimisticResponse={{
      __typename: 'Mutation',
      removeFromCart: {
        __typename: 'CartItem',
        id,
      },
    }}
  >
    {(removeFromCart, { loading }) => (
      <BigButton
        disabled={loading}
        onClick={() => {
          removeFromCart()
            .catch(error => alert(error.message))
        }}
      >
        &times;
      </BigButton>
    )}
  </Mutation>
);

export default RemoveFromCart;
export { REMOVE_FROM_CART_MUTATION };
