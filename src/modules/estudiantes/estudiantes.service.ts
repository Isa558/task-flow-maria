import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { CreateEstudianteDto } from '../../dtos/dto-estudiantes/create-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudiantesRepository: Repository<Estudiante>,
  ) {}

  async crear(dto: CreateEstudianteDto): Promise<Estudiante> {
    const estudiante = this.estudiantesRepository.create(dto);
    return await this.estudiantesRepository.save(estudiante);
  }

  async obtenerTodos(): Promise<Estudiante[]> {
    return await this.estudiantesRepository.find();
  }
}
