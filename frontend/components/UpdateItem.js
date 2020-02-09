import React from 'react';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import Router from 'next/router';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      price
      image
      description
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      data: {
        id: $id
        title: $title
        description: $description
        price: $price
        image: $image
        largeImage: $largeImage
      }
    ) {
      id
    }
  }
`;

class UpdateItem extends React.Component {
  state = {}

  handleChange = ({ target: { name, value, type }}) => {
    const val = type === 'number'
      ? parseFloat(value)
      : value;

    this.setState({
      [name]: val,
    });
  }

  handleSubmit = async (e, updateItem) => {
    e.preventDefault();

    const res = await updateItem({
      variables: {
        id: this.props.id,
        ...this.state,
      },
    });
    Router.push({
      pathname: '/item',
      query: { id: res.data.updateItem.id },
    });
  }

  uploadImage = async (e) => {
    const { files } = e.target;

    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/sickfits/image/upload',
      {
        method: 'POST',
        body: data,
      },
    );

    const file = await res.json();

    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    });
  }

  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{
          id: this.props.id
        }}
      >
        {({error, data = {}}) => {
          if (error || !data.item) {
            return <ErrorMessage error={error || { message: 'Item not found' }} />
          }

          return (
            <Mutation
              mutation={UPDATE_ITEM_MUTATION}
              variables={this.state}
            >
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.handleSubmit(e, updateItem)}>
                  <fieldset disabled={loading} aria-busy={loading}>
                    <ErrorMessage error={error} />

                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter A Description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="image">
                      Image
                      <input
                        type="file"
                        id="image"
                        name="image"
                        placeholder="Upload Image"
                        onChange={this.uploadImage}
                      />
                    </label>

                    {(data.item || this.state || {}).image &&
                      <p><img width={200} src={(data.item || this.state || {}).image} alt="Preview" /></p>
                    }

                    <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION, SINGLE_ITEM_QUERY };