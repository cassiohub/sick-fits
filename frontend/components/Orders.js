import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { formatDistance } from 'date-fns';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import ErrorMessage from './ErrorMessage';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';


const List = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        image
        quantity
        description
      }
    }
  }
`;

const OrderList = () => (
  <Query query={USER_ORDERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading || !data) return <p>Loading...</p>;
      if (error) return <ErrorMessage error={error} />;
      const { orders } = data;

      return (
        <div>
          <h2>You have {orders.length} orders</h2>
          <List>
            {orders.map(order => (
              <OrderItemStyles key={order.id}>
                <Link
                  href={{
                    pathname: '/order',
                    query: { id: order.id },
                  }}
                >
                  <a>
                    <div className="order-meta">
                      <p>{order.items.reduce((a, b) => a + b.quantity, 0)} Items</p>
                      <p>{order.items.length} Products</p>
                      <p>{formatDistance(order.createdAt, new Date())}</p>
                      <p>{formatMoney(order.total)}</p>
                    </div>
                    <div className="images">
                      {order.items.map(item => (
                        <img key={item.id} src={item.image} alt={item.title} />
                      ))}
                    </div>
                  </a>
                </Link>
              </OrderItemStyles>
            ))}
          </List>
        </div>
      );
    }}
  </Query>

);


export default OrderList;
export { USER_ORDERS_QUERY };