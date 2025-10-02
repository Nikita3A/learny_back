import { Injectable, Inject } from '@nestjs/common';
import { OpenAI } from 'openai';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  constructor(
    @Inject('GROQ_CLIENT') private readonly groqClient: Groq,
    @Inject('OPENAI_API') private readonly openai: OpenAI, // Injecting OpenAI instance
  ) {}

  async generateWithOpenAI(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0]?.message?.content || 'No response from OpenAI';
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      throw new Error('Failed to generate response using OpenAI');
    }
  }

  async generateWithGroq(prompt: string, model = 'llama-3.1-8b-instant'): Promise<string> {
    try {
      const response = await this.groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model, // Specify the model
      });

      // Extract the AI response from the returned object
      return response.choices[0]?.message?.content || 'No response from Groq';
    } catch (error) {
      console.error('Error with Groq API:', error);
      throw new Error('Failed to generate response using Groq');
    }
  }
}
