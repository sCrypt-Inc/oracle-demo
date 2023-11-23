import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { SigService } from './rabin/sig.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [SigService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "OK"', () => {
      expect(appController.healthCheck()).toBe('OK');
    });
  });
});
