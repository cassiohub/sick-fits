import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_USER_MUTATION {
    signout {
      message
    }
  }
`;

const Signout = props => (
  <Mutation
    mutation={SIGNOUT_MUTATION}
    refetchQueries={[
      { query: CURRENT_USER_QUERY },
    ]}
  >
    {signout => (
      <button onClick={signout}>
        Sign out
      </button>
    )}
  </Mutation>
);

export default Signout;
export { SIGNOUT_MUTATION };