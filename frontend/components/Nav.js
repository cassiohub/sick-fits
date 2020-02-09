import Link from 'next/link';
import { Mutation } from 'react-apollo';

import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';

import { TOGGLE_CART_MUTATION } from './Cart';

import NavStyles from './styles/NavStyles';
import calcTotalQuantity from '../lib/calcTotalQuantity';

const Nav = () => (
  <User>
    {({ data }) => (
      <NavStyles data-test="nav">
        <Link href="/items">
          <a>Shop</a>
        </Link>

        {data && data.me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation
              mutation={TOGGLE_CART_MUTATION}
            >
              {toggleCart => (
                <button onClick={toggleCart}>
                  My Cart
                  {data && data.me && (
                    <CartCount count={calcTotalQuantity(data.me.cart)}></CartCount>
                  )}
                </button>
              )}
            </Mutation>
          </>
        )}

        {data && !data.me && (
          <Link href="/signup">
            <a>Signup</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;