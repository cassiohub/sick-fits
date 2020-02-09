import React from 'react';
import styled from 'styled-components';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Item from '../components/Item';
import Pagination from '../components/Pagination';

import { perPage } from '../config';

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

const Items = props => (
  <Center>
    <Pagination page={props.page} />
    <Query
      query={ALL_ITEMS_QUERY}
      variables={{
        skip: props.page * perPage - perPage,
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading</p>
        if (error) return <p>Error {error.message}</p>

        return (
          <ItemsList>
            {data.items.map(item => <Item item={item} key={item.id} />)}
          </ItemsList>
        );
      }}
    </Query>
    <Pagination page={props.page} />
  </Center>
);

export default Items;
export { ALL_ITEMS_QUERY };
