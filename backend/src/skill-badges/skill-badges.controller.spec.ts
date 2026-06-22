import { Test, TestingModule } from '@nestjs/testing';
import { SkillBadgesController } from './skill-badges.controller';

describe('SkillBadgesController', () => {
  let controller: SkillBadgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillBadgesController],
    }).compile();

    controller = module.get<SkillBadgesController>(SkillBadgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
