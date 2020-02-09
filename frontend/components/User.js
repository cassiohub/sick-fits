import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      name
      email
      permissions
      orders {
        id
      }
      cart {
        id
        quantity
        item {
          id
          title
          price
          image
          description
        }
      }
    }
  }
`;

const User = props => (
  <Query
    query={CURRENT_USER_QUERY}
    { ...props }
  >
    {payload => props.children(payload)}
  </Query>
);

User.prototype = {
  children: PropTypes.func.isRequired,
};

export default User;
export { CURRENT_USER_QUERY };