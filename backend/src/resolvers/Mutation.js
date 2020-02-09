const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { randomBytes } = require('crypto');
const { promisify } = require('util');
const randomBytesPromisified = promisify(randomBytes);

const stripe = require('../stripe');
const { hasPermission } = require('../utils');
const { transport, makeANiceEmail } = require('../mail');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    const { user } = ctx.request;
    if (!user) {
      throw new Error(`You must be logged in`);
    }

    const item = await ctx.db.mutation.createItem({
      data: {
        user: {
          connect: {
            id: user.id,
          }
        },
        ...args.data,
      },
    }, info);

    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const { data: { id, ...data }} = args;

    return ctx.db.mutation.updateItem({
      data,
      where: {
        id
      }
    }, info);
  },

  async deleteItem(parent, args, ctx, info) {
    const { user } = ctx.request;

    const where = { id: args.data.id };
    const item = await ctx.db.query.item(
      { where },
      '{ id user { id }}'
    );

    if (!item) {
      return null;
    }

    const ownsItem = item.user.id === user.id;
    const hasPermission = ctx.request.user.permissions.some(
      permission => ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to do that!");
    }

    return ctx.db.mutation.deleteItem(
      {
        where
      },
      info
    );
  },

  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10);
    const newUser = {
      ...args,
      password,
      email: args.email.toLowerCase(),
      permissions: { set: ['USER'] },
    };

    const user = await ctx.db.mutation.createUser(
      { data: newUser },
      info,
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return user;
  },

  async signin(parent, args, ctx, info) {
    const { email, password } = args;

    const user = await ctx.db.query.user({ where: { email }});
    if (!user) {
      throw new Error(`Not user found with email ${emai}`);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return user;
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  async requestReset(parent, args, ctx, info) {
    const { email } = args;

    const user = await ctx.db.query.user({ where: { email }});
    if (!user) {
      throw new Error(`Not user found with email ${emai}`);
    }

    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + (1000 * 60 * 60);

    await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}`;
    const mailResponse = await transport.sendMail({
      from: 'cassio@email.com',
      to: user.email,
      subject: 'Reset Your Password',
      html: makeANiceEmail(`
        <p>
          <a href="${resetLink}">Click here to reset your password!</a>
        </p>
      `)
    });

    return { message: "Reset Process Initiated" };
  },

  async resetPassword(parent, args, ctx, info) {
    const { password, confirmPassword, resetToken } = args;

    if (password !== confirmPassword) {
      throw new Error("Yo Passwords don't match!");
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - (1000 * 60 * 60),
      },
    });

    if (!user) {
      throw new Error("This token is either invalid or expired!");
    }

    const newPassword = await bcrypt.hash(password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    const { user } = ctx.request;
    if (!user) {
      throw new Error(`You must be logged in`);
    }

    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser({
      where: { id: args.userId },
      data: { permissions: { set: args.permissions }},
    }, info);
  },

  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if(!userId) {
      throw new Error('You must be logged in');
    }

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });

    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + 1,
        },
      }, info);
    }

    return ctx.db.mutation.createCartItem({
      data: {
        user: { connect: { id: userId }},
        item: { connect: { id: args.id }},
      },
    }, info);
  },

  async removeFromCart(parent, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id,
      },
    }, '{ id user { id } }');

    if (!cartItem) {
      throw new Error('Cart Item not found');
    }

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('Cart Item doesnt belongs to you');
    }

    return ctx.db.mutation.deleteCartItem({
      where: {
        id: cartItem.id,
      }
    }, info);
  },

  async createOrder(parent, args, ctx, info) {
    const { user } = ctx.request;
    if(!user) {
      throw new Error('You must be logged in');
    }

    const amount = user.cart.reduce((tally, cartItem) => (
      tally + cartItem.item.price * cartItem.quantity
    ), 0);

    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });

    const orderItems = user.cart.map(({ item: { id, ...item }, quantity }) => ({
      ...item,
      quantity,
      user: { connect: { id: user.id }},
    }));

    const order = await ctx.db.mutation.createOrder({
      data: {
        charge: charge.id,
        total: charge.amount,
        items: { create: orderItems },
        user: { connect: { id: user.id }},
      }
    });

    const cartItemsIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemsIds,
      },
    });

    return order;
  },
};

module.exports = Mutations;
