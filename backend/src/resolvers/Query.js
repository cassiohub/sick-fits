const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),

  async items(parent, args, ctx, info) {
    const items = await ctx.db.query.items(args);
    return items;
  },

  async me(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (!userId) {
      return null;
    }

    return ctx.db.query.user({
      where: { id: userId }
    }, info);
  },

  async users(parent, args, ctx, info) {
    const { user } = ctx.request;
    if (!user) {
      throw new Error(`You must be logged in`);
    }

    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE']);

    const users = await ctx.db.query.users({}, info);
    return users;
  },

  async order(parent, args, ctx, info) {
    const { user } = ctx.request;

    const order = await ctx.db.query.order({
      where: { id: args.id }
    }, info);

    if (!order) {
      throw new Error('Order not found');
    }

    const ownsOrder = order.user.id === user.id;
    const hasPermissionToSeeOrders = user.permissions.includes('ADMIN');

    if (!ownsOrder && !hasPermissionToSeeOrders) {
      throw new Error('Unauthorized');
    }

    return order;
  },

  async orders(parent, args, ctx, info) {
    const { user } = ctx.request;

    return ctx.db.query.orders({
      where: { user: { id: user.id }}
    }, info);
  },
};

module.exports = Query;
