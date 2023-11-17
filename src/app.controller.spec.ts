import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { RabinService } from './rabin/rabin.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [RabinService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "OK"', () => {
      expect(appController.healthCheck()).toBe('OK');
    });
  });
});
