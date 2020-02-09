import React from 'react';
import Head from 'next/head';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import PaginationLink from './PaginationLink';
import PaginationStyles from './styles/PaginationStyles';

import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query
    query={PAGINATION_QUERY}
  >
    {({ error, loading, data }) => {
      if (error) return null
      if (loading || !data) return <p>Loading...</p>;

      const { page } = props;
      const { count } = data.itemsConnection.aggregate;
      const pages = Math.ceil(count / perPage);

      return (
        <PaginationStyles data-test="pagination">
          <Head>
            <title>
              Sick Fits! — Page {page} of {pages}
            </title>
          </Head>

          <PaginationLink page={page} direction={-1} disabled={page <= 1 }>
            ← Prev
          </PaginationLink>

          <p>Page {props.page} of <span className="totalPages">{pages}</span>!</p>
          <p>{count} Items Total</p>

          <PaginationLink page={page} direction={1} disabled={page >= pages }>
            Next →
          </PaginationLink>
        </PaginationStyles>
      );
    }}
  </Query>
);

export default Pagination;
export { PAGINATION_QUERY };