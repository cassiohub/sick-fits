import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import Router from 'next/router';

import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      data: {
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

class CreateItem extends React.Component {
  state = {
    title: '',
    image: '',
    price: 0,
    largeImage: '',
    description: '',
  }

  handleChange = ({ target: { name, value, type }}) => {
    const val = type === 'number'
      ? parseFloat(value)
      : value;

    this.setState({
      [name]: val,
    });
  }

  handleSubmit = async (e, createItem) => {
    e.preventDefault();

    const res = await createItem();
    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id },
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
      <Mutation
        mutation={CREATE_ITEM_MUTATION}
        variables={this.state}
      >
        {(createItem, { loading, error }) => (
          <Form onSubmit={e => this.handleSubmit(e, createItem)} data-test="form">
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
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
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
                  required
                  onChange={this.uploadImage}
                />
              </label>

              {this.state.image &&
                <p><img width={200} src={this.state.image} alt="Preview" /></p>
              }

              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };