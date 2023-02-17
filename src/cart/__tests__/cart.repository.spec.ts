import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CartRepository } from '../cart.repository';
import { Cart, CartDocument } from '../schemas/cart.schema';
import * as testData from './cart.testing-fixtures';

describe('CartRepository', () => {
  const userOneCart: Cart = {
    userId: testData.userOneId,
    items: testData.arrayOfItems,
    totalPrice: testData.userOneCartTotalPrice,
  };

  let cartRepository: CartRepository;
  let cartModel: Model<CartDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        {
          provide: getModelToken('Cart'),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            create: jest.fn(),
            findOneAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    cartRepository = module.get<CartRepository>(CartRepository);
    cartModel = module.get<Model<CartDocument>>(getModelToken('Cart'));
  });

  describe('getCart', () => {
    it('should return null if .findOne returns no match', async () => {
      (cartModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result: Cart = await cartRepository.getCart(testData.userOneId);

      // Assert
      expect(result).toBeNull();
      expect(cartModel.findOne).toHaveBeenCalledTimes(1);
      expect(cartModel.findOne).toHaveBeenCalledWith({
        userId: testData.userOneId,
      });
    });

    it('should return cart if .findOne returns a match', async () => {
      (cartModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(userOneCart),
      });

      // Act
      const result: Cart = await cartRepository.getCart(testData.userOneId);

      // Assert
      expect(result).toEqual(userOneCart);
      expect(cartModel.findOne).toHaveBeenCalledTimes(1);
      expect(cartModel.findOne).toHaveBeenCalledWith({
        userId: testData.userOneId,
      });
    });
  });

  describe('createCart', () => {
    it('should create cart', async () => {
      // Arrange
      (cartModel.create as jest.Mock).mockReturnValue(userOneCart);

      // Act
      const result: Cart = await cartRepository.createCart(
        testData.userOneId,
        testData.arrayOfItems,
        testData.userOneCartTotalPrice,
      );

      // Assert
      expect(result).toEqual(userOneCart);
      expect(cartModel.create).toHaveBeenCalledTimes(1);
      expect(cartModel.create).toHaveBeenCalledWith(userOneCart);
    });
  });

  describe('deleteCart', () => {
    it('should return null if .findOneAndRemove returns no match', async () => {
      // Arrange
      (cartModel.findOneAndRemove as jest.Mock).mockReturnValue(null);

      // Act
      const result: Cart = await cartRepository.deleteCart(testData.userOneId);

      // Assert
      expect(result).toBeNull();
      expect(cartModel.findOneAndRemove).toHaveBeenCalledTimes(1);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledWith({
        userId: testData.userOneId,
      });
    });

    it('should delete cart if .findOneAndRemove returns a match', async () => {
      // Arrange
      (cartModel.findOneAndRemove as jest.Mock).mockReturnValue(userOneCart);

      // Act
      const result: Cart = await cartRepository.deleteCart(testData.userOneId);

      // Assert
      expect(result).toEqual(userOneCart);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledTimes(1);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledWith({
        userId: testData.userOneId,
      });
    });
  });
});
