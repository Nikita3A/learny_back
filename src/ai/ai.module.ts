import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { AiService } from './ai.service';
import Groq from 'groq-sdk';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'GROQ_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Groq({
          apiKey: config.get('GROQ_API_KEY'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'OPENAI_API',
      useFactory: (cfg: ConfigService) => {
        return new OpenAI({
          apiKey: cfg.get('OPENAI_API_KEY'),
        });
      },
      inject: [ConfigService],
    },
    AiService,
  ],
  exports: ['OPENAI_API', AiService],
})
export class AiModule {}
