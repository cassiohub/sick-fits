import React from 'react';
import Link from 'next/link';

import Title from './styles/Title';
import PriceTag from './styles/PriceTag';
import ItemStyles from './styles/ItemStyles';
import formatMoney from '../lib/formatMoney';

import AddToCart from '../components/AddToCart';
import DeleteItem from '../components/DeleteItem';

const Item = ({ item }) => (
  <ItemStyles>
    {item.image && <img src={item.image} alt={item.title} />}

    <Title>
      <Link href={{
        pathname: 'item',
        query: { id: item.id }
      }}>
        <a>{item.title}</a>
      </Link>
    </Title>

    <PriceTag>
      { formatMoney(item.price) }
    </PriceTag>

    <p>{item.description}</p>

    <div className="buttonList">
      <Link href={{
        pathname: 'update',
        query: { id: item.id },
      }}>
        <a>Edit</a>
      </Link>
      <AddToCart id={item.id} />
      <DeleteItem id={item.id}>
        Delete this Item
      </DeleteItem>
    </div>

  </ItemStyles>
);

export default Item;