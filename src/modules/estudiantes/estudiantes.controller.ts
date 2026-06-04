import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from '../../dtos/dto-estudiantes/create-estudiante.dto';
import { Estudiante } from './estudiante.entity';

@ApiTags('👩‍🎓 Estudiantes')
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @ApiOperation({
    summary: 'Crear un nuevo estudiante',
    description: 'Registra un estudiante con nombre, apellido y número de cédula único.',
  })
  @ApiCreatedResponse({
    description: 'Estudiante creado con éxito',
    type: Estudiante,
  })
  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateEstudianteDto): Promise<Estudiante> {
    return await this.estudiantesService.crear(dto);
  }

  @ApiOperation({
    summary: 'Obtener todos los estudiantes',
    description: 'Retorna la lista de estudiantes registrados.',
  })
  @ApiOkResponse({
    description: 'Lista de estudiantes obtenida correctamente',
    type: [Estudiante],
  })
  @Get()
  async obtenerTodos(): Promise<Estudiante[]> {
    return await this.estudiantesService.obtenerTodos();
  }
}
