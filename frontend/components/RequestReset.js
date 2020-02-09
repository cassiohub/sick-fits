import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

class RequestReset extends React.Component {
  defaultState = {
    email: '',
  }

  state = this.defaultState

  handleChange = ({ target: { name, value }}) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = async (e, requestReset) => {
    e.preventDefault();
    await requestReset();

    this.setState(this.defaultState);
  }

  render () {
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={this.state}
      >
        {(requestReset, { loading, error, called }) => (
          <Form onSubmit={e => this.handleSubmit(e, requestReset)} data-test="form">
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>
              <ErrorMessage error={error} />

              {!error && !loading && called && (
                <p>Success! Check your e-mail.</p>
              )}

              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Request!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default RequestReset;
export { REQUEST_RESET_MUTATION };