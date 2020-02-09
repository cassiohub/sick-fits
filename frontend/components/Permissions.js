import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import Table from './styles/Table';
import SickButton from './styles/SickButton';

import ErrorMessage from './ErrorMessage';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USER_QUERY = gql`
  query ALL_USER_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query
    query={ALL_USER_QUERY}
  >
    {({ loading, error, data }) => (
      <div>
        <ErrorMessage error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                <th>👇🏻</th>
              </tr>
            </thead>
            <tbody>{(data.users || []).map(user => <UserPermission user={user} key={user.id} />)}</tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermission extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    permissions: this.props.user.permissions,
  }

  handlePermissionChange = ({ target: { value, checked }}) => {
    let permissions = [...this.state.permissions];

    if (checked) {
      permissions.push(value);
    } else {
      permissions = permissions.filter(permission => permission !== value);
    }

    this.setState({
      permissions,
    });
  }

  render() {
    const { user } = this.props;

    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          userId: user.id,
          permissions: this.state.permissions,
        }}
      >
        {(updatePermissions, { loading, error }) => (
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {possiblePermissions.map(permission => (
              <td key={permission}>
                <label htmlFor={`${user.id}-permission-${permission}`}>
                  <input
                    type="checkbox"
                    value={permission}
                    onChange={this.handlePermissionChange}
                    id={`${user.id}-permission-${permission}`}
                    checked={this.state.permissions.includes(permission)}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton
                type="button"
                disabled={loading}
                onClick={updatePermissions}
              >
                Updat{loading ? 'ing' : 'e'}
              </SickButton>
            </td>
          </tr>
        )}
      </Mutation>
    );
  }
}

export default Permissions;
export { ALL_USER_QUERY };