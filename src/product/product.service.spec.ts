import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product, ProductDocument } from './schemas/product.schema';
import { FilterProductDto } from './dtos/filter-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';

import { Model } from 'mongoose';

describe('ProductService', () => {
  const mockProductArray: Product[] = [
    {
      name: 'Product 1',
      description: 'Description 1',
      price: 1,
      category: 'Category 1',
    },
    {
      name: 'Product 2',
      description: 'Description 2',
      price: 2,
      category: 'Category 2',
    },
  ];
  const mockProductId = '6bfe7893odhes8tq';
  const createProductDto: CreateProductDto = {
    ...mockProductArray[0],
  };

  let productService: ProductService;
  let productModel: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken('Product'),
          useValue: {
            find: jest.fn().mockReturnThis(),
            findById: jest.fn().mockReturnThis(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>(getModelToken('Product'));
  });

  describe('getAllProducts', () => {
    it('should return an empty array if .find() returns no products', async () => {
      (productModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result: Product[] = await productService.getAllProducts();

      expect(result).toEqual([]);
      expect(productModel.find).toHaveBeenCalled();
      expect(productModel.find().exec).toHaveBeenCalled();
    });

    it('should return an array of products retrned by .find()', async () => {
      (productModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProductArray),
      });

      const result: Product[] = await productService.getAllProducts();

      expect(result).toEqual(mockProductArray);
      expect(productModel.find).toHaveBeenCalled();
      expect(productModel.find().exec).toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should return the product returned by .findById()', async () => {
      (productModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProductArray[0]),
      });

      const result: Product = await productService.getProduct(mockProductId);

      expect(result).toEqual(mockProductArray[0]);
      expect(productModel.findById).toHaveBeenCalled();
      expect(productModel.findById(mockProductId).exec).toHaveBeenCalled();
    });
  });

  describe('getFilteredProducts', () => {
    const filterProductDto: FilterProductDto = {
      search: 'Product 1',
      category: 'Category 1',
    };

    it('should return an empty array if .find() returns no products', async () => {
      (productModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result: Product[] = await productService.getFilteredProducts(
        filterProductDto,
      );

      expect(result).toEqual([]);
      expect(productModel.find).toHaveBeenCalled();
      expect(productModel.find().exec).toHaveBeenCalled();
    });

    it('should return an array of products returned by .find()', async () => {
      (productModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProductArray),
      });

      const result: Product[] = await productService.getFilteredProducts(
        filterProductDto,
      );

      expect(result).toEqual(mockProductArray);
      expect(productModel.find).toHaveBeenCalled();
      expect(productModel.find().exec).toHaveBeenCalled();
    });
  });

  describe('addProduct', () => {
    const newProduct: Product = { ...createProductDto };

    it('should create and return a new product', async () => {
      (productModel.create as jest.Mock).mockResolvedValueOnce(newProduct);

      const result: Product = await productService.addProduct(createProductDto);

      expect(result).toEqual(newProduct);
      expect(productModel.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('updateProduct', () => {
    it('should update and return a product with the given id', async () => {
      const updatedProduct: Product = { ...createProductDto };
      (productModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(
        updatedProduct,
      );

      const result: Product = await productService.updateProduct(
        mockProductId,
        createProductDto,
      );

      expect(result).toEqual(updatedProduct);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProductId,
        createProductDto,
        { new: true },
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product with the given id', async () => {
      const deletedProduct: Product = { ...mockProductArray[0] };
      (productModel.findByIdAndRemove as jest.Mock).mockResolvedValueOnce(
        deletedProduct,
      );

      const result: Product = await productService.deleteProduct(mockProductId);

      expect(result).toEqual({ ...mockProductArray[0] });
      expect(productModel.findByIdAndRemove).toHaveBeenCalledWith(
        mockProductId,
      );
    });
  });
});
