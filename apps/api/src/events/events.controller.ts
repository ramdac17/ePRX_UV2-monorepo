import { 
  Controller, 
  Get, 
  Post,          // ADDED
  Body,          // ADDED
  Param, 
  NotFoundException, 
  UseInterceptors, // ADDED
  UploadedFile    // ADDED
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // ADDED
import { EventsService } from './events.service.js'; 
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller(['events', 'event'])
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // FIXED: The @Post route now has a function attached to it
 @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      // This ensures the file is physically saved in the uploads folder
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
    // Now 'file' will have a 'filename' property!
    // console.log('NEW_UPLOAD_LOG: File saved as ->', file?.filename);

    return this.eventsService.createEvent({
      ...body,
      image: file ? file.filename : null, // This will no longer be null
    });
  }
        
  @Get()
  async findAll() {
    const events = await this.eventsService.getEvents();
    if (!events) return [];
    return events;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.getEventById(id);
    if (!event) throw new NotFoundException(`EVENT_WITH_ID_${id}_NOT_FOUND`);
    return event;
  }
}