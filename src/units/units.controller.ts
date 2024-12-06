import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dtos/create-unit.dto';
// import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('courses/:courseId/units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post('/')
  async createUnit(
    @Param('courseId') courseId: number,
    @Body() userPrompt: string,
  ) {
    return this.unitsService.createUnit(courseId, userPrompt);
  }

  @Get('/')
  async getUnits(@Param('courseId') courseId: number) {
    return this.unitsService.getUnitsByCourse(courseId);
  }

  @Get('/:id')
  async getUnitById(@Param('id') id: number) {
    return this.unitsService.getUnitById(id);
  }

//   @Put('/:id')
//   async updateUnit(
//     @Param('id') id: number,
//     @Body() updateUnitDto: UpdateUnitDto,
//   ) {
//     return this.unitsService.updateUnit(id, updateUnitDto);
//   }

  @Delete('/:id')
  async deleteUnit(@Param('id') id: number) {
    return this.unitsService.deleteUnit(id);
  }
}
