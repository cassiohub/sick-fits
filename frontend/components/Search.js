import React from 'react';
import Router from 'next/router';
import Downshift, { resetIdCounter } from 'downshift';
import debounce from 'lodash/debounce';

import gql from 'graphql-tag';
import { ApolloConsumer } from 'react-apollo';

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEM_QUERY = gql`
  query SEARCH_ITEM_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm }
        { description_contains: $searchTerm }
      ]
    }) {
      id
      title
      image
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  })
}

function itemToString(item) {
  return (item || {}).title || ''
}

class Search extends React.Component {
  state = {
    items: [],
    loading: false,
  }

  onChange = debounce(async (e, client) => {
    this.setState({
      loading: true,
    });

    const { data: { items }} = await client.query({
      query: SEARCH_ITEM_QUERY,
      variables: { searchTerm: e.target.value },
    });

    this.setState({
      items,
      loading: false,
    });
  }, 350)

  render() {
    resetIdCounter();

    return (
      <Downshift onChange={routeToItem} itemToString={itemToString}>
        {({getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
          <div>
            <ApolloConsumer>
              {(client) => (
                <SearchStyles>
                  <input
                    {...getInputProps({
                      id: 'search',
                      type: 'search',
                      placeholder: 'Search For An Item',
                      className: this.state.loading ? 'loading' : '',
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      },
                    })}
                  />

                  {isOpen && (
                    <DropDown>
                      { this.state.items.map((item, index) => (
                        <DropDownItem
                          key={item.id}
                          highlighted={index === highlightedIndex}
                          {...getItemProps({ item })}
                        >
                          <img width="50" src={item.image} alt={item.title} />
                          {item.title}
                        </DropDownItem>
                      ))}

                      {!this.state.items.length && !this.state.loading && (
                        <DropDownItem> Nothing Found {inputValue}</DropDownItem>
                      )}
                    </DropDown>
                  )}
                </SearchStyles>
              )}
            </ApolloConsumer>
          </div>
        )}
      </Downshift>
    );
  }
}

export default Search;