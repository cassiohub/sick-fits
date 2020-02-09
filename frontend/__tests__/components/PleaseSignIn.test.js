import wait from 'waait';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/react-testing';

import { fakeUser } from '../../lib/testUtils';
import PleaseSignIn from '../../components/PleaseSignIn';
import { CURRENT_USER_QUERY } from '../../components/User';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } },
  },
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } },
  },
];

describe('Component', () => {
  describe('<PleaseSignIn/>', () => {
    it('renders the sign in dialog to logged out users', async () => {
      const wrapper = mount(
        <MockedProvider mocks={notSignedInMocks}>
          <PleaseSignIn />
        </MockedProvider>
      );

      await wait();
      wrapper.update();

      expect(wrapper.text()).toContain('Please Sign in to continue');

      const SignIn = wrapper.find('Signin');
      expect(SignIn.exists()).toBe(true);
    });

    it('renders the child component when the user is signed in', async () => {
      const Hey = () => <p>Hey!</p>;
      const wrapper = mount(
        <MockedProvider mocks={signedInMocks}>
          <PleaseSignIn>
            <Hey />
          </PleaseSignIn>
        </MockedProvider>
      );

      await wait();
      wrapper.update();

      expect(wrapper.contains(<Hey />)).toBe(true);
    });
  });
});