import { Item } from '../schemas/item.schema';

export const userOneId = 'user1';

export const productOne: Item = {
  productId: 'product1',
  name: 'Product 1',
  quantity: 1,
  price: 1,
  subTotalPrice: 1,
};

export const productTwo: Item = {
  productId: 'product2',
  name: 'Product 2',
  quantity: 2,
  price: 2,
  subTotalPrice: 4,
};

export const productThree: Item = {
  productId: 'product3',
  name: 'Product 3',
  quantity: 3,
  price: 3,
  subTotalPrice: 9,
};

export const arrayOfItems: Item[] = [productOne, productTwo];

export const userOneCartTotalPrice = 5;
