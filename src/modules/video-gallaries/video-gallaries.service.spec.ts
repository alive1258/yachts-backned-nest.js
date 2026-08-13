import { Test, TestingModule } from '@nestjs/testing';
import { VideoGallariesService } from './video-gallaries.service';

describe('VideoGallariesService', () => {
  let service: VideoGallariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoGallariesService],
    }).compile();

    service = module.get<VideoGallariesService>(VideoGallariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
