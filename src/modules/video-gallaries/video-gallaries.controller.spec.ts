import { Test, TestingModule } from '@nestjs/testing';
import { VideoGallariesController } from './video-gallaries.controller';
import { VideoGallariesService } from './video-gallaries.service';

describe('VideoGallariesController', () => {
  let controller: VideoGallariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoGallariesController],
      providers: [VideoGallariesService],
    }).compile();

    controller = module.get<VideoGallariesController>(VideoGallariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
