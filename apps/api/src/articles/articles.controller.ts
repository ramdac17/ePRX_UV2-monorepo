import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  Get,
  Param 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ArticlesService } from './articles.service.js';

@Controller(['articles', "article"])
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get() 
  async findAll() {
    return this.articlesService.getLatestArticles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.getOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      // FIXED: Uses absolute pathing to ensure the file lands in apps/api/uploads
      destination: join(process.cwd(), 'uploads'), 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: any
  ) {
    // Debugging: Check the terminal to see if Multer sees the file
    console.log('UPLOAD_LOG: File received ->', file?.filename);

    return this.articlesService.create({
      ...body,
      image: file ? file.filename : null,
    });
  }
}