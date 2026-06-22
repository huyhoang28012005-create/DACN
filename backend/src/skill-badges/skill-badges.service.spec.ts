import { Test, TestingModule } from '@nestjs/testing';
import { SkillBadgesService } from './skill-badges.service';

describe('SkillBadgesService', () => {
  let service: SkillBadgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillBadgesService],
    }).compile();

    service = module.get<SkillBadgesService>(SkillBadgesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
