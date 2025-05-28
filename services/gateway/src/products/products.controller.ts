import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@ApiTags('Products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Roles(Role.IC, Role.Agent)
  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({ status: 200, description: 'Returns a list of products' })
  async findAll(@Query('skip') skip = 0, @Query('limit') limit = 10) {
    return this.productsService.findAll(skip, limit);
  }

  @Roles(Role.IC, Role.Agent)
  @Get(':product_id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('product_id') product_id: string) {
    return this.productsService.findOne(product_id);
  }

  @Roles(Role.IC, Role.Agent)
  @Get(':company_id')
  @ApiOperation({ summary: 'Get products by company ID' })
  @ApiResponse({ status: 200, description: 'Returns a single product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async finAllByCompanyId(@Param('company_id') company_id: number) {
    return this.productsService.findAllByCompanyId(company_id);
  }

  @Roles(Role.IC, Role.Agent)
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() productCreateDto: any) {
    return this.productsService.create(productCreateDto);
  }

  @Roles(Role.IC, Role.Agent)
  @Put(':product_id')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('product_id') product_id: string, @Body() productUpdateDto: any) {
    return this.productsService.update(product_id, productUpdateDto);
  }

  @Roles(Role.IC, Role.Agent)
  @Post(':product_id/calculate-premium')
  @ApiOperation({ summary: 'Calculate premium for a product' })
  @ApiResponse({ status: 200, description: 'Premium calculated successfully' })
  async calculatePremium(
    @Param('product_id') product_id: string,
    @Query('zone_id') zone_id: string,
    @Query('fiscal_year') fiscal_year: string,
    @Query('period_id') period_id: string,
    @Query('growing_season_id') growing_season_id: string,
  ) {
    return this.productsService.calculatePremium(product_id, zone_id, fiscal_year, period_id, growing_season_id);
  }

  @Roles(Role.IC, Role.Agent)
  @Post('/excel/upload_excel')
  @ApiOperation({ summary: 'Upload excel file for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('growing_season_id') growing_season_id: string,
    @Query('force') force: boolean,
  ) {
    return this.productsService.uploadExcel(file, growing_season_id, force);
  }

  @Roles(Role.IC, Role.Agent)
  @Post('/upload_ndvi')
  @ApiOperation({ summary: 'Upload NDVI data for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadNdvi(
    @UploadedFile() file: Express.Multer.File,
    @Query('period') period: string,
    @Query('ndvi_type') ndvi_type: string,
  ) {
    return this.productsService.uploadNdvi(file, period, ndvi_type);
  }
}
