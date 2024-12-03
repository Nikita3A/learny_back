import { IsOptional, IsString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLessonDto {
  @IsOptional()
  @IsInt()
  id?: number; // Додаємо поле id для ідентифікації уроків

  @IsString()
  title: string;
}

export class UpdateUnitDto {
  @IsOptional()
  @IsInt()
  id?: number; // Додаємо поле id для ідентифікації юнітів

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLessonDto)
  lessons: UpdateLessonDto[];
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  learningObjectives?: string;

  @IsOptional()
  @IsString()
  courseStructure?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUnitDto)
  units?: UpdateUnitDto[];
}
