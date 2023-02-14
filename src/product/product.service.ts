import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { FilterProductDto } from './dtos/filter-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productModel.find().exec();
  }

  async getProduct(id: string): Promise<Product> {
    return await this.productModel.findById(id).exec();
  }

  async getFilteredProducts(
    filterProductDto: FilterProductDto,
  ): Promise<Product[]> {
    type FilterParam<T extends string> = {
      [P in T]: {
        $regex: string;
        $options: string;
      };
    };

    const { category, search } = filterProductDto;
    const queries: (
      | FilterParam<'name'>
      | FilterParam<'description'>
      | FilterParam<'category'>
    )[] = [];

    if (search) {
      queries.push(
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      );
    }

    if (category) {
      queries.push({ category: { $regex: category, $options: 'i' } });
    }

    return this.productModel.find({ $or: queries }).exec();
  }

  async addProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productModel.create(createProductDto);
  }

  async updateProduct(
    id: string,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productModel.findByIdAndUpdate(id, createProductDto, {
      new: true,
    });
  }

  async deleteProduct(id: string): Promise<any> {
    return await this.productModel.findByIdAndRemove(id);
  }
}
