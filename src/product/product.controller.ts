import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FilterProductDto } from './dtos/filter-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';

@Controller('store/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/')
  async getProducts(@Query() filterProductDto: FilterProductDto) {
    return Object.keys(filterProductDto).length
      ? await this.productService.getFilteredProducts(filterProductDto)
      : await this.productService.getAllProducts();
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    try {
      return await this.productService.getProduct(id);
    } catch {
      this.throwNotFoundException();
    }
  }

  @Post('/')
  async addProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.addProduct(createProductDto);
  }

  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    try {
      return await this.productService.updateProduct(id, createProductDto);
    } catch {
      this.throwNotFoundException();
    }
  }

  @Delete('/:id')
  async deteleProduct(@Param('id') id: string) {
    try {
      return await this.productService.deleteProduct(id);
    } catch {
      this.throwNotFoundException();
    }
  }

  private throwNotFoundException() {
    throw new NotFoundException('Product does not exist!');
  }
}
