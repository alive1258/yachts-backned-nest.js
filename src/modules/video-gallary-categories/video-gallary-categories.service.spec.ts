import { Test, TestingModule } from '@nestjs/testing';
import { VideoGallaryCategoriesService } from './video-gallary-categories.service';

describe('VideoGallaryCategoriesService', () => {
  let service: VideoGallaryCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoGallaryCategoriesService],
    }).compile();

    service = module.get<VideoGallaryCategoriesService>(VideoGallaryCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
