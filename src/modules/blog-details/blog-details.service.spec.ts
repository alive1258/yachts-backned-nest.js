import { Test, TestingModule } from '@nestjs/testing';
import { BlogDetailsService } from './blog-details.service';

describe('BlogDetailsService', () => {
  let service: BlogDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogDetailsService],
    }).compile();

    service = module.get<BlogDetailsService>(BlogDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
