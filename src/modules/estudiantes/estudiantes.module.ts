import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './estudiante.entity';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesController } from './estudiantes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante])],
  providers: [EstudiantesService],
  controllers: [EstudiantesController],
})
export class EstudiantesModule {}
