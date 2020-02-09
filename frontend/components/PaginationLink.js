import React from 'react';
import Link from 'next/link';

const Pagination = props => {
  const { page, direction, disabled, children } = props;
  const directionClassName = direction > 0 ? 'next' : 'prev';

  return (
    <Link
      href={{
        pathname: 'items',
        query: {
          page: page + direction
        },
      }}
    >
      <a className={directionClassName} aria-disabled={disabled}>
        { children }
      </a>
    </Link>
  );
};

export default Pagination;
