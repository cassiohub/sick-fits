import React from 'react';
import Router from 'next/router';
import nProgress from 'nprogress';
import StripeCheckout from 'react-stripe-checkout';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { stripePublicKey } from '../config';
import User, { CURRENT_USER_QUERY } from './User';
import calcTotalPrice from '../lib/calcTotalPrice';
import calcTotalQuantity from '../lib/calcTotalQuantity';

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

class TakeMyMoney extends React.Component {
  onToken = async ({ id: token }, createOrder) => {
    nProgress.start();

    const { data: { createOrder: order }} = await createOrder({
      variables: { token },
    }).catch(err => alert(err.message));

    Router.push({
      pathname: '/order',
      query: { id: order.id },
    });
  }

  render() {
    return (
      <User>
        {({ data: { me }, loading }) => {
          if (loading) return null;
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[
                { query: CURRENT_USER_QUERY },
              ]}
            >
              {(createOrder) => (
                <StripeCheckout
                  currency="USD"
                  name="Sick Fits"
                  email={me.email}
                  stripeKey={stripePublicKey}
                  amount={calcTotalPrice(me.cart)}
                  token={res => this.onToken(res, createOrder)}
                  description={`Order of ${calcTotalQuantity(me.cart)} items!`}
                  image={(((me.cart[0] || {})).item || {}).image}
                >
                  {this.props.children}
                </StripeCheckout>
              )}
            </Mutation>
          )
        }}
      </User>
    );
  }
}

export default TakeMyMoney;