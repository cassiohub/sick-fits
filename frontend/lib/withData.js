import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { devEndpoint, prodEndpoint } from '../config';

import { LOCAL_STATE_QUERY } from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? devEndpoint : prodEndpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart: (_, variables, state) => {
            const { cache } = state;
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            });

            const newState = {
              data: { cartOpen: !cartOpen, },
            };

            cache.writeData(newState);

            return newState;
          }
        }
      },
      defaults: {
        cartOpen: false,
      },
    }
  });
}

export default withApollo(createClient);
