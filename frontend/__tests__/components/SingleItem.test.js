import wait from 'waait';
import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from '@apollo/react-testing';

import { fakeItem } from '../../lib/testUtils';
import SingleItem, { SINGLE_ITEM_QUERY } from '../../components/SingleItem';

describe('Component', () => {
  describe('<SingleItem />', () => {
    it('renders with proper data', async () => {
      const mocks = [
        {
          request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' }},
          result: { data: { item: fakeItem() }},
        },
      ];

      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <SingleItem id={'123'} />
        </MockedProvider>
      );

      expect(wrapper.text()).toContain('Loading...');

      await wait();
      wrapper.update();

      expect(toJSON(wrapper.find('h2'))).toMatchSnapshot();
      expect(toJSON(wrapper.find('img'))).toMatchSnapshot();
      expect(toJSON(wrapper.find('p'))).toMatchSnapshot();
    });

    it('renders error message', async () => {
      const mocks = [
        {
          request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' }},
          result: {
            errors: [
              { message: 'Item not found' }
            ]
          },
        },
      ];

      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <SingleItem id={'123'} />
        </MockedProvider>
      );

      await wait();
      wrapper.update();

      const error = wrapper.find('[data-test="graphql-error"]');;
      expect(error.text()).toContain('Item not found');
      expect(toJSON(error)).toMatchSnapshot();
    });
  });
});