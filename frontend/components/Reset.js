import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      name
      email
    }
  }
`;

class Reset extends React.Component {
  defaultState = {
    password: '',
    confirmPassword: '',
  }

  state = this.defaultState

  handleChange = ({ target: { name, value }}) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = async (e, resetPassword) => {
    e.preventDefault();
    await resetPassword();

    this.setState(this.defaultState);
  }

  render () {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword,
        }}
        refetchQueries={[
          { query: CURRENT_USER_QUERY }
        ]}
      >
        {(resetPassword, { loading, error, data }) => (
          <Form onSubmit={e => this.handleSubmit(e, resetPassword)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset Your Password</h2>
              <ErrorMessage error={error} />

              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Reset!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Reset;
export { RESET_MUTATION };