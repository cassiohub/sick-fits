import wait from 'waait';
import { mount } from 'enzyme';
import Router from 'next/router';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from '@apollo/react-testing';

import { fakeItem } from '../../lib/testUtils';
import CreateItem, { CREATE_ITEM_MUTATION } from '../../components/CreateItem';

const dogImage = 'https://dog.com/dog.jpg';

global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }],
  }),
});

describe('Component', () => {
  describe('<CreateItem/>', () => {
    it('renders and matches snapshot', async () => {
      const wrapper = mount(
        <MockedProvider>
          <CreateItem />
        </MockedProvider>
      );

      const form = wrapper.find('form[data-test="form"]');
      expect(toJSON(form)).toMatchSnapshot();
    });

    it('uploads a file when changed', async () => {
      const wrapper = mount(
        <MockedProvider>
          <CreateItem />
        </MockedProvider>
      );

      wrapper
        .find('input[type="file"]')
        .simulate('change', { target: { files: ['fakedog.jpg'] } });

      await wait();

      const component = wrapper.find('CreateItem').instance();

      expect(component.state.image).toEqual(dogImage);
      expect(component.state.largeImage).toEqual(dogImage);
      expect(global.fetch).toHaveBeenCalled();

      global.fetch.mockReset();
    });

    it('handles state updating', async () => {
      const item = fakeItem();
      const wrapper = mount(
        <MockedProvider>
          <CreateItem />
        </MockedProvider>
      );

      wrapper
        .find('#title')
        .simulate('change', { target: { value: item.title, name: 'title' } });
      wrapper
        .find('#price')
        .simulate('change', { target: { value: item.price, name: 'price', type: 'number' } });
      wrapper
        .find('#description')
        .simulate('change', { target: { value: item.description, name: 'description' } });

      const component = wrapper.find('CreateItem').instance();

      expect(component.state).toMatchObject({
        title: item.title,
        price: item.price,
        description: item.description,
      });
    });

    it('creates an item when the form is submitted', async () => {
      const item = fakeItem();
      const mocks = [
        {
          request: {
            query: CREATE_ITEM_MUTATION,
            variables: {
              title: item.title,
              description: item.description,
              image: '',
              largeImage: '',
              price: item.price,
            },
          },
          result: {
            data: {
              createItem: {
                ...fakeItem,
                id: 'abc123',
                __typename: 'Item',
              },
            },
          },
        },
      ];

      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <CreateItem />
        </MockedProvider>
      );

      wrapper
        .find('#title')
        .simulate('change', { target: { value: item.title, name: 'title' } });
      wrapper
        .find('#price')
        .simulate('change', { target: { value: item.price, name: 'price', type: 'number' } });
      wrapper
        .find('#description')
        .simulate('change', { target: { value: item.description, name: 'description' } });

      Router.router = {
        push: jest.fn(),
      };

      wrapper
        .find('form')
        .simulate('submit');

      await wait(50);

      expect(Router.router.push).toHaveBeenCalled();
      expect(Router.router.push).toHaveBeenCalledWith({ pathname: '/item', query: { id: 'abc123' } });
    });
  });
});