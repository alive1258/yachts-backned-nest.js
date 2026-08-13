import { Test, TestingModule } from '@nestjs/testing';
import { BlogDetailsController } from './blog-details.controller';
import { BlogDetailsService } from './blog-details.service';

describe('BlogDetailsController', () => {
  let controller: BlogDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogDetailsController],
      providers: [BlogDetailsService],
    }).compile();

    controller = module.get<BlogDetailsController>(BlogDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
