import wait from 'waait';
import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from '@apollo/react-testing';

import { fakeOrder } from '../../lib/testUtils';
import Order, { SINGLE_ORDER_QUERY } from '../../components/Order';

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: 'ord123' } },
    result: { data: { order: fakeOrder() } },
  },
];

describe('Component', () => {
  describe('<Order/>', () => {
    it('renders the order', async () => {
      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <Order id="ord123" />
        </MockedProvider>
      );

      await wait();
      wrapper.update();

      const order = wrapper.find('div[data-test="order"]');
      expect(toJSON(order)).toMatchSnapshot();
    });
  });
});