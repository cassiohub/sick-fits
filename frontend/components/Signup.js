import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(email: $email, name: $name, password: $password) {
      id
      name
      email
    }
  }
`;

class Signup extends React.Component {
  defaultState = {
    email: '',
    name: '',
    password: '',
  }

  state = this.defaultState

  handleChange = ({ target: { name, value }}) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = async (e, signup) => {
    e.preventDefault();
    await signup();

    this.setState(this.defaultState);
  }

  render () {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[
          { query: CURRENT_USER_QUERY }
        ]}
      >
        {(signup, { loading, error, data }) => (
          <Form onSubmit={e => this.handleSubmit(e, signup)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for An Account</h2>
              <ErrorMessage error={error} />

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
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="name"
                  value={this.state.name}
                  onChange={this.handleChange}
                />
              </label>
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

              <button type="submit">Sign Up!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signup;
export { SIGNUP_MUTATION };