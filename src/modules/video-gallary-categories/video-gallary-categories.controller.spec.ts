import { Test, TestingModule } from '@nestjs/testing';
import { VideoGallaryCategoriesController } from './video-gallary-categories.controller';
import { VideoGallaryCategoriesService } from './video-gallary-categories.service';

describe('VideoGallaryCategoriesController', () => {
  let controller: VideoGallaryCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoGallaryCategoriesController],
      providers: [VideoGallaryCategoriesService],
    }).compile();

    controller = module.get<VideoGallaryCategoriesController>(VideoGallaryCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
