import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Router from 'next/router';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

class Signin extends React.Component {
  defaultState = {
    email: '',
    password: '',
  }

  state = this.defaultState

  handleChange = ({ target: { name, value }}) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = async (e, signin) => {
    e.preventDefault();

    const { data } = await signin();
    if (data.signin.id) {
      Router.push('/');
    }

    this.setState(this.defaultState);
  }

  render () {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[
          { query: CURRENT_USER_QUERY }
        ]}
      >
        {(signin, { loading, error, data }) => (
          <Form onSubmit={e => this.handleSubmit(e, signin)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign into your Account</h2>
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

              <button type="submit">Sign In!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signin;
export { SIGNIN_MUTATION };