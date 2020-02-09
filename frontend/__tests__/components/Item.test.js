import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';

import Item from '../../components/Item';
import { fakeItem } from '../../lib/testUtils';

describe('Component', () => {
  describe('<Item />', () => {
    const item = fakeItem();

    it('renders the image properly', () => {
      const wrapper = shallow(<Item item={item} />);
      const img = wrapper.find('img');

      expect(img.props().src).toBe(item.image);
      expect(img.props().alt).toBe(item.title);
    });

    it('renders the pricetag and title', () => {
      const wrapper = shallow(<Item item={item} />);
      const PriceTag = wrapper.find('PriceTag');

      expect(PriceTag.children().text()).toBe('$50');
      expect(wrapper.find('Title a').text()).toBe(item.title);
    });

    it('renders out the buttons properly', () => {
      const wrapper = shallow(<Item item={item} />);
      const buttonList = wrapper.find('.buttonList');

      expect(buttonList.children()).toHaveLength(3);
      expect(buttonList.find('Link')).toHaveLength(1);
      expect(buttonList.find('AddToCart').exists()).toBe(true);
      expect(buttonList.find('DeleteItem').exists()).toBe(true);
    });

    it('renders and matches the snapshot', () => {
      const wrapper = shallow(<Item item={item} />);

      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});