import wait from 'waait';
import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from '@apollo/react-testing';

import RequestReset, { REQUEST_RESET_MUTATION } from '../../components/RequestReset';

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: 'user@email.com' },
    },
    result: {
      data: { requestReset: { message: 'success', __typename: 'Message' } },
    },
  },
];

describe('Component', () => {
  describe('<RequestReset/>', () => {
    it('renders and matches snapshot', async () => {
      const wrapper = mount(
        <MockedProvider>
          <RequestReset />
        </MockedProvider>
      );

      const form = wrapper.find('form[data-test="form"]');
      expect(toJSON(form)).toMatchSnapshot();
    });

    it('calls the mutation', async () => {
      const wrapper = mount(
        <MockedProvider mocks={mocks}>
          <RequestReset />
        </MockedProvider>
      );

      // simulate typing an email
      wrapper
        .find('input')
        .simulate('change', { target: { name: 'email', value: 'user@email.com' } });

      await wait();
      wrapper.update();

      // submit the form
      wrapper
        .find('form[data-test="form"]')
        .simulate('submit');

      await wait();
      wrapper.update();

      expect(wrapper.find('p').text()).toContain('Success! Check your e-mail.');
    });
  });
});